import type { ExecuteContext } from './context'
import type { UseAsyncHookable } from './hooks'
import type { CreateAsyncOptions, UseAsyncOptions } from './options'
import type { UseAsyncReturn } from './return'
import type { Task } from './task'

// eslint-disable-next-line ts/no-wrapper-object-types
export interface UseAsyncPluginApiKey<_> extends Symbol {}

export type InferUseAsyncPluginApi<Key, Defaults = unknown> =
  Key extends UseAsyncPluginApiKey<infer Api> ? Api : Defaults

export interface UseAsyncPluginContext<T extends Task = Task> {
  /**
   * `createAsync()` 的配置项
   */
  readonly baseOptions: CreateAsyncOptions
  /**
   * `useAsync()` 的配置项
   */
  readonly options: UseAsyncOptions<T>
  /**
   * `useAsync()` 的返回体，包含一系列状态数据和方法，非运行时支持动态添加自定义状态和方法
   */
  readonly shell: UseAsyncReturn<T>
  /**
   * `useAsync()` 的事件钩子管理器，可注册自定义事件钩子
   */
  readonly hooks: UseAsyncHookable<T>
  /**
   * 本次执行的任务，可以通过插件进行替换，但需返回一个 `Promise`，出错时抛出异常将被捕获并进入 `error` 阶段
   */
  task: (ctx: ExecuteContext.Before) => Promise<any>
  /**
   * 设置插件 api，方便与其他插件进行通信
   * @param key 注册键，需保证唯一
   * @param api 插件 api
   * @example
   * ```ts
   * const pluginAKey: UseAsyncPluginApiKey<{ a: number }> = Symbol('PluginA')
   * const PluginA = (ctx) => {
   *   ctx.setApi(key, { a: 1 })
   * }
   * ```
   */
  setApi: <Api, Key = UseAsyncPluginApiKey<Api> | string>(
    key: Key,
    api: InferUseAsyncPluginApi<Key, Api>,
  ) => void
  /**
   * 获取插件 api，方便与其他插件进行通信
   * @param key 注册键
   * @returns 插件 api，可能为空，需注意注册顺序
   * @example
   * ```ts
   * const PluginB = (ctx) => {
   *   // 注册晚于 PluginA 时可以获取到其注册的 api
   *   ctx.getApi(pluginAKey)?.a // => 1
   * }
   * ```
   */
  getApi: <Api>(key: UseAsyncPluginApiKey<Api> | string) => Api | undefined
}

/**
 * UseAsyncPlugin
 * @example
 * ```ts
 * // Log Plugin
 * const LogPlugin: UseAsyncPlugin = ({ shell }) => {
 *   shell.on('before', () => {
 *     console.log('------------Task Start------------')
 *     console.log('payload:', ctx.payload)
 *     console.log('signal:', ctx.signal)
 *   })
 *
 *   shell.on('after', () => {
 *     console.log('------------Task Done------------')
 *     console.log('rawData:', ctx.rawData)
 *     console.log('data:', ctx.data)
 *     console.log('error:', ctx.error)
 *   })
 * }
 *
 * // RefreshTokenPlugin
 * let refreshPromise: Promise<boolean> | null = null
 * const RefreshTokenPlugin: UseAsyncPlugin = (ctx) => {
 *   if (!refreshPromise) return
 *
 *   const rawTask = ctx.task
 *   ctx.task = () => refreshPromise.then(() => rawTask())
 * }
 * ```
 */
export interface UseAsyncPlugin<T extends Task = Task> {
  (ctx: UseAsyncPluginContext<T>): void
}
