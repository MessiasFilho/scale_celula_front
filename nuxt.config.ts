/// <reference types="node" />
// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

function normalizeApiUrl(url: string): string {
  const trimmed = url.trim().replace(/\/$/, '')
  if (!trimmed) return 'http://localhost:4044'
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function resolveApiBase(): string {
  const env = (process.env.ENV ?? 'dev').trim().toLowerCase()

  if (env === 'prod' || env === 'production') {
    const prodUrl = process.env.URL_PROD?.trim()
    if (!prodUrl) {
      throw new Error('URL_PROD must be set when ENV=prod')
    }
    return normalizeApiUrl(prodUrl)
  }

  return normalizeApiUrl(process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:4044')
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.ENV !== 'prod' },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiBase: resolveApiBase(),
      env: (process.env.ENV ?? 'dev').trim().toLowerCase(),
    },
  },
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&display=swap',
        },
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ],
    },
  },
})
