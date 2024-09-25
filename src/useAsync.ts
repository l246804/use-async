import type { UseAsyncOptions } from './options'
import type { UseAsyncReturn } from './return'
import type { Task } from './task'
import { createAsync } from './createAsync'

export type UseAsync = <T extends Task>(
  task: T,
  options: UseAsyncOptions<T>,
) => UseAsyncReturn<T> & PromiseLike<UseAsyncReturn<T>>

export const useAsync = createAsync()
