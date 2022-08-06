import type { preHandlerAsyncHookHandler } from 'fastify'
import type { File } from './types'
import { extname, join } from 'node:path'
import fs from 'node:fs/promises'
import fsSync from 'node:fs'
import crypto from 'node:crypto'
import multer from 'fastify-multer'
import { FileExtension, MimeType, fromFile } from 'file-type'
import { Client } from 'minio'

export const bytesToMB = (bytes: number) => bytes / (1024 * 1024)
export const MBToBytes = (mg: number) => mg * 1024 * 1024
export const GBToBytes = (gb: number) => gb * MBToBytes(1024)

export const rootPath = (...args: string[]) => join(process.cwd(), ...args)
export const fileExist = (path: string) => new Promise(
  resolve => fsSync.access(path, fsSync.constants.F_OK, err => resolve(!err)),
)

export async function mimeType(file: File): Promise<{
  size: number
  ext: FileExtension | 'svg' | string | null
  mime: MimeType | 'image/svg+xml' | string | null
}> {
  const [{ size }, fileType] = await Promise.all([
    fs.stat(file.path!),
    fromFile(file.path!),
  ])
  if (typeof fileType !== 'undefined') {
    return {
      ...fileType,
      size,
    }
  }

  return {
    size,
    ext: extname(file.originalname).replace('.', '') ?? null,
    mime: file.mimetype ?? null,
  }
}

export const tmpStorage = multer.diskStorage({
  destination: rootPath('public/tmp'),
  filename: (_, file, cb) => cb(
    null,
    `${crypto.randomUUID()}_${Date.now()}${extname(file.originalname)}`,
  ),
})
export const fileUpload = multer({
  storage: tmpStorage,
  limits: {
    fieldNameSize: 80,
    fieldSize: MBToBytes(20),
  },
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

const getBalancedDir = async (publicPath: string, maxFilesInDir = 2000) => {
  const path = `/public${publicPath}`
  const normalizedPath = join(process.cwd(), path)
  const dirsCandidates = await fs.readdir(normalizedPath)
  const dirs = dirsCandidates.map(Number).filter(num => !isNaN(num))
  dirs.sort()

  const lastDir = dirs[dirs.length - 1]

  if (typeof lastDir === 'undefined') return `${path}/0`

  const lastDirPath = join(normalizedPath, `${lastDir}`)
  const filesInFolder = await fs.readdir(lastDirPath)

  if (filesInFolder.length >= maxFilesInDir) {
    const newFolderIndex = Number(dirs[dirs.length - 1]) + 1

    return `${path}/${newFolderIndex}`.replace('/public', '')
  }

  return `${path}/${lastDir}`.replace('/public', '')
}
export const scaleDirectory = async (path: string) => {
  await fs.mkdir(join(process.cwd(), `/public${path}`), { recursive: true })
  const dir = await getBalancedDir(path)
  await fs.mkdir(join(process.cwd(), dir), { recursive: true })

  return dir.replace('/public', '')
}
export const filePaths = (
  dir: string,
  ext: string,
  randomName = crypto.randomUUID(),
) => {
  const filePath = `${dir}/${randomName}.${ext}`
  const newFilePath = join(process.cwd(), `/public${filePath}`)

  return {
    path: filePath,
    fullPath: newFilePath,
  }
}

export const reqToFile = ({ file, files }: {
  file: File
  files: File[]
}) => typeof file !== 'undefined'
  ? [file]
  : (files?.length
    ? files
    : [])

export const deletePublicFile = (path: string) => join(process.cwd(), '/public', path)
export const unlinkPublicFile = (path: string) => fs.unlink(deletePublicFile(path)).catch(() => {})

export async function saveFile(file: File) {
  const tmpPath = file.path!

  const dir = await scaleDirectory('/files')
  const { ext, mime } = (await fromFile(tmpPath))!
  const img = filePaths(dir, ext)

  try {
    await fs.rename(tmpPath, img.fullPath)

    return {
      path: img.path,
      mime,
      ext,
    }
  } catch (e) {
    throw e
  }
}

const _minIO = new Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'TestDSL',
  secretKey: '12345678',
})

export function minIoPutFile(objectName: string, file: File) {
  return _minIO.putObject('disksafelabs', objectName, file.path!)
}

export function minIoRemoveFile(objectName: string) {
  return _minIO.removeObject('disksafelabs', objectName)
}
