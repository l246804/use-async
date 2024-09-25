import type { Awaitable, CamelCasedProperties } from '@rhao/types-base'
import type { EventHookOn } from 'nice-fns'
import type { ExecuteContext } from './context'
import type { Task } from './task'

export interface UseAsyncHooks<T extends Task> {
  /**
   * 任务执行前触发，可通过 `ctx.cancel()` 取消本次执行
   */
  before: (ctx: ExecuteContext.Before<T>) => Awaitable<unknown> | void
  /**
   * 任务执行后触发，可通过 `data.value` 或 `ctx.data` 获取本次执行结果
   */
  after: (ctx: ExecuteContext.After<T>) => Awaitable<unknown> | void
  /**
   * 任务执行成功后触发，此时未更新 `data.value`，可通过 `ctx.data` 更改本次执行结果
   */
  success: (ctx: ExecuteContext.Success<T>) => Awaitable<unknown> | void
  /**
   * 任务执行失败后触发，此时未更新 `error.value`，可通过 `ctx.error` 更改本次执行错误
   */
  error: (ctx: ExecuteContext.Error<T>) => Awaitable<unknown> | void
}

export type UseAsyncHooksOn<T extends Task> = CamelCasedProperties<{
  [K in keyof UseAsyncHooks<T> as `on-${K}`]: EventHookOn<UseAsyncHooks<T>[K]>
}>
