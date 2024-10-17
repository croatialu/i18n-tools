import path from 'node:path'
import { defineConfig } from 'vitest/config'

const dirname = new URL('.', import.meta.url).pathname

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(dirname, 'src'),
    },
  },
})
