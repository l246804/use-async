import type { UseAsyncPlugin, UseAsyncPluginContext } from './plugin'
import { isFunction } from 'nice-fns'

// #region 插件辅助工序
export function createPlugins() {
  let plugins: UseAsyncPlugin<any>[] = []
  let pluginApis: Record<PropertyKey, any> = {}

  const self = {
    list: () => plugins.slice(),

    setApi: (key: any, api: any) => {
      pluginApis[key] = api
    },

    getApi: (key: any) => pluginApis[key],

    add: (..._plugins: UseAsyncPlugin<any>[]) => {
      for (const p of _plugins) {
        if (!plugins.includes(p) && isFunction(p)) {
          plugins.push(p)
        }
      }
      return self
    },

    init: (ctx: UseAsyncPluginContext<any>) => plugins.forEach((p) => p(ctx)),

    clear: () => {
      plugins = []
      pluginApis = {}
    },
  }

  return self
}
// #endregion

export function isSupportsAbort() {
  return typeof AbortController === 'function'
}

export function createBoolToggle(
  { initialValue, finalValue }: { initialValue: boolean, finalValue: boolean } = {
    initialValue: false,
    finalValue: true,
  },
) {
  let val = initialValue
  const read = () => val
  const toggle = () => {
    val = finalValue
  }
  return [read, toggle] as const
}
