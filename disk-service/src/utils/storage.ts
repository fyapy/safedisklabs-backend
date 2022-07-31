import type { preHandlerAsyncHookHandler } from 'fastify'
import type { File } from './types'
import { extname, join } from 'node:path'
import fs from 'node:fs/promises'
import fsSync from 'node:fs'
import crypto from 'node:crypto'
import multer from 'fastify-multer'

export const bytesToMB = (bytes: number) => bytes / (1024 * 1024)
export const MBToBytes = (mg: number) => mg * 1024 * 1024

export const rootPath = (...args: string[]) => join(process.cwd(), ...args)
export const fileExist = (path: string) => new Promise(
  resolve => fsSync.access(path, fsSync.constants.F_OK, err => resolve(!err)),
)

export const tmpStorage = multer.diskStorage({
  destination: rootPath('public/tmp'),
  filename: (req, file, cb) => cb(
    null,
    `${crypto.randomUUID()}_${Date.now()}${extname(file.originalname)}`,
  ),
})

const unlinkFile = async (file: File) => {
  if (!file?.path) return

  if (await fileExist(file.path)) {
    await fs.unlink(file.path)
  }
}
export const afterUpload: preHandlerAsyncHookHandler = async ({ file, files }) => {
  if (file) {
    await unlinkFile(file)
  }

  if (typeof files === 'object' && files !== null) {
    await Promise.all(files.map(unlinkFile))
  }
}
