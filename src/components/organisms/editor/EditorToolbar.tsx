import React, { useCallback } from 'react'
import { Position } from 'codemirror'
import { FormattingTool } from './types'
import { StyledEditorToolList } from './styled'
import {
  mdiFormatBold,
  mdiFormatItalic,
  mdiFormatQuoteClose,
  mdiCodeTags,
  mdiLinkVariant,
  mdiFormatListBulleted,
  mdiFormatListNumbered,
  mdiCheckboxMarkedOutline,
  mdiFormatHeaderPound,
  mdiCodeNotEqualVariant,
  mdiPageNextOutline,
  mdiMathIntegralBox,
  mdiCodeBrackets,
} from '@mdi/js'
import EditorToolButton from './EditorToolButton'
import { lngKeys } from '../../../lib/i18n/types'
import { useTranslation } from 'react-i18next'
import EditorHeaderTool from './EditorHeaderTool'
import EditorAdmonitionTool from './EditorAdmonitionTool'

interface EditorToolbarProps {
  codeMirror?: CodeMirror.EditorFromTextArea
}

const spaceRegex = /^$|\s+/

export function formatCodeMirrorText(
  codeMirror: CodeMirror.EditorFromTextArea,
  format: FormattingTool
) {
  if (codeMirror == null) {
    return
  }

  const useSelection = codeMirror.somethingSelected()
  let word = codeMirror.getSelection()
  let wordRange: { anchor: Position; head?: Position } | undefined
  const cursorPosition = codeMirror.getCursor()

  if (!useSelection) {
    const contentAfter = getCursivePositionAndString(
      codeMirror,
      codeMirror.getCursor(),
      1
    )

    if (contentAfter.val === '') {
      wordRange = {
        anchor: contentAfter.pos,
        head: undefined,
      }
    } else {
      const contentBefore = getCursivePositionAndString(
        codeMirror,
        codeMirror.getCursor(),
        -1
      )

      wordRange = {
        anchor: contentBefore.pos,
        head: contentAfter.pos,
      }
      word = contentBefore.val + contentAfter.val
    }
  }

  let formattingOptions: FormattingBehaviour | undefined
  switch (format) {
    case 'bold':
      formattingOptions = { markerLeft: '**', markerRight: '**' }
      break
    case 'italic':
      formattingOptions = { markerLeft: '_', markerRight: '_' }
      break
    case 'header1':
      formattingOptions = { markerLeft: '# ' }
      break
    case 'header2':
      formattingOptions = { markerLeft: '## ' }
      break
    case 'header3':
      formattingOptions = { markerLeft: '### ' }
      break
    case 'header4':
      formattingOptions = { markerLeft: '#### ' }
      break
    case 'header5':
      formattingOptions = { markerLeft: '##### ' }
      break
    case 'header6':
      formattingOptions = { markerLeft: '###### ' }
      break
    case 'admonitionNote':
      formattingOptions = {
        markerLeft: ':::note',
        markerRight: ':::',
        breakLine: true,
      }
      break
    case 'admonitionTip':
      formattingOptions = {
        markerLeft: ':::tip',
        markerRight: ':::',
        breakLine: true,
      }
      break
    case 'admonitionImportant':
      formattingOptions = {
        markerLeft: ':::important',
        markerRight: ':::',
        breakLine: true,
      }
      break
    case 'admonitionDanger':
      formattingOptions = {
        markerLeft: ':::danger',
        markerRight: ':::',
        breakLine: true,
      }
      break
    case 'admonitionWarning':
      formattingOptions = {
        markerLeft: ':::warning',
        markerRight: ':::',
        breakLine: true,
      }
      break
    case 'code':
      formattingOptions = { markerLeft: '`', markerRight: '`' }
      break
    case 'codefence':
      formattingOptions = {
        markerLeft: '```',
        markerRight: '```',
        breakLine: true,
      }
      break
    case 'link':
      formattingOptions = { markerLeft: '[', markerRight: '](url)' }
      break
    case 'quote':
      formattingOptions = { markerLeft: '> ', breakLine: true }
      break
    case 'bulletedList':
      formattingOptions = { markerLeft: '- ', breakLine: true }
      break
    case 'taskList':
      formattingOptions = { markerLeft: '- [ ] ', breakLine: true }
      break
    case 'numberedList':
      formattingOptions = { markerLeft: '1. ', breakLine: true }
      break
    case 'math':
      formattingOptions = { markerLeft: '$', markerRight: '$' }
      break
    case 'brackets':
      formattingOptions = { markerLeft: '[', markerRight: ']' }
      break
    default:
      break
  }

  if (formattingOptions == null) {
    return
  }

  replaceSelectionOrRange(
    codeMirror,
    useSelection,
    { word, cursorPosition, wordRange },
    formattingOptions
  )
}

