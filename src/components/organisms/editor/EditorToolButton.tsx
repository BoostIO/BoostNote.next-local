import React from 'react'
import {
  StyledEditorToolButtonContainer,
  StyledEditorToolButton,
} from './styled'
import WithTooltip from '../../../shared/components/atoms/WithTooltip'
import Icon from '../../../shared/components/atoms/Icon'

interface EditorToolButtonProps {
  tooltip?: string
  path: string
  style?: React.CSSProperties
  dropdown?: React.ReactNode
  onClick?: () => void
  className?: string
}

const EditorToolButton = ({
  path,
  tooltip,
  style,
  onClick,
  className,
}: EditorToolButtonProps) => (
  <StyledEditorToolButtonContainer className={className}>
    <WithTooltip tooltip={tooltip} side={'bottom'}>
      <StyledEditorToolButton onClick={onClick} style={style}>
        <Icon path={path} />
      </StyledEditorToolButton>
    </WithTooltip>
  </StyledEditorToolButtonContainer>
)

export default EditorToolButton
