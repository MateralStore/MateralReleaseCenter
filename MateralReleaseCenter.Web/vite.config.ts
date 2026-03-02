import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'

// https://vite.dev/config/
export default defineConfig({
  // base: '/',
  plugins: [
    react(),
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: 'css',
        }),
      ],
    }),
  ],
  build: {
    outDir: '../MateralReleaseCenter.ServerCenter/MateralReleaseCenter.ServerCenter.Application/MRCManagement',
    // outDir: '../MateralReleaseCenter.ServerCenter/MateralReleaseCenter.ServerCenter.WebAPI/bin/Debug/net10.0/MRCManagement',
  },
})