const EditorToolbar = ({ codeMirror }: EditorToolbarProps) => {
  const { t } = useTranslation()

  const onFormatCallback = useCallback(
    (format: FormattingTool) => {
      if (codeMirror != null) {
        formatCodeMirrorText(codeMirror, format)
      }
    },
    [codeMirror]
  )

  return (
    <StyledEditorToolList>
      <EditorHeaderTool
        path={mdiFormatHeaderPound}
        tooltip={t(lngKeys.EditorToolbarTooltipHeader)}
        onFormatCallback={onFormatCallback}
      />
      <EditorToolButton
        path={mdiCodeNotEqualVariant}
        tooltip={t(lngKeys.EditorToolbarTooltipCodefence)}
        onClick={() => onFormatCallback('codefence')}
      />
      <EditorToolButton
        path={mdiFormatQuoteClose}
        tooltip={t(lngKeys.EditorToolbarTooltipQuote)}
        onClick={() => onFormatCallback('quote')}
      />
      <EditorAdmonitionTool
        path={mdiPageNextOutline}
        tooltip={t(lngKeys.EditorToolbarTooltipAdmonition)}
        onFormatCallback={onFormatCallback}
      />
      <EditorToolButton
        path={mdiFormatListBulleted}
        tooltip={t(lngKeys.EditorToolbarTooltipList)}
        onClick={() => onFormatCallback('bulletedList')}
      />
      <EditorToolButton
        path={mdiFormatListNumbered}
        tooltip={t(lngKeys.EditorToolbarTooltipNumberedList)}
        onClick={() => onFormatCallback('numberedList')}
      />
      <EditorToolButton
        path={mdiCheckboxMarkedOutline}
        tooltip={t(lngKeys.EditorToolbarTooltipTaskList)}
        style={{ marginRight: 20 }}
        onClick={() => onFormatCallback('taskList')}
      />
      <EditorToolButton
        path={mdiFormatBold}
        tooltip={t(lngKeys.EditorToolbarTooltipBold)}
        onClick={() => onFormatCallback('bold')}
      />
      <EditorToolButton
        path={mdiFormatItalic}
        tooltip={t(lngKeys.EditorToolbarTooltipItalic)}
        onClick={() => onFormatCallback('italic')}
      />
      <EditorToolButton
        path={mdiCodeTags}
        tooltip={t(lngKeys.EditorToolbarTooltipCode)}
        onClick={() => onFormatCallback('code')}
      />
      <EditorToolButton
        path={mdiLinkVariant}
        tooltip={t(lngKeys.EditorToolbarTooltipLink)}
        onClick={() => onFormatCallback('link')}
      />
      <EditorToolButton
        path={mdiMathIntegralBox}
        tooltip={t(lngKeys.EditorToolbarTooltipMath)}
        onClick={() => onFormatCallback('math')}
      />
      <EditorToolButton
        path={mdiCodeBrackets}
        tooltip={t(lngKeys.EditorToolbarTooltipBrackets)}
        onClick={() => onFormatCallback('brackets')}
      />
    </StyledEditorToolList>
  )
}

function getCursivePositionAndString(
  editor: CodeMirror.Editor,
  pos: Position,
  step: -1 | 1
): { pos: Position; val: string } {
  let onGoingSearch = true
  let maxPos: Position = pos
  let string = ''

  let nextPos = pos
  let prevPos = pos
  while (onGoingSearch) {
    if (step === 1) {
      prevPos = nextPos
      nextPos = { line: nextPos.line, ch: nextPos.ch + step }
    } else {
      nextPos = prevPos
      prevPos = { line: prevPos.line, ch: prevPos.ch + step }
    }
    const currentChar = editor.getRange(prevPos, nextPos, '\n')
    if (currentChar === '' || spaceRegex.test(currentChar)) {
      maxPos = step === 1 ? prevPos : nextPos
      onGoingSearch = false
      break
    }

    if (step === 1) {
      string += currentChar
    } else {
      string = currentChar + string
    }
  }

  return {
    pos: maxPos,
    val: string,
  }
}

