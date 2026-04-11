import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  ipcMain,
  Menu,
  MenuItemConstructorOptions,
  protocol,
  session,
  autoUpdater,
  dialog,
  shell,
} from 'electron'
import path from 'path'
import url from 'url'
import { getTemplateFromKeymap } from './menu'
import { dev } from './consts'
import fs from 'fs'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: BrowserWindow | null = null
const MAC = process.platform === 'darwin'

// single instance lock
const singleInstance = app.requestSingleInstanceLock()

const keymap = new Map<string, string>([
  ['toggleGlobalSearch', 'Ctrl + P'],
  ['toggleSplitEditMode', 'Ctrl + \\'],
  ['togglePreviewMode', 'Ctrl + E'],
  ['editorSaveAs', 'Ctrl + S'],
  ['closeWindow', 'Ctrl + W'],
])

function applyMenuTemplate(template: MenuItemConstructorOptions[]) {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function createMainWindow() {
  const windowOptions: BrowserWindowConstructorOptions = {
    webPreferences: {
      nodeIntegration: true,
      webSecurity: !dev,
      webviewTag: true,
      contextIsolation: true,
      preload: dev
        ? path.join(app.getAppPath(), '../static/main-preload.ts')
        : path.join(app.getAppPath(), './compiled/app/static/main-preload.js'),
    },
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 630,
  }

  const window = new BrowserWindow(windowOptions)

  if (dev) {
    window.loadURL(`http://localhost:3000/app`, {
      userAgent: session.defaultSession.getUserAgent() + ` BoostNote`,
    })
  } else {
    window.loadURL(
      url.format({
        pathname: path.join(app.getAppPath(), './compiled/index.html'),
        protocol: 'file',
        slashes: true,
      })
    )
  }

  applyMenuTemplate(getTemplateFromKeymap(keymap))

  if (MAC) {
    window.on('close', (event) => {
      event.preventDefault()
      window.hide()
    })

    app.on('before-quit', () => {
      window.removeAllListeners()
    })

    autoUpdater.on('before-quit-for-update', () => {
      window.removeAllListeners()
    })
  }

  window.on('closed', () => {
    mainWindow = null
  })

  return window
}

// single instance lock handler
if (!singleInstance) {
  app.quit()
} else {
  app.on('second-instance', (_event, argv) => {
    if (mainWindow) {
      if (!mainWindow.isVisible()) mainWindow.show()
      mainWindow.focus()
    }

    if (!MAC) {
      let urlWithBoostNoteProtocol
      for (const arg of argv) {
        if (/^boostnote:\/\//.test(arg)) {
          urlWithBoostNoteProtocol = arg
          break
        }
      }
      if (urlWithBoostNoteProtocol != null && mainWindow != null) {
        mainWindow.webContents.send(
          'open-boostnote-url',
          urlWithBoostNoteProtocol
        )
      }
    }
  })
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  } else {
    mainWindow.show()
    mainWindow.focus()
  }
})

// bind main ipc API for electron
//
//
//
function bindElectornOnlAPI() {
  // --- App APIs ---
  ipcMain.handle('app:get-path', (_e, name: string) => {
    if (name === 'app') return app.getAppPath()
    return app.getPath(name as any)
  })

  ipcMain.handle('app:set-badge-count', (_e, count: number) => {
    return app.setBadgeCount(count)
  })

  ipcMain.handle('app:set-default-protocol', (_e, protocol: string) => {
    return app.setAsDefaultProtocolClient(protocol)
  })

  ipcMain.handle('app:remove-default-protocol', (_e, protocol: string) => {
    return app.removeAsDefaultProtocolClient(protocol)
  })

  ipcMain.handle('app:is-default-protocol', (_e, protocol: string) => {
    return app.isDefaultProtocolClient(protocol)
  })

  // ---------------- DIALOG ----------------

  ipcMain.handle('dialog:open', (_e, options) => {
    return dialog.showOpenDialog(options)
  })

  ipcMain.handle('dialog:save', (_e, options) => {
    return dialog.showSaveDialog(options)
  })

  // ---------------- SHELL ----------------

  ipcMain.handle('shell:open-external', (_e, url: string) => {
    return shell.openExternal(url)
  })

  ipcMain.handle('shell:open-path', (_e, fullPath: string) => {
    return shell.openPath(fullPath)
  })

  ipcMain.handle('shell:show-item', (_e, fullPath: string) => {
    return shell.showItemInFolder(fullPath)
  })

  // ---------------- FS ----------------

  ipcMain.handle('fs:read-file', (_e, path: string) =>
    fs.promises.readFile(path, 'utf8')
  )
  ipcMain.handle('fs:read-file-buffer', (_e, path: string) =>
    fs.promises.readFile(path)
  )
  ipcMain.handle('fs:write-file', (_e, path: string, data: any) =>
    fs.promises.writeFile(path, data)
  )
  ipcMain.handle('fs:readdir', (_e, path: string, options?: any) =>
    fs.promises.readdir(path, options)
  )
  ipcMain.handle('fs:unlink', (_e, path: string) => fs.promises.unlink(path))
  ipcMain.handle('fs:stat', async (_e, path: string) => {
    const stats = await fs.promises.stat(path)
    return {
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile(),
      isSymbolicLink: stats.isSymbolicLink(),

      size: stats.size,
      mode: stats.mode,
      mtimeMs: stats.mtimeMs,
      atimeMs: stats.atimeMs,
      birthtimeMs: stats.birthtimeMs,
    }
  })
  ipcMain.handle('fs:mkdir', (_e, path: string) =>
    fs.promises.mkdir(path, { recursive: true })
  )
}

// =============================================
// COMPAT LAYER: __ELECTRON_ONLY__ → electronAPI
// =============================================

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  /* This file protocol registration will be needed from v9.x.x for PDF export feature */
  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = decodeURI(request.url.replace('file:///', ''))
    callback(pathname)
  })
  bindElectornOnlAPI()
  mainWindow = createMainWindow()

  ipcMain.on('menuAcceleratorChanged', (_, args) => {
    if (args.length != 2) {
      return
    }
    const menuItemId = args[0]
    const newAcceleratorShortcut = args[1] == null ? undefined : args[1]

    keymap.set(menuItemId, newAcceleratorShortcut)
    applyMenuTemplate(getTemplateFromKeymap(keymap))
  })

  app.on('open-url', (_event, url) => {
    mainWindow!.webContents.send('open-boostnote-url', url)
  })
})
