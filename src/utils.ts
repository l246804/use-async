import type { EventHook } from 'nice-fns'
import { createEventHook, isFunction } from 'nice-fns'
import type { MaybeNullish } from '@rhao/types-base'
import type { UseAsyncHooks, UseAsyncHooksOn } from './hooks'
import type { Task } from './task'
import type { UseAsyncPlugin, UseAsyncPluginContext, UseAsyncPluginHooks } from './plugin'

// #region Hooks 辅助工具
export type HooksKeys = keyof UseAsyncHooks<any>
export const hooksKeys: HooksKeys[] = ['before', 'after', 'success', 'error']

export type HooksOnKeys = keyof UseAsyncHooksOn<any>
export const hooksOnKeys: HooksOnKeys[] = hooksKeys.map((key) => {
  return `on${key[0].toUpperCase()}${key.slice(1)}` as HooksOnKeys
})

// Hooks 键映射 -> { before: 'onBefore', onBefore: 'before' }
export const hooksKeysMap: Record<string, string> = Object.fromEntries(
  hooksKeys
    .map((key, i) => [key, hooksOnKeys[i]])
    .concat(hooksOnKeys.map((key, i) => [key, hooksKeys[i]])),
)

export type EventHooks<T extends Task> = { [K in HooksKeys]: EventHook<UseAsyncHooks<T>[K]> }
export function createEventHooks() {
  return hooksKeys.reduce((hooks, key) => {
    hooks[key] = createEventHook() as any
    return hooks
  }, {} as EventHooks<any>)
}

export function extractEventHooksOn(eventHooks: EventHooks<any>) {
  return hooksOnKeys.reduce((hooksOn, key) => {
    hooksOn[key] = eventHooks[hooksKeysMap[key] as HooksKeys].on as any
    return hooksOn
  }, {} as UseAsyncHooksOn<any>)
}

export function registerHooks(
  eventHooks: EventHooks<any>,
  ...userHooks: MaybeNullish<Partial<UseAsyncHooks<any> | UseAsyncPluginHooks<any> | void>>[]
) {
  for (const hooks of userHooks) {
    if (!hooks)
      continue

    Object.entries(hooks).forEach(([key, fn]) => {
      const hook: EventHook | undefined = eventHooks[key] || eventHooks[hooksKeysMap[key]]
      if (hook) {
        hook.on(fn)
      }
    })
  }
}
// #endregion

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

    init: (ctx: UseAsyncPluginContext<any>) => plugins.map((p) => p(ctx)),

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
