import type { UseAsyncHooks } from '@magic-js/use-async'
import type { MaybeNullish } from '@rhao/types-base'
import { type EventHook, isFunction } from 'nice-fns'

function upperFirst(str: string) {
  return `${str[0].toUpperCase()}${str.slice(1)}`
}

export function registerHooks(
  eventHook: EventHook,
  hookName: string,
  ...userHooks: MaybeNullish<Partial<UseAsyncHooks<any> | void>>[]
) {
  const names = [hookName, `on${upperFirst(hookName)}`]
  for (const hooks of userHooks) {
    if (!hooks)
      continue

    names.forEach((name) => {
      const hook = hooks[name]
      isFunction(hook) && eventHook.on(hook)
    })
  }
}
