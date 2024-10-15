export type Task = (...args: any[]) => any

export type InferTaskPayload<T> = T extends Task
  ? Parameters<T>
  : []

export type InferTaskReturn<T> = T extends Task ? Awaited<ReturnType<T>> : never
