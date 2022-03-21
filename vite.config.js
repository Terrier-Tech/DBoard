import { defineConfig } from 'vite'
import svgrPlugin from 'vite-plugin-svgr'

export default defineConfig({
    build: {
        outDir: 'docs'
    },
    plugins: [
        svgrPlugin({
            svgrOptions: {
              icon: false
            }
        })
    ]
})