function addOrRemoveFormat(
  word: string,
  markerLeft: string,
  markerRight: string,
  linebreaks: LineBreakTypes
) {
  if (word.startsWith(markerLeft) && word.endsWith(markerRight)) {
    const wordWithoutFormat = word.slice(
      markerLeft.length,
      word.length - markerRight.length
    )
    return {
      newVal: wordWithoutFormat,
      offset: -markerLeft.length,
    }
  }

  const replacement = feedlinebreaksToWord(
    linebreaks,
    word,
    markerLeft,
    markerRight
  )
  return {
    newVal: replacement,
    offset: markerLeft.length,
  }
}

function addOrRemoveStartingFormat(
  word: string,
  marker: string,
  linebreaks: LineBreakTypes
) {
  if (word.startsWith(marker)) {
    const wordWithoutFormat = word.slice(marker.length, word.length)
    return {
      newVal: wordWithoutFormat,
      offset: -marker.length,
      addBreakLines: false,
    }
  }

  const replacement = feedlinebreaksToWord(linebreaks, word, marker, undefined)

  return {
    newVal: replacement,
    offset: marker.length,
  }
}

type OriginalText = {
  word: string
  cursorPosition: Position
  wordRange?: { anchor: Position; head?: Position }
}

type FormattingBehaviour = {
  markerLeft: string
  markerRight?: string
  breakLine?: boolean
}

type LineBreakTypes = {
  beforeMark: number
  afterMark: number
  beforeWord: number
  afterWord: number
}

function feedlinebreaksToWord(
  linebreaks: LineBreakTypes,
  word: string,
  markerLeft: string,
  markerRight?: string
) {
  let replacement = ''
  for (let i = 0; i < linebreaks.beforeMark; i++) {
    replacement += `\n`
  }
  replacement += markerLeft

  for (let i = 0; i < linebreaks.beforeWord; i++) {
    replacement += `\n`
  }
  replacement += word

  for (let i = 0; i < linebreaks.afterWord; i++) {
    replacement += `\n`
  }

  if (markerRight == null) {
    return replacement
  }

  replacement += markerRight

  for (let i = 0; i < linebreaks.afterMark; i++) {
    replacement += `\n`
  }

  return replacement
}

function getLineBreaksFromFormat(
  editor: CodeMirror.Editor,
  anchor: Position,
  { markerRight, breakLine = false }: FormattingBehaviour
): LineBreakTypes {
  const linebreaks = {
    beforeMark: 0,
    afterMark: 0,
    beforeWord: 0,
    afterWord: 0,
  }

  if (!breakLine) {
    return linebreaks
  }

  if (anchor.ch !== 0) {
    linebreaks.beforeMark = 2
  } else {
    if (anchor.line !== 0) {
      const prevLine = editor.getLine(anchor.line - 1) || ''
      linebreaks.beforeMark = prevLine.trim() === '' ? 0 : 1
    }
  }

  const nextLine = editor.getLine(anchor.line + 1) || ''
  linebreaks.afterWord = nextLine.trim() === '' ? 0 : 1

  if (markerRight === '```' || markerRight === ':::') {
    linebreaks.beforeWord = 1
    linebreaks.afterMark = linebreaks.afterWord
    linebreaks.afterWord = 1
  }

  return linebreaks
}

