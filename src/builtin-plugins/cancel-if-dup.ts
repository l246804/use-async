import type { UseAsyncPlugin } from '../plugin'

/**
 * CancelIfDupPlugin
 * @description 取消重复的任务执行
 */
export const CancelIfDupPlugin: UseAsyncPlugin = ({ shell }) => {
  return {
    onBefore(ctx) {
      const { cancelIfDup } = ctx.options
      if (
        cancelIfDup
        && !shell.isFinished.value
        && shell.isExecuting.value
        && cancelIfDup(ctx.payload, shell.payload.value)
      ) {
        return ctx.cancel()
      }
    },
  }
}
