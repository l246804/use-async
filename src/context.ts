import type { UseAsyncError } from './error'
import type { UseAsyncOptions } from './options'
import type { InferTaskPayload, InferTaskReturn, Task } from './task'

export namespace ExecuteContext {
  export interface Base<T extends Task = Task> {
    /**
     * 本次执行任务的配置项
     */
    readonly options: UseAsyncOptions<T>
    /**
     * 本次执行任务的参数列表
     */
    readonly payload: InferTaskPayload<T>
    /**
     * 本次执行任务的终止信号
     */
    readonly signal: AbortSignal
  }

  export interface Before<T extends Task = Task> extends Base<T> {
    /**
     * 判断本次任务的执行是否已被取消
     */
    isCanceled: () => boolean
    /**
     * 取消本次任务的执行，将会直接进入 `after` 阶段
     */
    cancel: () => void
    /**
     * 终止本次任务的执行，在 `task()` 未开始前调用不会立即退出
     * @param reason 终止原因
     */
    abort: (reason?: any) => void
    /**
     * 本次任务执行是否被终止
     */
    isAborted: () => boolean
  }

  export interface After<T extends Task = Task> extends Base<T> {
    /**
     * 本次任务执行后的数据
     */
    readonly data: InferTaskReturn<T> | undefined
    /**
     * 本次任务执行后的错误
     */
    readonly error: UseAsyncError | undefined
    /**
     * 本次任务执行后的原始数据
     */
    readonly rawData: unknown
    /**
     * 本次任务执行是否失败
     */
    isFailed: () => boolean
    /**
     * 本次任务执行是否被取消
     */
    isCanceled: () => boolean
    /**
     * 本次任务执行是否被终止
     */
    isAborted: () => boolean
    /**
     * 本次任务执行是否由于超时被终止
     */
    isTimeout: () => boolean
    /**
     * 本次执行是否是最近一次的执行，即最新一次执行
     */
    isLatestExecution: () => boolean
  }

  export interface Success<T extends Task = Task> extends Base<T> {
    /**
     * 本次任务执行成功后的数据
     */
    data: InferTaskReturn<T>
    /**
     * 本次任务执行成功后的原始数据
     */
    readonly rawData: unknown
    /**
     * 本次执行是否是最近一次的执行，即最新一次执行
     */
    isLatestExecution: () => boolean
  }

  export interface Error<T extends Task = Task> extends Base<T> {
    /**
     * 本次任务执行失败后的数据
     */
    data: InferTaskReturn<T> | undefined
    /**
     * 本次任务执行失败后的错误
     */
    error: UseAsyncError
    /**
     * 本次任务执行失败后的原始数据
     */
    readonly rawData: unknown
    /**
     * 本次任务执行是否被终止
     */
    isAborted: () => boolean
    /**
     * 本次任务执行是否由于超时被终止
     */
    isTimeout: () => boolean
    /**
     * 本次执行是否是最近一次的执行，即最新一次执行
     */
    isLatestExecution: () => boolean
  }
}
