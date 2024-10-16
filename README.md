# `@magic-js/use-async`

一个高性能可扩展的 `Vue3` 异步任务流管理工具，推荐搭配 [async-plugin-request](https://github.com/l246804/async-plugin-request) 处理网络请求。

> `useAsync` 的执行阶段事件钩子支持异步回调，每个钩子回调会等待上一个回调结束再执行。

## 安装

```sh
# npm
npm i @magic-js/use-async

# yarn
yarn add @magic-js/use-async

# pnpm
pnpm add @magic-js/use-async
```

## 使用方式

### 基础示例

```ts
import { useAsync } from '@magic-js/use-async'

function fetchData(num: number) {
  if (num > 10) {
    return Promise.reject(new Error('error: num > 10'))
  }

  return Promise.resolve(num)
}

;(async () => {
  // 自动执行
  const { data, error, execute, reExecute, on, then } = await useAsync(fetchData, { initialPayload: [1] })
  data.value // => 1

  // 再次执行
  await execute(10).then((value) => {
    console.log(value) // => 10
  })

  // 基于最后一次参数重新执行
  await reExecute().then((value) => {
    console.log(value) // => 10
  })

  // 执行后报错可以通过 error.value 获取最近一次错误信息
  await execute(100)
  error.value // => Error { message: 'error: num > 10' }

  // 动态注册执行流回调
  on('before', (ctx) => {
    console.log(ctx.payload) // => [200]
  })
  await execute(200)

  // 多次执行时返回结果均为对应的数据，data.value 和 error.value 仅为最近一次执行完成时的状态记录
  execute(5).then((value) => {
    console.log(value) // => 5
  })
  execute(6).then((value) => {
    console.log(value) // => 6
  })
  data.value // => 6，如果 `execute(5)` 执行结果晚于 `execute(6)` 时，这里为 `5`
})()

// 手动执行，默认不再自动执行
const { execute } = useAsync(fetchData, { immediate: false })
```

### 使用插件

#### 安装插件库

```sh
pnpm add async-plugin-request
```

#### 全局使用

```ts
// hooks/useAsync.ts
import { createAsync } from '@magic-js/use-async'
import { createAxiosPlugin } from 'async-plugin-request/axios'

export const useAsync = createAsync({
  // 注册 AxiosPlugin，用于链接 `useAsync()` 和 `axios()`
  plugins: [createAxiosPlugin()]
})
```

```ts
import axios from 'axios'
import { useAsync } from 'hooks/useAsync'

function fetchData(params: any) {
  return axios.get('/api/getList', { params })
}

const { abort } = useAsync(fetchData, {
  initialPayload: [{ a: 1 }],
  axiosConfig: {
    timeout: 10e3 // 这里的配置项会透传给 axios
  },
})

abort() // 同步终止 axios 请求
```

#### 局部使用

```ts
import { useAsync } from '@magic-js/use-async'
import { createAxiosPlugin } from 'async-plugin-request/axios'
import axios from 'axios'

function fetchData(params: any) {
  return axios.get('/api/getList', { params })
}

const { abort } = useAsync(fetchData, {
  initialPayload: [{ a: 1 }],
  // 注册 AxiosPlugin，用于链接 `useAsync()` 和 `axios()`
  plugins: [createAxiosPlugin()],
  axiosConfig: {
    timeout: 10e3 // 这里的配置项会透传给 axios
  },
})

abort() // 同步终止 axios 请求
```

## 开发插件

`useAsync` 负责管理异步任务的执行流，会在不同的阶段抛出相应的事件，可通过插件对异步任务管理进行额外的功能扩展。

> 插件的事件回调会早于 `createAsync`、`useAsync` 执行。

### 示例

> 该插件已被包含在 `async-plugin-request` 中！

```ts
import { createError } from '@magic-js/use-async'

/**
 * 创建动态刷新令牌插件
 */
export function createRefreshTokenPlugin(pluginOptions) {
  const { enabled: baseEnabled = true, assertExpired, handler } = pluginOptions

  let refreshPromise = null
  return function RefreshTokenPlugin(pluginCtx) {
    const { task: rawTask, shell } = pluginCtx

    // 在 before 阶段包装原始任务
    shell.on('before', async (ctx) => {
      const { enabled = baseEnabled } = ctx.options.refreshToken || {}
      const refreshTokenCtx = {
        ...pluginCtx,
        abort: () => ctx.abort(),
        isAborted: ctx.isAborted
      }

      // 包装原始任务
      pluginCtx.task = async (ctx) => {
        // 没有启用时直接返回原始任务的执行
        if (!enabled)
          return rawTask(ctx)

        // 存在刷新操作时等待完成后再执行原始任务
        if (refreshPromise) {
          return refreshPromise.then(() => rawTask(ctx))
        }

        try {
          // 正常执行原始任务
          return await rawTask(ctx)
        }
        catch (e) {
          const error = createError(e)

          // 断言是否为令牌过期导致失败
          if (await assertExpired(error)) {
            // 设置刷新操作
            if (!refreshPromise) {
              refreshPromise = new Promise((resolve) => {
                resolve(handler({ ...refreshTokenCtx, abort: () => ctx.abort(error) }))
              })
            }

            // 等待刷新成功后再次执行原始任务
            return refreshPromise
              .then(() => !refreshTokenCtx.isAborted() && rawTask(ctx))
              // 刷新失败后抛出原始错误信息
              .catch(() => Promise.reject(error))
              .finally(() => {
                refreshPromise = null
              })
          }

          // 非令牌过期导致出错时直接抛出错误
          throw error
        }
      }
    })
  }
}
```

## 类型扩展

在 `tsconfig.json` 所包含的文件目录中创建任意 `.ts` 或 `.d.ts` 文件添加如下代码。

```ts
interface CreateAsyncOptions {
  // 扩展自定义 `createAsync` 配置项
}

interface UseAsyncOptions<T> {
  // 扩展自定义 `useAsync` 配置项
}

interface UseAsyncReturn<T> {
  // 扩展自定义 `useAsync` 返回
}

interface UseAsyncHooks<T> {
  // 扩展自定义事件钩子
}
```
