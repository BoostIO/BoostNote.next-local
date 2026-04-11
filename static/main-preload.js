;(function () {
  if (typeof require === 'undefined') {
    return
  }

  const electron = require('electron')
  const ipcRenderer = electron.ipcRenderer
  const contextBridge = electron.contextBridge
  const webUtils = electron.webUtils

  const electronAPI = {
    app: {
      getPath: (name) => ipcRenderer.invoke('app:get-path', name),
      setBadgeCount: (n) => ipcRenderer.invoke('app:set-badge-count', n),
      setDefaultProtocol: (p) =>
        ipcRenderer.invoke('app:set-default-protocol', p),
      removeDefaultProtocol: (p) =>
        ipcRenderer.invoke('app:remove-default-protocol', p),
      isDefaultProtocol: (p) =>
        ipcRenderer.invoke('app:is-default-protocol', p),
    },

    shell: {
      openExternal: (url) => ipcRenderer.invoke('shell:open-external', url),
      openPath: (targetPath, folderOnly = false) =>
        ipcRenderer.invoke('shell:open-path', targetPath, folderOnly),
      showItem: (targetPath) =>
        ipcRenderer.invoke('shell:show-item', targetPath),
      getPathForFile: (file) => webUtils.getPathForFile(file),
    },

    fs: {
      readFile: (p) => ipcRenderer.invoke('fs:read-file', p),
      readFileType: (p) => ipcRenderer.invoke('fs:read-file-type', p),
      readFileBuffer: (p) => ipcRenderer.invoke('fs:read-file-buffer', p),
      writeFile: (p, d) => ipcRenderer.invoke('fs:write-file', p, d),
      readdir: (p, o) => ipcRenderer.invoke('fs:readdir', p, o),
      unlink: (p) => ipcRenderer.invoke('fs:unlink', p),
      stat: (p) => ipcRenderer.invoke('fs:stat', p),
      mkdir: (p) => ipcRenderer.invoke('fs:mkdir', p),
    },

    dialog: {
      open: (opts) => ipcRenderer.invoke('dialog:open', opts),
      save: (opts) => ipcRenderer.invoke('dialog:save', opts),
    },

    window: {
      create: (opts) => ipcRenderer.invoke('window:create', opts),
      setButtonPosition: (pos) =>
        ipcRenderer.invoke('window:set-button-position', pos),
      convertHtmlToPdf: (htmlString, printOptions) =>
        ipcRenderer.invoke(
          'window:convert-html-to-pdf',
          htmlString,
          printOptions
        ),
    },

    cookies: {
      set: (c) => ipcRenderer.invoke('cookies:set', c),
      get: (f) => ipcRenderer.invoke('cookies:get', f),
      remove: (u, n) => ipcRenderer.invoke('cookies:remove', u, n),
    },

    ipc: {
      send: (ch, d) => ipcRenderer.send(ch, d),
      on: (ch, fn) => ipcRenderer.on(ch, fn),
      off: (ch, fn) => ipcRenderer.off(ch, fn),
      removeAll: () => ipcRenderer.removeAllListeners(),
    },
  }

  contextBridge.exposeInMainWorld('electronAPI', electronAPI)

  function createElectronOnlyAdapter(api) {
    return {
      readFile: api.fs.readFile,
      readFileBuffer: api.fs.readFileBuffer,
      readdir: api.fs.readdir,
      writeFile: api.fs.writeFile,
      unlinkFile: api.fs.unlink,
      stat: api.fs.stat,
      mkdir: api.fs.mkdir,

      readFileType: api.fs.readFileType,
      readFileTypeFromBuffer: api.fs.readFileTypeFromBuffer,

      showOpenDialog: api.dialog.open,
      showSaveDialog: api.dialog.save,

      openExternal: api.shell.openExternal,
      openPath: api.shell.openPath,
      getPathForFile: api.shell.getPathForFile,

      parseCSON: api.utils && api.utils.parseCSON,
      stringifyCSON: api.utils && api.utils.stringifyCSON,

      openNewWindow: api.window.create,
      openContextMenu: (options) =>
        api.window.openContextMenu && api.window.openContextMenu(options),
      setTrafficLightPosition: api.window.setButtonPosition,
      getPathByName: api.app.getPath,

      addIpcListener: api.ipc.on,
      sendIpcMessage: api.ipc.send,
      removeIpcListener: api.ipc.off,
      removeAllIpcListeners: api.ipc.removeAll,

      setAsDefaultProtocolClient: api.app.setDefaultProtocol,
      removeAsDefaultProtocolClient: api.app.removeDefaultProtocol,
      isDefaultProtocolClient: api.app.isDefaultProtocol,

      getWebContentsById: api.window.getWebContentsById,

      setCookie: api.cookies.set,
      getCookie: api.cookies.get,
      removeCookie: api.cookies.remove,

      setBadgeCount: api.app.setBadgeCount,

      got: api.net && api.net.got,

      convertHtmlStringToPdfBuffer: api.window.convertHtmlToPdf,
    }
  }

  contextBridge.exposeInMainWorld(
    '__ELECTRON_ONLY__',
    createElectronOnlyAdapter(electronAPI)
  )
})()
