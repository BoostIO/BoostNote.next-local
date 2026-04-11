import { BaseWindow, BrowserWindow, MenuItem } from 'electron'

export function createEmitIpcMenuItemHandler(eventName: string) {
  return function (_menuItem: MenuItem, window?: BaseWindow) {
    if (!(window instanceof BrowserWindow)) {
      console.warn(
        `Failed to emit \`${eventName}\` ipc event because the browser window for menu item is missing`
      )
      return
    }
    window.webContents.send(eventName)
  }
}
