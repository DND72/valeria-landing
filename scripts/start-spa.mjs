/**
 * Avvio statico per Railway / Docker: ascolta su 0.0.0.0 (non solo localhost).
 * Cross-platform (Windows + Linux).
 */
import { spawn } from 'node:child_process'
import process from 'node:process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const port = process.env.PORT ?? '3000'
const serveMain = join(root, 'node_modules', 'serve', 'build', 'main.js')

const child = spawn(
  process.execPath,
  [serveMain, 'dist', '--single', '-l', `tcp://0.0.0.0:${port}`],
  { stdio: 'inherit', cwd: root }
)

child.on('exit', (code) => process.exit(code ?? 0))
