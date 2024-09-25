import type { UseAsyncPlugin } from '@magic-js/use-async'

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

declare module '@magic-js/use-async' {
  // eslint-disable-next-line unused-imports/no-unused-vars
  interface UseAsyncOptions<T> {
    /**
     * 取消重复执行，如果最近一次执行未完成时执行该函数，返回真值则取消本次执行，直接进入 `after` 阶段
     * @param currentPayload 本次执行参数列表
     * @param latestPayload 最近一次执行参数列表
     */
    cancelIfDup?: (currentPayload: any, latestPayload: any) => unknown
  }
}
