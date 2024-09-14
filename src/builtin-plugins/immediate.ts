import type { UseAsyncPlugin } from '../plugin'

/**
 * ImmediatePlugin
 * @description 立即执行任务
 */
export const ImmediatePlugin: UseAsyncPlugin = ({ options, shell }) => {
  const { immediate = true } = options
  if (immediate) {
    Promise.resolve().then(() => shell.reExecute())
  }
}
