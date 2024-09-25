import type { InferTaskPayload, UseAsyncPlugin } from '@magic-js/use-async'
import type { Awaitable } from '@rhao/types-base'

/**
 * ReadyPlugin
 * @description 任务执行前检查本次执行是否就绪
 */
export const ReadyPlugin: UseAsyncPlugin = () => {
  return {
    async onBefore(ctx) {
      const { ready = () => true } = ctx.options
      if (!(await ready(...ctx.payload))) {
        ctx.cancel()
      }
    },
  }
}

declare module '@magic-js/use-async' {
  interface UseAsyncOptions<T> {
    /**
     * 本次执行是否准备就绪，返回假值则取消本次执行，直接进入 `after` 阶段
     * @param payload 执行参数列表
     */
    ready?: (...payload: InferTaskPayload<T>) => Awaitable<unknown>
  }
}
