/* eslint-disable @typescript-eslint/no-var-requires */
// import { parse } from 'url'
;(function () {
  if (typeof require === 'undefined') {
    return
  }
  const electron = require('electron')
  // window.electron = electron
  // const fs = require('fs')
  // const FileType = require('file-type')
  // const readChunk = require('read-chunk')
  // const CSON = require('cson-parser')
  // const got = require('got')
  // const isSvg = require('is-svg')
  const ipcRenderer = electron.ipcRenderer
  const contextBridge = electron.contextBridge

  const electronAPI = {
    // ---------------- APP ----------------
    app: {
      getPath: (name: string) => ipcRenderer.invoke('app:get-path', name),
      setBadgeCount: (n: number) =>
        ipcRenderer.invoke('app:set-badge-count', n),
      setDefaultProtocol: (p: string) =>
        ipcRenderer.invoke('app:set-default-protocol', p),
      removeDefaultProtocol: (p: string) =>
        ipcRenderer.invoke('app:remove-default-protocol', p),
      isDefaultProtocol: (p: string) =>
        ipcRenderer.invoke('app:is-default-protocol', p),
    },

    // ---------------- SHELL ----------------
    shell: {
      openExternal: (url: string) =>
        ipcRenderer.invoke('shell:open-external', url),
      openPath: (path: string) => ipcRenderer.invoke('shell:open-path', path),
      showItem: (path: string) => ipcRenderer.invoke('shell:show-item', path),
    },

    // ---------------- FS ----------------
    fs: {
      readFile: (p: string) => ipcRenderer.invoke('fs:read-file', p),
      writeFile: (p: string, d: any) =>
        ipcRenderer.invoke('fs:write-file', p, d),
      readdir: (p: string, o?: any) => ipcRenderer.invoke('fs:readdir', p, o),
      unlink: (p: string) => ipcRenderer.invoke('fs:unlink', p),
      stat: (p: string) => ipcRenderer.invoke('fs:stat', p),
      mkdir: (p: string) => ipcRenderer.invoke('fs:mkdir', p),
    },

    // ---------------- DIALOG ----------------
    dialog: {
      open: (opts: any) => ipcRenderer.invoke('dialog:open', opts),
      save: (opts: any) => ipcRenderer.invoke('dialog:save', opts),
    },

    // ---------------- WINDOW ----------------
    window: {
      create: (opts: any) => ipcRenderer.invoke('window:create', opts),
      setButtonPosition: (pos: any) =>
        ipcRenderer.invoke('window:set-button-position', pos),
    },

    // ---------------- COOKIES ----------------
    cookies: {
      set: (c: any) => ipcRenderer.invoke('cookies:set', c),
      get: (f: any) => ipcRenderer.invoke('cookies:get', f),
      remove: (u: string, n: string) =>
        ipcRenderer.invoke('cookies:remove', u, n),
    },

    // ---------------- IPC RAW (escape hatch only) ----------------
    ipc: {
      send: (ch: string, d: any) => ipcRenderer.send(ch, d),
      on: (ch: string, fn: (...args: any[]) => void) => ipcRenderer.on(ch, fn),
    },
  }
  contextBridge.exposeInMainWorld('electronAPI', electronAPI)

  function createElectronOnlyAdapter(api: any) {
    return {
      // ---------------- FS ----------------
      readFile: api.fs.readFile,
      readdir: api.fs.readdir,
      writeFile: api.fs.writeFile,
      unlinkFile: api.fs.unlink,
      stat: api.fs.stat,
      mkdir: api.fs.mkdir,

      // ---------------- FILE TYPE ----------------
      readFileType: api.fs.readFileType, // if you still keep it backend-side
      readFileTypeFromBuffer: api.fs.readFileTypeFromBuffer,

      // ---------------- DIALOG ----------------
      showOpenDialog: api.dialog.open,
      showSaveDialog: api.dialog.save,

      // ---------------- SHELL ----------------
      openExternal: api.shell.openExternal,
      openPath: api.shell.openPath,

      // ---------------- CSON ----------------
      parseCSON: api.utils?.parseCSON,
      stringifyCSON: api.utils?.stringifyCSON,

      // ---------------- WINDOW ----------------
      openNewWindow: api.window.create,

      openContextMenu: (options: any) => {
        // needs main-side IPC if you kept it there
        return api.window.openContextMenu?.(options)
      },

      setTrafficLightPosition: api.window.setButtonPosition,

      // ---------------- APP PATHS ----------------
      getPathByName: api.app.getPath,

      // ---------------- IPC ----------------
      addIpcListener: api.ipc.on,
      sendIpcMessage: api.ipc.send,
      removeIpcListener: api.ipc.off,
      removeAllIpcListeners: api.ipc.removeAll,

      // ---------------- PROTOCOL ----------------
      setAsDefaultProtocolClient: api.app.setDefaultProtocol,
      removeAsDefaultProtocolClient: api.app.removeDefaultProtocol,
      isDefaultProtocolClient: api.app.isDefaultProtocol,

      // ---------------- WEBCONTENTS ----------------
      getWebContentsById: api.window.getWebContentsById,

      // ---------------- COOKIES ----------------
      setCookie: api.cookies.set,
      getCookie: api.cookies.get,
      removeCookie: api.cookies.remove,

      // ---------------- BADGE ----------------
      setBadgeCount: api.app.setBadgeCount,

      // ---------------- NETWORK ----------------
      got: api.net?.got, // if you expose it

      // ---------------- PDF ----------------
      convertHtmlStringToPdfBuffer: api.window.convertHtmlToPdf,
    }
  }
  contextBridge.exposeInMainWorld(
    '__ELECTRON_ONLY__',
    createElectronOnlyAdapter(electronAPI)
  )
  //   window.__ELECTRON_ONLY__ = {}
  //   window.__ELECTRON_ONLY__.openExternal = openExternal
  //   window.__ELECTRON_ONLY__.openPath = openPath
  //   window.__ELECTRON_ONLY__.readFile = readFile
  //   window.__ELECTRON_ONLY__.showOpenDialog = showOpenDialog
  //   window.__ELECTRON_ONLY__.showSaveDialog = showSaveDialog
  //   window.__ELECTRON_ONLY__.getHomePath = getHomePath
  //   window.__ELECTRON_ONLY__.writeFile = writeFile
  //   window.__ELECTRON_ONLY__.unlinkFile = unlinkFile
  //   window.__ELECTRON_ONLY__.readdir = readdir
  //   window.__ELECTRON_ONLY__.stat = stat
  //   window.__ELECTRON_ONLY__.mkdir = mkdir
  //   window.__ELECTRON_ONLY__.readFileType = readFileType
  //   window.__ELECTRON_ONLY__.readFileTypeFromBuffer = readFileTypeFromBuffer
  //   window.__ELECTRON_ONLY__.parseCSON = parseCSON
  //   window.__ELECTRON_ONLY__.stringifyCSON = stringifyCSON
  //   window.__ELECTRON_ONLY__.openNewWindow = openNewWindow
  //   window.__ELECTRON_ONLY__.openContextMenu = openContextMenu
  //   window.__ELECTRON_ONLY__.getPathByName = getPathByName
  //   window.__ELECTRON_ONLY__.addIpcListener = addIpcListener
  //   window.__ELECTRON_ONLY__.sendIpcMessage = sendIpcMessage
  //   window.__ELECTRON_ONLY__.removeIpcListener = removeIpcListener
  //   window.__ELECTRON_ONLY__.removeAllIpcListeners = removeAllIpcListeners
  //   window.__ELECTRON_ONLY__.setAsDefaultProtocolClient = setAsDefaultProtocolClient
  //   window.__ELECTRON_ONLY__.removeAsDefaultProtocolClient = removeAsDefaultProtocolClient
  //   window.__ELECTRON_ONLY__.isDefaultProtocolClient = isDefaultProtocolClient
  //   window.__ELECTRON_ONLY__.getWebContentsById = getWebContentsById
  //   window.__ELECTRON_ONLY__.setTrafficLightPosition = setTrafficLightPosition
  //   window.__ELECTRON_ONLY__.convertHtmlStringToPdfBuffer = convertHtmlStringToPdfBuffer
  //   window.__ELECTRON_ONLY__.setCookie = setCookie
  //   window.__ELECTRON_ONLY__.getCookie = getCookie
  //   window.__ELECTRON_ONLY__.removeCookie = removeCookie
  //   window.__ELECTRON_ONLY__.setBadgeCount = setBadgeCount
  //   window.__ELECTRON_ONLY__.got = got
})()
