import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const appHost = 'app.eduvia.name.ng'
const certificatePath = resolve('certs', `${appHost}.pem`)
const privateKeyPath = resolve('certs', `${appHost}-key.pem`)

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: [appHost],
    https:
      existsSync(certificatePath) && existsSync(privateKeyPath)
        ? {
            cert: readFileSync(certificatePath),
            key: readFileSync(privateKeyPath),
          }
        : undefined,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
    allowedHosts: [appHost],
  },
})
