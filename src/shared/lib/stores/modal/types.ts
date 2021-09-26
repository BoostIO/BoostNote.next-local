import React from 'react'

export interface ModalElement {
  title?: React.ReactNode
  content: React.ReactNode
  showCloseIcon?: boolean
  width: 'large' | 'default' | 'small' | number
  position?: {
    left: number
    right: number
    top: number
    bottom: number
    alignment: ContextModalAlignment
  }
  onClose?: () => void
}

export type ContextModalAlignment = 'bottom-left' | 'bottom-right'
export type ModalOpeningOptions = {
  showCloseIcon?: boolean
  keepAll?: boolean
  width?: 'large' | 'default' | 'small' | number
  title?: string
  onClose?: () => void
}

export type ContextModalOpeningOptions = ModalOpeningOptions & {
  alignment?: ContextModalAlignment
}

export interface ModalsContext {
  modals: ModalElement[]
  openContextModal: (
    event: React.MouseEvent<Element>,
    modalContent: JSX.Element,
    options?: ContextModalOpeningOptions
  ) => void
  openModal: (modalContent: JSX.Element, options?: ModalOpeningOptions) => void
  closeModal: (index: number, collapse?: boolean) => void
  closeAllModals: () => void
  closeLastModal: () => void
}
