import { castError } from 'nice-fns'

export interface UseAsyncError<T = any> extends Error {
  cause?: T
}

/**
 * 创建错误对象
 */
export function createError(val: any, cause?: any): UseAsyncError {
  const err = castError(val)
  if (cause != null) {
    err.cause = cause
  }
  else if (err !== val) {
    err.cause = val
  }
  return err
}
