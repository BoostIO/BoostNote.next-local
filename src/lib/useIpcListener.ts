import { useEffect, useRef } from 'react'
import { IpcRendererEvent } from 'electron/renderer'
import { addIpcListener, removeIpcListener } from './electronOnly'

type IpcListener = (event: IpcRendererEvent, ...args: any[]) => void

export function useIpcListener(channel: string, listener: IpcListener) {
  const listenerRef = useRef(listener)

  useEffect(() => {
    listenerRef.current = listener
  }, [listener])

  useEffect(() => {
    const wrappedListener: IpcListener = (event, ...args) => {
      listenerRef.current(event, ...args)
    }

    addIpcListener(channel, wrappedListener)

    return () => {
      removeIpcListener(channel, wrappedListener)
    }
  }, [channel])
}
