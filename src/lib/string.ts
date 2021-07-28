import shortid from 'shortid'
import { randomBytes } from 'crypto'
import originalFilenamify from 'filenamify'
import UuidParse from 'uuid-parse'

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function generateId(): string {
  return shortid.generate()
}

export const generateRandomHex = () => randomBytes(32).toString('hex')

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|\[\]\\]/g, '\\$&')
}

export function filenamify(value: string) {
  return originalFilenamify(value, { replacement: '-' })
}

export function getHexatrigesimalString(value: number) {
  return value.toString(36)
}

export function parseNumberStringOrReturnZero(str: string): number {
  if (!Number.isNaN(parseInt(str))) {
    return parseInt(str)
  } else {
    return 0
  }
}

export function getHexFromUUID(uuid: string) {
  const uuidBuffer = Buffer.alloc(16)
  UuidParse.parse(uuid, uuidBuffer)
  const uuidHex = uuidBuffer.toString('hex')
  return uuidHex
}

export function getUUIDFromHex(hex: string) {
  const hexBuffer = Buffer.from(hex, 'hex')
  const uuidResultBuffer = UuidParse.unparse(hexBuffer)
  return uuidResultBuffer.toString()
}
