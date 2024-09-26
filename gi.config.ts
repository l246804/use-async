import { defineConfig } from '@rhao/gen-index'

export default defineConfig({
  dirs: ['src'],
  exclude: ['utils.ts'],
  glob: {
    deep: 1,
  },
})