function replaceSelectionOrRange(
  editor: CodeMirror.Editor,
  replaceSelection: boolean,
  { word, cursorPosition, wordRange }: OriginalText,
  { markerLeft, markerRight, breakLine = false }: FormattingBehaviour
) {
  editor.focus()
  if (replaceSelection) {
    const linebreaks = getLineBreaksFromFormat(
      editor,
      editor.getCursor('from'),
      {
        markerLeft,
        markerRight,
        breakLine,
      }
    )
    return handleSelectionReplace(
      editor,
      word,
      {
        markerLeft,
        markerRight,
        breakLine,
      },
      linebreaks
    )
  }

  if (wordRange == null) {
    return
  }

  const linebreaks = getLineBreaksFromFormat(editor, wordRange.anchor, {
    markerLeft,
    markerRight,
    breakLine,
  })

  const { newVal, offset } =
    markerRight != null
      ? addOrRemoveFormat(word, markerLeft, markerRight, linebreaks)
      : addOrRemoveStartingFormat(word, markerLeft, linebreaks)

  editor.replaceRange(newVal, wordRange.anchor, wordRange.head, word)
  const newLineCursor =
    breakLine && offset > 0
      ? linebreaks.beforeMark + linebreaks.beforeWord + cursorPosition.line
      : cursorPosition.line
  let newChCursor =
    breakLine && offset > 0 && linebreaks.beforeMark !== 0
      ? offset
      : cursorPosition.ch + offset

  if (linebreaks.beforeWord > 0) {
    newChCursor = 0
  }

  editor.setCursor({
    line: newLineCursor,
    ch: newChCursor,
  })
}

function handleSelectionReplace(
  editor: CodeMirror.Editor,
  selection: string,
  { markerLeft, markerRight }: FormattingBehaviour,
  linebreaks: LineBreakTypes
) {
  let newVal = selection
  const anchor = editor.getCursor('from')
  const head = editor.getCursor('to')
  if (head.ch === 0) {
    head.ch = (editor.getLine(head.line) || '').length
  }
  const markerRightOffset = markerRight != null ? markerRight?.length : 0
  const startPositionMinusMarkerLength = {
    line: anchor.line,
    ch: anchor.ch - markerLeft.length,
  }

  const endPositionPlusMarkerLength = {
    line: head.line,
    ch: head.ch + markerRightOffset,
  }

  let hasMarkerInside = false
  const hasMarkerOutside =
    markerRight != null
      ? editor.getRange(startPositionMinusMarkerLength, anchor) ===
          markerLeft &&
        editor.getRange(head, endPositionPlusMarkerLength) === markerRight
      : editor.getRange(startPositionMinusMarkerLength, anchor) === markerLeft

  if (hasMarkerOutside) {
    anchor.ch = anchor.ch - markerLeft.length
    head.ch = head.ch + markerRightOffset
  } else {
    const { newVal: replace, offset } =
      markerRight != null
        ? addOrRemoveFormat(selection, markerLeft, markerRight, linebreaks)
        : addOrRemoveStartingFormat(selection, markerLeft, linebreaks)
    newVal = replace
    hasMarkerInside = offset < 0
  }

  editor.replaceRange(newVal, anchor, head, selection)

  const selectionIsMultiline = anchor.line !== head.line
  const removingMarkers = hasMarkerOutside || hasMarkerInside

  const newSelectionAnchor = anchor
  const newSelectionHead = head

  if (selectionIsMultiline) {
    if (removingMarkers) {
      if (hasMarkerOutside) {
        anchor.ch = anchor.ch - markerLeft.length
      }
    } else {
      anchor.ch = anchor.ch + markerLeft.length
    }
  } else {
    if (removingMarkers) {
      if (hasMarkerOutside) {
        anchor.ch = anchor.ch - markerLeft.length
        head.ch = head.ch - markerLeft.length
      } else {
        head.ch = head.ch - markerLeft.length
      }
    } else {
      anchor.ch = anchor.ch + markerLeft.length
      head.ch = head.ch + markerLeft.length
    }
  }

  if (!removingMarkers) {
    anchor.line = anchor.line + linebreaks.beforeMark + linebreaks.beforeWord
    head.line = head.line + +linebreaks.beforeMark + linebreaks.beforeWord
  }

  if (linebreaks.beforeMark > 0 && !removingMarkers) {
    anchor.ch = markerLeft.length
    if (!selectionIsMultiline) {
      head.ch = selection.length + markerLeft.length
    }
  }

  if (linebreaks.beforeWord > 0) {
    anchor.ch = 0
    if (!selectionIsMultiline) {
      head.ch = selection.length
    }
  }

  editor.setSelection(newSelectionAnchor, newSelectionHead)
}

export default React.memo(EditorToolbar)
