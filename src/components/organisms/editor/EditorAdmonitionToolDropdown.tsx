import React, { useMemo, useRef } from 'react'
import { useEffectOnce } from 'react-use'
import { FormattingTool } from './types'
import { StyledEditorToolDropdownContainer } from './styled'
import { getFirstFocusableChildOfElement } from '../../../shared/lib/dom'
import {
  isSingleKeyEventOutsideOfInput,
  preventKeyboardEventPropagation,
  useGlobalKeyDownHandler,
  useUpDownNavigationListener,
} from '../../../shared/lib/keyboard'
import ContextMenuItem from '../../../shared/lib/stores/contextMenu/ControlsContextMenuItem'
import styled from '../../../shared/lib/styled'

interface EditorAdmonitionToolDropdownProps {
  onFormatCallback: (format: FormattingTool) => void
  closeDropdowndown: () => void
}

interface EditorAdmonitionToolDropdownOption {
  label: string
  format: FormattingTool
}

const options: EditorAdmonitionToolDropdownOption[] = [
  { label: 'Note', format: 'admonitionNote' },
  { label: 'Tip', format: 'admonitionTip' },
  { label: 'Important', format: 'admonitionImportant' },
  { label: 'Danger', format: 'admonitionDanger' },
  { label: 'Warning', format: 'admonitionWarning' },
]

const EditorAdmonitionToolDropdown = ({
  closeDropdowndown,
  onFormatCallback,
}: EditorAdmonitionToolDropdownProps) => {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffectOnce(() => {
    const focusableElement = getFirstFocusableChildOfElement(menuRef.current!)
    if (focusableElement == null) {
      menuRef.current!.focus()
    } else {
      focusableElement.focus()
    }
  })

  const onBlurHandler = (event: any) => {
    if (
      event.relatedTarget == null ||
      menuRef.current!.contains(event.relatedTarget)
    ) {
      return
    }
    closeDropdowndown()
  }

  const keydownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (isSingleKeyEventOutsideOfInput(event, 'escape')) {
        preventKeyboardEventPropagation(event)
        closeDropdowndown()
      }
    }
  }, [closeDropdowndown])
  useGlobalKeyDownHandler(keydownHandler)
  useUpDownNavigationListener(menuRef)

  return (
    <>
      <StyledEditorToolDropdownContainer ref={menuRef} onBlur={onBlurHandler}>
        {options.map((option) => (
          <ContextMenuItem
            key={option.label}
            label={<StyledMenuItem>{option.label}</StyledMenuItem>}
            onClick={() => onFormatCallback(option.format)}
            id={`editor-toolbar-${option.format}`}
          />
        ))}
      </StyledEditorToolDropdownContainer>
    </>
  )
}

export default EditorAdmonitionToolDropdown

const StyledMenuItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`
