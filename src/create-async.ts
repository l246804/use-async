import type { AnyFn, SetRequired } from '@rhao/types-base'
import type { ExecuteContext } from './context'
import type { UseAsyncHookable } from './hooks'
import type { CreateAsyncOptions, UseAsyncOptions } from './options'
import type { UseAsyncPluginContext } from './plugin'
import type { UseAsyncReturn } from './return'
import type { Task } from './task'
import type { UseAsync } from './use-async'
import { computed, readonly, ref, shallowRef } from '@vue/reactivity'
import { until } from '@vueuse/core'
import { createHooks, serialTaskCaller } from 'easy-hookable'
import { callWithSignal, promiseWithControl, toValue } from 'nice-fns'
import { createError, type UseAsyncError } from './error'
import { CancelIfDupPlugin } from './plugins/cancel-if-dup'
import { ImmediatePlugin } from './plugins/immediate'
import { ReadyPlugin } from './plugins/ready'
import { WatchDepsPlugin } from './plugins/watch-deps'
import { createBoolToggle, createPlugins, isSupportsAbort } from './utils'

export * from './plugins/cancel-if-dup'
export * from './plugins/immediate'
export * from './plugins/ready'
export * from './plugins/watch-deps'

// #region 默认配置项
const DEFAULTS_OPTIONS = {
  skipHooksOnCancel: true,
  keepPreviousData: true,
  updateDataOnError: false,
  updateErrorOnSuccess: true,
  abortPrevious: false,
  timeout: 0,
} as const
// #endregion

// #region 内置插件列表
const BUILTIN_PLUGINS = [ImmediatePlugin, WatchDepsPlugin, ReadyPlugin, CancelIfDupPlugin]
// #endregion

/**
 * 创建自定义 `useAsync()`
 * @param baseOptions 基础配置项
 *
 * @example
 * ```ts
 * const useAsync = createAsync({
 *   skipHooksOnCancel: false,
 * })
 * ```
 */
