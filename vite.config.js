import { defineConfig } from 'vite'
import svgrPlugin from 'vite-plugin-svgr'

export default defineConfig({
    base: '/DBoard/',
    build: {
        outDir: 'docs'
    },
    plugins: [
        svgrPlugin({
            svgrOptions: {
              svgo: true
            }
        })
    ]
})