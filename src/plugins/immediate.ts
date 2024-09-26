import type { UseAsyncPlugin } from '@magic-js/use-async'

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

declare module '@magic-js/use-async' {
  interface CreateAsyncOptions {
    /**
     * 是否立即执行
     * @default true
     */
    immediate?: boolean
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  interface UseAsyncOptions<T> {
    /**
     * 是否立即执行
     * @default CreateAsyncOptions.immediate
     */
    immediate?: boolean
  }
}
