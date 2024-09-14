import { watch } from 'vue'
import type { UseAsyncPlugin } from '../plugin'

/**
 * WatchDepsPlugin
 * @description 监听响应式状态变更触发任务重新执行
 */
export const WatchDepsPlugin: UseAsyncPlugin = ({ options, shell }) => {
  const { watchDeps } = options
  if (watchDeps) {
    const {
      source,
      callback = () => shell.reExecute(),
      ...watchOptions
    } = Array.isArray(watchDeps) ? { source: watchDeps } : watchDeps

    watch(source, callback, { deep: true, ...watchOptions, immediate: false })
  }
}
