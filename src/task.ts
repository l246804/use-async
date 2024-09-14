import type { ReplaceNever } from '@rhao/types-base'

export type Task = (...args: any[]) => any

export type InferTaskPayload<T> = T extends Task
  ? ReplaceNever<Parameters<T>, unknown[]>
  : unknown[]

export type InferTaskReturn<T> = T extends Task ? Awaited<ReturnType<T>> : T
