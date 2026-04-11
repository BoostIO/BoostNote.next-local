import { parse as parseUrl } from 'url'
import { IpcRendererEvent } from 'electron/renderer'
import { useIpcListener } from './useIpcListener'

export function useBoostNoteProtocol() {
  useIpcListener('open-boostnote-url', (_event: IpcRendererEvent, url: string) => {
    const parsedUrl = parseUrl(url, true)

    switch (parsedUrl.pathname) {
      case '/':
      default:
        console.warn(`Not supported URL: ${url}`)
    }
  })
}
