import { useEffect } from 'react'
import { addIpcListener, removeIpcListener } from './electronOnly'
import { parse as parseUrl } from 'url'
import { IpcRendererEvent } from 'electron'

export function useBoostNoteProtocol() {
  useEffect(() => {
    const openBoostNoteUrlHandler = (_event: IpcRendererEvent, url: string) => {
      const parsedUrl = parseUrl(url, true)

      switch (parsedUrl.pathname) {
        case '/':
        default:
          console.warn(`Not supported URL: ${url}`)
      }
    }
    addIpcListener('open-boostnote-url', openBoostNoteUrlHandler)
    return () => {
      removeIpcListener('open-boostnote-url', openBoostNoteUrlHandler)
    }
  }, [])
}
