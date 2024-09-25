import type { ComputedRef, Ref, ShallowRef } from '@vue/reactivity'
import type { UseAsyncError } from './error'
import type { UseAsyncHooksOn } from './hooks'
import type { InferTaskPayload, InferTaskReturn, Task } from './task'

type TaskData<T> = InferTaskReturn<T> | undefined

type Execute<T extends Task> = (...args: InferTaskPayload<T>) => Promise<TaskData<T>>
type ReExecute<T extends Task> = () => Promise<TaskData<T>>

export interface UseAsyncReturn<T extends Task> extends UseAsyncHooksOn<T> {
  /**
   * 最近一次执行的参数列表
   */
  payload: ShallowRef<InferTaskPayload<T>>
  /**
   * 最近一次执行后的原始数据
   */
  rawData: ShallowRef<unknown>
  /**
   * 最近一次执行后的数据
   */
  data: ShallowRef<TaskData<T>>
  /**
   * 最近一次执行后的错误
   */
  error: ShallowRef<UseAsyncError | undefined>

  /**
   * 最近一次执行是否已完成，会在 `before` 阶段后未取消时变更为 `false`
   */
  isFinished: Readonly<Ref<boolean>>
  /**
   * 是否正在执行任务，会在 `before` 阶段后未取消时变更为 `true`
   */
  isExecuting: Readonly<Ref<boolean>>

  /**
   * 最近一次执行是否被终止
   */
  aborted: Readonly<Ref<boolean>>
  /**
   * 是否可以终止任务执行
   */
  canAbort: ComputedRef<boolean>
  /**
   * 终止任务执行
   * @param allPending 是否结束所有未完成的执行
   * - `true`: 结束所有未完成的执行，必须传入 `true` 才生效，避免被其他类型真值影响
   * - `false`: 结束最近一次未完成的执行
   */
  abort: (allPending?: boolean) => void

  /**
   * 执行一次任务，返回本次任务执行的数据，每次执行时内部会更新一次响应式状态，但返回数据或错误均为本次任务自身状态
   * @param payload 参数列表
   * @param throwOnFailed 失败时是否抛出异常，默认 `false`
   */
  doExecute: (payload: InferTaskPayload<T>, throwOnFailed?: boolean) => Promise<TaskData<T>>

  /**
   * `doExecute(payload, false)`，该方法自身不会抛出异常，异常会被放在 `error.value` 中
   */
  execute: (...payload: InferTaskPayload<T>) => Promise<TaskData<T>>
  /**
   * `doExecute(payload, true)`，该方法自身失败时会抛出异常，异常同 `error.value` 一致
   */
  unsafeExecute: Execute<T>

  /**
   * `execute(...payload.value)`，该方法自身不会抛出异常，异常会被放在 `error.value` 中
   */
  reExecute: ReExecute<T>
  /**
   * `unsafeExecute(...payload.value)`，该方法自身失败时会抛出异常，异常同 `error.value` 一致
   */
  unsafeReExecute: ReExecute<T>
}
