# Changelog

## [0.2.9](https://github.com/l246804/use-async/compare/v0.2.8...v0.2.9) (2024-10-24)


### Chores

* 🤖 优化注释和 README.md 内容 ([cace185](https://github.com/l246804/use-async/commit/cace1855b01b3daa06706655bb95c75ec0fa3ef2))
* 🤖 useAsync 在 onScopeDispose 时清理缓存 ([7cef2ce](https://github.com/l246804/use-async/commit/7cef2ce54dbdbc5177e160ff9e1a098324121a59))

## [0.2.8](https://github.com/l246804/use-async/compare/v0.2.7...v0.2.8) (2024-10-15)


### Chores

* 🤖 优化 InferTaskPayload 类型定义 ([c214451](https://github.com/l246804/use-async/commit/c214451565183d584b0e3d745a87f03199478f74))
* 🤖 优化 InferTaskReturn 类型定义 ([3ecaf0c](https://github.com/l246804/use-async/commit/3ecaf0c0c62e6757054e2b786ef6a6a445de1f06))

## [0.2.7](https://github.com/l246804/use-async/compare/v0.2.6...v0.2.7) (2024-10-14)


### Bug Fixes

* 🐛 修复 unsafeExecute 未正确执行 doExecute ([96b8099](https://github.com/l246804/use-async/commit/96b80992b7374f368229dd1ea31542de12a71c4b))

## [0.2.6](https://github.com/l246804/use-async/compare/v0.2.5...v0.2.6) (2024-10-12)


### Bug Fixes

* 🐛 修改配置项注释里默认值错误 ([717ccfc](https://github.com/l246804/use-async/commit/717ccfcb6f908bec2d605f0ddb6dcfdc16d22fe6))

## [0.2.5](https://github.com/l246804/use-async/compare/v0.2.4...v0.2.5) (2024-10-10)


### Chores

* 🤖 PluginContext.task 支持获取 beforeContext ([c24764d](https://github.com/l246804/use-async/commit/c24764df3e4ed3f616b571be2f4a630e6e9adfb2))

## [0.2.4](https://github.com/l246804/use-async/compare/v0.2.3...v0.2.4) (2024-10-08)


### Bug Fixes

* 🐛 修复 CreateAsyncOptions.hooks ([8f3b928](https://github.com/l246804/use-async/commit/8f3b928734f75a386de410304610d3ec321a9e7d))
* 🐛 修复 useAsync 类型定义 ([2c77db5](https://github.com/l246804/use-async/commit/2c77db5647d9f2956ee199a3498779cbf94212a4))

## [0.2.3](https://github.com/l246804/use-async/compare/v0.2.2...v0.2.3) (2024-10-08)


### Bug Fixes

* 🐛 re-export plugins ([9c57023](https://github.com/l246804/use-async/commit/9c570230d03d50a220a80f1bbee3a8792809a835))


### Chores

* 🤖 补充 README.md ([f21ee89](https://github.com/l246804/use-async/commit/f21ee8984e2c7582c5984c25ba6f30ab5ab1dc20))
* 🤖 update deps ([241b32c](https://github.com/l246804/use-async/commit/241b32c828e07b4c7994c7674cd94e4a9db30784))
* 🤖 update settings.json ([a842269](https://github.com/l246804/use-async/commit/a842269fbf0eb6ab4b77fa80476f7ad1468e8dac))
* 🤖 update tsconfig.json ([c2a039e](https://github.com/l246804/use-async/commit/c2a039e0ab27dfa9e239f507db8922541061e677))

## [0.2.2](https://github.com/l246804/use-async/compare/v0.2.1...v0.2.2) (2024-09-26)


### Chores

* 🤖 move @vue/reactivity to peerDependencies ([6ccc810](https://github.com/l246804/use-async/commit/6ccc8100b9e3c8124483620e39efe2eb8d88626e))

## [0.2.1](https://github.com/l246804/use-async/compare/v0.2.0...v0.2.1) (2024-09-26)


### Chores

* 🤖 expose raw instance of AbortSignal ([0752753](https://github.com/l246804/use-async/commit/07527536ae5bfd3b7518f793fd6e2b65d3f30da1))
* 🤖 update package.json keywords ([ed0c691](https://github.com/l246804/use-async/commit/ed0c691e77ef4e6fbf5e94a4a3dcde1b9beab619))

## [0.2.0](https://github.com/l246804/use-async/compare/v0.1.0...v0.2.0) (2024-09-26)


### Features

* 🎸 add request plugins ([62ababe](https://github.com/l246804/use-async/commit/62ababe5101bd02fa6b20809a2bd7d52f9660eb0))


### Chores

* 🤖 move builtin-plugins to plugins/builtin ([ad331ed](https://github.com/l246804/use-async/commit/ad331edc685a150e5a9bafc9b5fb918acaacc9f8))
* 🤖 replace createEventHook to easy-hookable ([18c7b9b](https://github.com/l246804/use-async/commit/18c7b9b87da6b0810a138846d347956c2b962a22))
* 🤖 update deps ([8579413](https://github.com/l246804/use-async/commit/85794138e967c74bd3d91c9777b6dd0e9eed6298))

## 0.1.0 (2024-09-18)


### Features

* init project ([730d6ea](https://github.com/l246804/use-async/commit/730d6ea71c234ccd0a442fa432040320e6fba5d2))


### Chores

* 🤖 remove .npmrc file ([dae89ee](https://github.com/l246804/use-async/commit/dae89eefe017597590542b60a29c576abecf182c))
* 🤖 remove executing of hooks ([5220178](https://github.com/l246804/use-async/commit/5220178bddd91fc6cf6fde9a5a8d0a43a488eb88))
* 🤖 replace vue to @vue/reactivity ([695f1d9](https://github.com/l246804/use-async/commit/695f1d9f49c3ce711409933dded2d90bfc405b63))
