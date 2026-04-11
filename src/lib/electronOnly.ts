import { Stats } from 'fs'
import { JsonValue } from 'type-fest'
import {
  BrowserWindowConstructorOptions,
  BrowserWindow,
  MenuItemConstructorOptions,
  IpcRendererEvent,
  WebContents,
  PrintToPDFOptions,
} from 'electron'
import { CookiesSetDetails, CookiesGetFilter, Cookie } from 'electron/main'
import { Got } from 'got'

interface SerializedDirent {
  name: string
  isDirectory: boolean
  isFile: boolean
  isSymbolicLink: boolean
}

const __ELECTRON_ONLY__: {
  readFile(pathname: string): Promise<string>
  readFileBuffer(pathname: string): Promise<Uint8Array>
  readdir(
    pathname: string,
    options?: { withFileTypes?: false }
  ): Promise<string[]>
  readdir(
    pathname: string,
    options: { withFileTypes: true }
  ): Promise<SerializedDirent[]>
  writeFile(pathname: string, data: string | Buffer): Promise<void>
  unlinkFile(pathname: string): Promise<void>
  stat(pathname: string): Promise<Stats>
  mkdir(pathname: string): Promise<void>
  readFileType(pathname: string): Promise<string>
  readFileTypeFromBuffer(
    buffer: Buffer | Uint8Array | ArrayBuffer
  ): Promise<string>
  showOpenDialog(
    options: Electron.OpenDialogOptions
  ): Promise<Electron.OpenDialogReturnValue>
  showSaveDialog(
    options: Electron.SaveDialogOptions
  ): Promise<Electron.SaveDialogReturnValue>
  openExternal(url: string): Promise<void>
  openPath(fullPath: string, folderOnly?: boolean): Promise<string>
  getPathForFile(file: File): string
  parseCSON(value: string): JsonValue
  stringifyCSON(value: any): string
  openNewWindow(options: BrowserWindowConstructorOptions): BrowserWindow
  openContextMenu(options: { menuItems: MenuItemConstructorOptions[] }): void
  getPathByName(name: string): Promise<string>
  addIpcListener(
    channel: string,
    listener: (event: IpcRendererEvent, ...args: any[]) => void
  ): void
  sendIpcMessage(channel: string, data: any[]): void
  removeIpcListener(
    channel: string,
    listener: (event: IpcRendererEvent, ...args: any[]) => void
  ): void
  removeAllIpcListeners(channel: string): void
  setAsDefaultProtocolClient(protocol: string): boolean
  removeAsDefaultProtocolClient(protocol: string): boolean
  isDefaultProtocolClient(protocol: string): boolean
  getWebContentsById(id: number): WebContents
  setTrafficLightPosition(position: { x: number; y: number }): void
  convertHtmlStringToPdfBuffer(
    htmlString: string,
    printOptions: PrintToPDFOptions
  ): Promise<Buffer>
  setCookie(cookieDetails: CookiesSetDetails): Promise<void>
  getCookie(filter: CookiesGetFilter): Promise<Cookie[]>
  removeCookie(url: string, name: string): Promise<void>
  setBadgeCount(count: number): boolean
  got: Got
} = (window as any).__ELECTRON_ONLY__

const {
  readFile,
  readFileBuffer,
  readdir,
  writeFile,
  unlinkFile,
  stat,
  mkdir,
  readFileType,
  readFileTypeFromBuffer,
  showOpenDialog,
  showSaveDialog,
  openExternal: openExternalUnsafe,
  openPath: openPathUnsafe,
  getPathForFile,
  parseCSON,
  stringifyCSON,
  openNewWindow,
  openContextMenu,
  getPathByName,
  addIpcListener,
  sendIpcMessage,
  removeIpcListener,
  removeAllIpcListeners,
  setAsDefaultProtocolClient,
  removeAsDefaultProtocolClient,
  isDefaultProtocolClient,
  getWebContentsById,
  setTrafficLightPosition,
  convertHtmlStringToPdfBuffer,
  setCookie,
  getCookie,
  removeCookie,
  setBadgeCount,
  got,
} = __ELECTRON_ONLY__ || {}

async function openExternal(url: string) {
  return openExternalUnsafe(url)
}

async function openPath(fullPath: string, folderOnly = false) {
  try {
    return await openPathUnsafe(fullPath, folderOnly)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`Failed to request shell.openPath for ${fullPath}`, error)
    return message
  }
}

async function readFileAsString(pathname: string) {
  return readFile(pathname)
}

async function prepareDirectory(pathname: string) {
  try {
    const stats = await stat(pathname)
    if (!stats.isDirectory) {
      throw new Error(
        `Failed to prepare a directory because ${pathname} is a file`
      )
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      await mkdir(pathname)
    } else {
      throw error
    }
  }
}

export {
  readFile,
  readFileBuffer,
  readFileAsString,
  readdir,
  writeFile,
  unlinkFile,
  stat,
  mkdir,
  prepareDirectory,
  readFileType,
  readFileTypeFromBuffer,
  showOpenDialog,
  showSaveDialog,
  openExternal,
  openPath,
  getPathForFile,
  parseCSON,
  stringifyCSON,
  openNewWindow,
  openContextMenu,
  getPathByName,
  addIpcListener,
  sendIpcMessage,
  removeIpcListener,
  removeAllIpcListeners,
  setAsDefaultProtocolClient,
  removeAsDefaultProtocolClient,
  isDefaultProtocolClient,
  getWebContentsById,
  setTrafficLightPosition,
  convertHtmlStringToPdfBuffer,
  setCookie,
  getCookie,
  removeCookie,
  setBadgeCount,
  got,
}
