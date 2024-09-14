import { createAsync } from './createAsync'
import type { UseAsyncOptions } from './options'
import type { UseAsyncReturn } from './return'
import type { Task } from './task'

export type UseAsync = <T extends Task>(
  task: T,
  options: UseAsyncOptions<T>,
) => UseAsyncReturn<T> & PromiseLike<UseAsyncReturn<T>>

export const useAsync = createAsync()
