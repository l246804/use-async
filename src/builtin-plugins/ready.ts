import type { UseAsyncPlugin } from '../plugin'

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
