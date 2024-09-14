import type { WatchOptions, WatchSource } from '@vue/reactivity'
import type { Awaitable, MaybeFn } from '@rhao/types-base'
import type { InferTaskPayload, InferTaskReturn, Task } from './task'
import type { UseAsyncHooks } from './hooks'
import type { UseAsyncPlugin } from './plugin'

export interface CreateAsyncOptions {
  /**
   * 是否立即执行
   * @default true
   */
  immediate?: boolean
  /**
   * 本次执行在 `before` 阶段执行时调用 `cancel()` 后是否跳过其他未执行的回调，可以在一定程度上减少不必要的性能操作
   * @default true
   */
  skipHooksOnCancel?: boolean
  /**
   * 执行前是否保留上次的 `data.value`
   * @default true
   */
  keepPreviousData?: boolean
  /**
   * 执行失败时是否更新 `data.value`，默认会更新为 `options.initialData`，可能会在 `hooks.error` 中被改变
   * @default false
   */
  updateDataOnError?: boolean
  /**
   * 执行成功时是否更新 `error.value` 为 `undefined`，避免在多次执行时某次失败和最后一次成功导致同时存在 `error.value` 和 `data.value`
   * @default true
   */
  updateErrorOnSuccess?: boolean
  /**
   * 本次执行前是否终止上次未完成的任务执行
   * @default true
   */
  abortPrevious?: boolean
  /**
   * 任务执行的超时时间，超时后自动终止，设置大于 `0` 时有效
   * @default 0
   */
  timeout?: number
  /**
   * 任务执行事件配置，优先于每次调用时的 `UseAsyncOptions.hooks`
   */
  hooks?: UseAsyncHooks<any>
  /**
   * 插件列表，插件返回的 `hooks` 优先于 `CreateAsyncOptions.hooks`
   */
  plugins?: UseAsyncPlugin<any>[]
}

export interface UseAsyncOptions<T extends Task> {
  /**
   * 是否立即执行
   * @default CreateAsyncOptions.immediate
   */
  immediate?: boolean
  /**
   * 本次执行是否准备就绪，返回假值则取消本次执行，直接进入 `after` 阶段
   * @param payload 执行参数列表
   */
  ready?: (...payload: InferTaskPayload<T>) => Awaitable<unknown>
  /**
   * 取消重复执行，如果最近一次执行未完成时执行该函数，返回真值则取消本次执行，直接进入 `after` 阶段
   * @param currentPayload 本次执行参数列表
   * @param latestPayload 最近一次执行参数列表
   */
  cancelIfDup?: (currentPayload: any, latestPayload: any) => unknown
  /**
   * 本次执行在 `before` 阶段执行时调用 `cancel()` 后是否跳过其他未执行的回调，可以在一定程度上减少不必要的性能操作
   * @default CreateAsyncOptions.skipHooksOnCancel
   */
  skipHooksOnCancel?: MaybeFn<boolean>
  /**
   * 监听响应依赖
   * @default { source: [], deep: true, callback: reExecute }
   */
  watchDeps?:
    | WatchSource[]
    | ({ source: WatchSource[], callback?: () => void } & Omit<WatchOptions<false>, 'immediate'>)
  /**
   * 是否保留上次的数据
   * @default CreateAsyncOptions.keepPreviousData
   */
  keepPreviousData?: MaybeFn<boolean>
  /**
   * 执行失败时是否更新数据，默认会更新为 `options.initialData`，可能会在 `hooks.error` 中被改变
   * @default CreateAsyncOptions.updateDataOnError
   */
  updateDataOnError?: MaybeFn<boolean>
  /**
   * 执行成功时是否更新 `error.value` 为 `undefined`，避免在多次执行时某次失败和最后一次成功导致同时存在 `error.value` 和 `data.value`
   * @default CreateAsyncOptions.updateErrorOnSuccess
   */
  updateErrorOnSuccess?: MaybeFn<boolean>
  /**
   * 开启后将在本次执行前终止上次未完成的任务执行
   * @default CreateAsyncOptions.abortPrevious
   */
  abortPrevious?: MaybeFn<boolean>
  /**
   * 任务执行的超时时间，超时后自动终止，设置大于 `0` 时有效
   * @default CreateAsyncOptions.timeout
   */
  timeout?: MaybeFn<number>
  /**
   * 初始化 `payload.value`
   */
  initialPayload?: MaybeFn<InferTaskPayload<T>>
  /**
   * 初始化 `data.value`
   */
  initialData?: MaybeFn<InferTaskReturn<T>>
  /**
   * 任务执行事件配置，优先于 `useAsync().onXxx`，低于 `CreateAsyncOptions.hooks`
   */
  hooks?: Partial<UseAsyncHooks<T>>
  /**
   * 运行时插件列表，插件返回的 `hooks` 优先于 `CreateAsyncOptions.hooks`
   */
  plugins?: UseAsyncPlugin<T>[]
}
