import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { nextRelicInstanceId } from './src/utils/reliquaryProp.js'

// 「新增圣遗物」要把结果落回这份测试数据，浏览器没有写盘权限，只能由 dev server 代写
const ARTIFACT_TEST_DATA = fileURLToPath(
  new URL('./src/assets/testJson/artiTest.json', import.meta.url),
)

// 仅开发期生效的测试数据写入接口：POST /__artifacts 追加一条并格式化回文件
function artifactTestDataApi() {
  return {
    name: 'artifact-test-data-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__artifacts', async (req, res) => {
        const send = (status, payload) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify(payload))
        }

        if (req.method !== 'POST') {
          send(405, { code: 405, msg: '只支持 POST' })
          return
        }

        let raw = ''
        for await (const chunk of req) raw += chunk

        try {
          const relic = JSON.parse(raw || '{}')

          if (!relic?.relicId || !relic?.setId || !relic?.mainPropName) {
            send(400, { code: 400, msg: '圣遗物数据不完整' })
            return
          }

          const list = JSON.parse(await readFile(ARTIFACT_TEST_DATA, 'utf8'))

          // 实例 id 由服务端分配：同 relicId 下取现有最大值 +1
          const id = nextRelicInstanceId(list, relic.relicId)

          if (id === null) {
            send(409, { code: 409, msg: `relicId ${relic.relicId} 的实例编号已用满` })
            return
          }

          // id 一律由服务端分配，客户端传来的同名值丢弃
          const payload = { ...relic }
          delete payload.id
          const next = [...list, { id, ...payload }]
          const prettier = await import('prettier')
          const text = await prettier.format(JSON.stringify(next), {
            parser: 'json',
            printWidth: 100,
            tabWidth: 2,
          })

          await writeFile(ARTIFACT_TEST_DATA, text, 'utf8')

          send(200, { code: 200, msg: 'ok', data: next })
        } catch (error) {
          send(500, { code: 500, msg: String(error?.message ?? error) })
        }
      })
    },
    // 前端用接口返回值更新列表，这里吞掉文件变更的 HMR，避免整页刷新把表单状态冲掉
    handleHotUpdate(context) {
      if (context.file === ARTIFACT_TEST_DATA) return []
      return undefined
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue(), vueDevTools(), artifactTestDataApi()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0', // 允许同一局域网内的设备访问
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 后端
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // 去掉 /api 前缀
      },
    },
  },
})
