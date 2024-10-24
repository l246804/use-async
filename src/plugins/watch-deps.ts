import type { UseAsyncPlugin } from '@magic-js/use-async'
import type { WatchOptions, WatchSource } from '@vue/reactivity'
import { onScopeDispose, watch } from '@vue/reactivity'

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

    const unwatch = watch(source, callback, { deep: true, ...watchOptions, immediate: false })
    onScopeDispose(unwatch)
  }
}

declare module '@magic-js/use-async' {
  // eslint-disable-next-line unused-imports/no-unused-vars
  interface UseAsyncOptions<T> {
    /**
     * 监听响应依赖
     * @default
     * ```ts
     * {
     *   source: [],
     *   deep: true,
     *   callback: reExecute
     * }
     * ```
     */
    watchDeps?:
      | WatchSource[]
      | ({ source: WatchSource[], callback?: () => void } & Omit<WatchOptions<false>, 'immediate'>)
  }
}