export function createAsync(baseOptions?: CreateAsyncOptions): UseAsync
export function createAsync(baseOptions: CreateAsyncOptions = {}) {
  function useAsync(task: Task, userOptions: UseAsyncOptions<any> = {}) {
    // #region 合并配置项
    const options: SetRequired<UseAsyncOptions<any>, keyof typeof DEFAULTS_OPTIONS> = {
      ...DEFAULTS_OPTIONS,
      ...baseOptions,
      ...userOptions,
    }
    // #endregion

    // #region 创建初始状态
    // 这里的状态只是用于记录最近一次的任务执行状态
    const isFinished = ref(false)
    const isExecuting = ref(false)

    const payload = shallowRef(getInitialPayload())
    const data = shallowRef(getInitialData())
    const error = shallowRef<UseAsyncError>()
    const rawData = shallowRef<unknown>()

    const aborted = ref(false)
    const supportsAbort = isSupportsAbort()
    const canAbort = computed(() => supportsAbort && isExecuting.value)

    function getInitialPayload() {
      return toValue(options.initialPayload) || []
    }
    function getInitialData() {
      return toValue(options.initialData)
    }
    // #endregion

    // #region 创建 Hooks 管理器
    const hooks = createHooks() as UseAsyncHookable<any>
    // #endregion

    // #region 创建返回对象
    const shell: UseAsyncReturn<any> = {
      payload,
      rawData,
      data,
      error,

      isFinished: readonly(isFinished),
      isExecuting: readonly(isExecuting),

      aborted: readonly(aborted),
      canAbort,
      abort: abortPendingExecution,

      on: hooks.hook,
      once: hooks.hookOnce,

      doExecute,

      execute: (...args) => shell.doExecute(args),
      unsafeExecute: (...args) => shell.doExecute(args, true),

      reExecute: () => shell.execute(...payload.value),
      unsafeReExecute: () => shell.unsafeExecute(...payload.value),
    }
    // #endregion

    // #region 初始化所有插件并注册配置项 Hooks
    const plugins = createPlugins()
    let executeTask = () => Promise.resolve()
    const pluginCtx: UseAsyncPluginContext<any> = {
      baseOptions,
      options,
      shell,
      hooks,
      task: () => executeTask(),
      setApi: plugins.setApi,
      getApi: plugins.getApi,
    }

    // 注册全部插件并初始化
    plugins
      .add(...BUILTIN_PLUGINS, ...(baseOptions.plugins || []), ...(userOptions.plugins || []))
      .init(pluginCtx)

    // 注册全部 Hooks
    const configHooks = [baseOptions.hooks, userOptions.hooks]
    configHooks.forEach((_hooks) => _hooks && hooks.addHooks(_hooks))
    // #endregion

    // #region 终止未完成的执行
    let previousController: AbortController | null = null
    const pendingControllers = new Set<AbortController>()
    function abortPendingExecution(allPending = false) {
      if (!supportsAbort) {
        return
      }

      if (allPending === true) {
        pendingControllers.forEach((ac) => ac.abort())
        pendingControllers.clear()
      }
      else if (previousController) {
        previousController.abort()
        pendingControllers.delete(previousController)
        previousController = null
      }
    }
    // #endregion

    // #region 切换执行状态
    function executing(value: boolean) {
      isExecuting.value = value
      isFinished.value = !value
    }
    // #endregion

    // #region 执行核心功能
    let executeCounter = 0
    async function doExecute(args: any[], throwOnFailed = false) {
      const {
        skipHooksOnCancel,
        keepPreviousData,
        updateDataOnError,
        updateErrorOnSuccess,
        abortPrevious,
        timeout,
      } = options

      // 终止最近一次未完成的执行
      if (toValue(abortPrevious)) {
        abortPendingExecution(false)
      }

      // 创建本次执行的 AbortController
      const currentController = (previousController = new AbortController())
      const abort = (reason?: any) => currentController.abort(reason)
      const isAborted = () => currentController.signal.aborted

      // 监听终止事件，变更 aborted.value
      currentController.signal.addEventListener('abort', abortCallback)
      function abortCallback() {
        aborted.value = true
        currentController.signal.removeEventListener('abort', abortCallback)
      }

      // 添加本次未完成的 AbortController
      pendingControllers.add(currentController)
      function deleteController() {
        pendingControllers.delete(currentController)
        // 清楚事件回调
        currentController.signal.removeEventListener('abort', abortCallback)
        // 清除定时器
        clearTimer()
      }

      // #region 创建本次执行的数据状态
      const [isCanceled, toggleCanceled] = createBoolToggle()
      const [isFailed, toggleFailed] = createBoolToggle()
      const [isTimeout, toggleTimeout] = createBoolToggle()

      const initialData = getInitialData()
      const state = {
        data: initialData,
        error: undefined as UseAsyncError | undefined,
        rawData: undefined as unknown,
      }
      // #endregion

      // #region 创建定时器，超时自动终止
      let timeoutSignal: AbortSignal | null

      function startTimer() {
        const timeoutValue = toValue(timeout)
        if (timeoutValue) {
          timeoutSignal = AbortSignal.timeout(timeoutValue)
          timeoutSignal.onabort = () => {
            toggleTimeout()
            abort(timeoutSignal!.reason)
          }
        }
      }

      function clearTimer() {
        if (timeoutSignal) {
          timeoutSignal.onabort = null
          timeoutSignal = null
        }
      }
      // #endregion

      // #region 创建基础上下文
      const baseCtx: ExecuteContext.Base<any> = {
        options,
        payload: args,
        signal: currentController.signal,
      }
      // #endregion

      // #region 本次执行计数
      let currentExecuteCounter = -1
      function isLatestExecution() {
        return currentExecuteCounter === executeCounter
      }
      function updateExecuteCounter() {
        // 更新执行计数
        executeCounter += 1
        // 获取本次执行计数
        currentExecuteCounter = executeCounter
      }
      // #endregion

      try {
        // #region 触发 before 事件
        // 执行前检查是否已被取消
        const skipHooksOnCancelValue = toValue(skipHooksOnCancel)
        const withSkip = (hook: AnyFn) => {
          return (...args: any[]) => (!skipHooksOnCancelValue || !isCanceled()) && hook(...args)
        }

        const beforeCtx: ExecuteContext.Before<any> = {
          ...baseCtx,
          abort,
          cancel: toggleCanceled,
          isCanceled,
          isAborted,
        }
        await hooks.callHookWith(
          (name, fns, args) => serialTaskCaller(name, fns.map(withSkip), args),
          'before',
          beforeCtx,
        )
        // #endregion

        // 取消本次执行
        if (isCanceled()) {
          return state.data
        }

        // 未被取消时需要更新执行计数
        updateExecuteCounter()
        // 开启执行状态
        executing(true)

        // #region 重置响应式的数据状态
        if (!toValue(keepPreviousData)) {
          data.value = initialData
        }
        error.value = undefined
        aborted.value = false
        payload.value = args
        // #endregion

        // 启动定时器
        startTimer()

        // 替换执行任务
        executeTask = () =>
          callWithSignal(task, {
            payload: args,
            signal: currentController.signal,
          })

        // 执行插件处理后的任务并设置为原始数据
        state.rawData = rawData.value = await pluginCtx.task(beforeCtx)

        // 从未完成的 AbortController 列表中删除
        deleteController()

        // 更新 error.value
        if (toValue(updateErrorOnSuccess)) {
          state.error = error.value = undefined
        }

        // #region 触发 success 事件
        const successCtx: ExecuteContext.Success<any> = {
          ...baseCtx,
          data: state.rawData,
          rawData: state.rawData,
          isLatestExecution,
        }
        await hooks.callHook('success', successCtx)
        // #endregion

        state.data = data.value = successCtx.data
      }
      catch (e) {
        // 从未完成的 AbortController 列表中删除
        deleteController()
        // 切换失败状态
        toggleFailed()

        // 获取执行任务的原始错误
        state.rawData = rawData.value = e

        // #region 触发 error 事件
        const errorCtx: ExecuteContext.Error<any> = {
          ...baseCtx,
          data: initialData,
          rawData: state.rawData,
          error: createError(state.rawData),
          isAborted,
          isTimeout,
          isLatestExecution,
        }
        await hooks.callHook('error', errorCtx)
        // #endregion

        state.error = error.value = errorCtx.error

        // 失败时更新数据
        if (toValue(updateDataOnError)) {
          state.data = data.value = errorCtx.data
        }

        // 抛出本次执行错误
        if (throwOnFailed) {
          throw state.error
        }
      }
      finally {
        // 从未完成的 AbortController 列表中删除
        deleteController()

        // 如果是最近一次执行结束则处理相关状态
        if (isLatestExecution()) {
          executing(false)
          previousController = null
        }

        // #region 触发 after 事件
        const afterCtx: ExecuteContext.After<any> = {
          ...baseCtx,
          data: state.data,
          error: state.error,
          rawData: state.rawData,
          isFailed,
          isCanceled,
          isAborted,
          isTimeout,
          isLatestExecution,
        }
        await hooks.callHook('after', afterCtx)
        // #endregion
      }

      // 返回本次执行数据
      return state.data
    }
    // #endregion

    // #region 等待所有任务执行完成
    function waitUntilFinished() {
      const { promise, resolve, reject } = promiseWithControl<typeof shell>()
      until(isFinished)
        .toBe(true)
        .then(
          () => resolve(shell),
          () => reject(error.value),
        )
      return promise
    }
    // #endregion

    return {
      ...shell,
      then(onfulfilled: AnyFn, onrejected: AnyFn) {
        return waitUntilFinished().then(onfulfilled, onrejected)
      },
    }
  }

  return useAsync as unknown as UseAsync
}
