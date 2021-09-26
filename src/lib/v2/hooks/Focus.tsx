import { MutableRefObject, useRef } from 'react'

const useFocus = (): [any, () => void] => {
  const htmlElRef: MutableRefObject<any> = useRef(null)
  const setFocus = (): void => {
    htmlElRef?.current?.focus?.()
  }

  return [htmlElRef, setFocus]
}

export default useFocus
