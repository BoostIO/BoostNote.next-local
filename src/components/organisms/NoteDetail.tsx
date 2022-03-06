import React from 'react'
import {
  NoteDoc,
  NoteDocEditibleProps,
  Attachment,
  NoteStorage,
} from '../../lib/db/types'
import CustomizedCodeEditor from '../atoms/CustomizedCodeEditor'
import CustomizedMarkdownPreviewer from '../atoms/CustomizedMarkdownPreviewer'
import { ViewModeType } from '../../lib/generalStatus'
import {
  convertItemListToArray,
  inspectDataTransfer,
  convertFileListToArray,
} from '../../lib/dom'
import CodeMirror, { EditorPosition } from '../../lib/CodeMirror'
import EditorSelectionStatus from '../molecules/EditorSelectionStatus'
import EditorIndentationStatus from '../molecules/EditorIndentationStatus'
import EditorThemeSelect from '../molecules/EditorThemeSelect'
import EditorKeyMapSelect from '../molecules/EditorKeyMapSelect'
import { addIpcListener, removeIpcListener } from '../../lib/electronOnly'
import { MarkerRange } from 'codemirror'
import LocalSearch, { scrollEditorToLine } from './LocalSearch'
import { SearchReplaceOptions } from '../../lib/search/search'
import {
  borderTop,
  backgroundColor,
  borderRight,
} from '../../shared/lib/styled/styleFunctions'
import styled from '../../shared/lib/styled'
import EditorToolbar, { formatCodeMirrorText } from './editor/EditorToolbar'

type NoteDetailProps = {
  note: NoteDoc
  storage: NoteStorage
  updateNote: (
    storageId: string,
    noteId: string,
    props: Partial<NoteDocEditibleProps>
  ) => Promise<void | NoteDoc>
  viewMode: ViewModeType
  initialCursorPosition: EditorPosition | null
  addAttachments(storageId: string, files: File[]): Promise<Attachment[]>
  showEditorToolbar: boolean
}

type NoteDetailState = {
  prevStorageId: string
  prevNoteId: string
  content: string
  currentCursor: EditorPosition
  searchOptions: SearchReplaceOptions
  showSearch: boolean
  showReplace: boolean
  searchQuery: string
  replaceQuery: string
  currentSelections: {
    head: EditorPosition
    anchor: EditorPosition
  }[]
}

class NoteDetail extends React.Component<NoteDetailProps, NoteDetailState> {
  state: NoteDetailState = {
    prevStorageId: '',
    prevNoteId: '',
    content: '',
    currentCursor: {
      line: 0,
      ch: 0,
    },
    searchOptions: {
      regexSearch: false,
      caseSensitiveSearch: false,
      preservingCaseReplace: false,
    },
    showSearch: false,
    showReplace: false,
    searchQuery: '',
    replaceQuery: '',
    currentSelections: [
      {
        head: {
          line: 0,
          ch: 0,
        },
        anchor: {
          line: 0,
          ch: 0,
        },
      },
    ],
  }
  codeMirror?: CodeMirror.EditorFromTextArea

  codeMirrorRef = (codeMirror: CodeMirror.EditorFromTextArea) => {
    const oldCodeMirror = this.codeMirror
    this.codeMirror = codeMirror
    if (oldCodeMirror != null && this.state.showSearch) {
      const oldMarkers = oldCodeMirror.getAllMarks()
      oldMarkers.forEach((marker) => {
        const markPos: MarkerRange = marker.find() as MarkerRange
        if (!markPos) {
          return
        }
        codeMirror.markText(markPos.from, markPos.to, {
          className: marker['className'],
          attributes: marker['attributes'],
        })
        marker.clear()
      })
      if (oldMarkers.length > 0) {
        this.toggleSearch(true, this.codeMirror)
      }
    }

    this.setInitialCursor()
  }

  static getDerivedStateFromProps(
    props: NoteDetailProps,
    state: NoteDetailState
  ): NoteDetailState {
    const { note, storage } = props
    if (storage.id !== state.prevStorageId || note._id != state.prevNoteId) {
      return {
        prevStorageId: storage.id,
        prevNoteId: note._id,
        content: note.content,
        currentCursor: {
          line:
            props.initialCursorPosition != null
              ? props.initialCursorPosition.line
              : 0,
          ch:
            props.initialCursorPosition != null
              ? props.initialCursorPosition.ch
              : 0,
        },
        searchOptions: {
          regexSearch: false,
          caseSensitiveSearch: false,
          preservingCaseReplace: false,
        },
        showSearch: false,
        showReplace: false,
        searchQuery: '',
        replaceQuery: '',
        currentSelections: [
          {
            head: {
              line: 0,
              ch: 0,
            },
            anchor: {
              line: 0,
              ch: 0,
            },
          },
        ],
      }
    }
    return state
  }

  setInitialCursor() {
    if (this.codeMirror == null) {
      return
    }
    this.focusOnEditor()
    this.codeMirror.setCursor(
      this.props.initialCursorPosition != null
        ? this.props.initialCursorPosition
        : this.state.currentCursor
    )
    scrollEditorToLine(
      this.codeMirror,
      this.props.initialCursorPosition != null
        ? this.props.initialCursorPosition.line
        : this.state.currentCursor.line
    )
  }

  componentDidUpdate(_prevProps: NoteDetailProps, prevState: NoteDetailState) {
    if (this.props.initialCursorPosition != null) {
      this.setInitialCursor()
    }
    const { note } = this.props
    if (prevState.prevNoteId !== note._id) {
      if (this.queued) {
        const { content } = prevState
        this.saveNote(prevState.prevStorageId, prevState.prevNoteId, {
          content,
        })
      }
    }
  }

  focusOnEditor = () => {
    if (this.codeMirror == null) {
      return
    }
    this.codeMirror.focus()
  }

  componentDidMount() {
    addIpcListener('focus-editor', this.focusOnEditor)
    addIpcListener('apply-bold-style', this.applyBoldStyle)
    addIpcListener('apply-italic-style', this.applyItalicStyle)
  }

  componentWillUnmount() {
    if (this.queued) {
      const { content, prevStorageId, prevNoteId } = this.state
      this.saveNote(prevStorageId, prevNoteId, {
        content,
      })
    }
    removeIpcListener('focus-editor', this.focusOnEditor)
    removeIpcListener('apply-bold-style', this.applyBoldStyle)
    removeIpcListener('apply-italic-style', this.applyItalicStyle)
  }

  updateContent = (
    newValueOrUpdater: string | ((prevValue: string) => string),
    checkboxUpdate = false
  ) => {
    const updater =
      typeof newValueOrUpdater === 'string'
        ? () => newValueOrUpdater
        : newValueOrUpdater
    this.setState(
      (prevState) => {
        return {
          content: updater(prevState.content),
        }
      },
      () => {
        if (this.codeMirror != null && checkboxUpdate) {
          this.codeMirror.focus()
          this.setInitialCursor()
        }
        this.queueToSave()
      }
    )
  }

  queued = false
  timer?: any

  queueToSave = () => {
    this.queued = true
    if (this.timer != null) {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(() => {
      const { note, storage } = this.props
      const { content } = this.state

      this.saveNote(storage.id, note._id, {
        content,
      })
    }, 3000)
  }

  async saveNote(
    storageId: string,
    noteId: string,
    { content }: { content: string }
  ) {
    clearTimeout(this.timer)
    this.queued = false

    const { updateNote } = this.props
    await updateNote(storageId, noteId, {
      content,
    })
  }

  handleDrop = async (codeMirror: CodeMirror.Editor, event: DragEvent) => {
    event.preventDefault()

    if (event.dataTransfer == null) {
      return
    }

    inspectDataTransfer(event.dataTransfer)

    const { storage, addAttachments } = this.props
    const files = convertFileListToArray(
      event.dataTransfer.files
    ).filter((file) => file.type.startsWith('image/'))

    if (files.length === 0) {
      return
    }

    const attachments = await addAttachments(storage.id, files)

    const coords = codeMirror.coordsChar({
      left: event.x,
      top: event.y,
    })
    codeMirror.getDoc().replaceRange(
      attachments
        .map((attachment) => {
          return `![](${attachment.name})`
        })
        .join(' '),
      coords
    )
  }

  handlePaste = async (
    codeMirror: CodeMirror.Editor,
    event: ClipboardEvent
  ) => {
    const { clipboardData } = event
    if (clipboardData == null) {
      return
    }

    inspectDataTransfer(clipboardData)

    const items = convertItemListToArray(clipboardData.items)
    const imageItems = items.filter((item) => {
      return item.kind === 'file' && item.type.startsWith('image/')
    })
    if (imageItems.length === 0) {
      return
    }

    event.preventDefault()
    const { storage, addAttachments } = this.props

    const imageFiles = imageItems.reduce<File[]>((files, item) => {
      const file = item.getAsFile()
      if (file != null) {
        files.push(file)
      }
      return files
    }, [])

    const attachments = await addAttachments(storage.id, imageFiles)

    codeMirror.getDoc().replaceSelection(
      attachments
        .map((attachment) => {
          return `![](${attachment.name})`
        })
        .join(' ')
    )
  }

  handleCursorActivity = (codeMirror: CodeMirror.Editor) => {
    const doc = codeMirror.getDoc()
    const { line, ch } = doc.getCursor()
    const selections = doc.listSelections()

    this.setState({
      currentCursor: {
        line,
        ch,
      },
      currentSelections: selections,
    })
  }

  updateSearchReplaceOptions = (options: Partial<SearchReplaceOptions>) => {
    this.setState((prevState) => {
      return {
        searchOptions: {
          ...prevState.searchOptions,
          ...options,
        },
      }
    })
  }

  toggleSearchReplace = (showReplace?: boolean, editor?: CodeMirror.Editor) => {
    if (showReplace) {
      this.toggleSearch(true, editor)
    }
    this.setState((prevState) => {
      return {
        showReplace: showReplace != null ? showReplace : !prevState.showReplace,
      }
    })
  }

  toggleSearch = (
    showSearch: boolean,
    editor?: CodeMirror.Editor,
    searchOnly = false
  ) => {
    if (showSearch && this.state.showSearch) {
      // Focus search again
      this.setState(() => {
        return {
          showSearch: false,
        }
      })
    }

    if (showSearch && editor != null && editor.getSelection() !== '') {
      // fetch selected range to input into search box
      this.setState(() => {
        return {
          searchQuery: editor.getSelection(),
        }
      })
    }
    if (editor != null && !showSearch) {
      // Clear marks if any
      editor.getAllMarks().forEach((mark) => mark.clear())
    }
    this.setState(
      (prevState) => {
        return {
          showSearch: showSearch != null ? showSearch : !prevState.showSearch,
        }
      },
      () => {
        if (!this.state.showSearch || searchOnly) {
          this.toggleSearchReplace(false)
        }
      }
    )
  }

  handleOnReplaceQueryChange = (newReplaceQuery: string) => {
    if (this.state.replaceQuery !== newReplaceQuery) {
      this.setState(() => {
        return {
          replaceQuery: newReplaceQuery,
        }
      })
    }
  }

  handleOnSearchQueryChange = (newSearchQuery: string) => {
    if (this.state.searchQuery !== newSearchQuery) {
      this.setState(() => {
        return {
          searchQuery: newSearchQuery,
        }
      })
    }
  }
  applyBoldStyle = () => {
    const codeMirror = this.codeMirror
    if (codeMirror == null) {
      return
    }
    if (!codeMirror.hasFocus()) {
      return
    }
    formatCodeMirrorText(codeMirror, 'bold')
  }

  applyItalicStyle = () => {
    const codeMirror = this.codeMirror
    if (codeMirror == null) {
      return
    }
    if (!codeMirror.hasFocus()) {
      return
    }
    formatCodeMirrorText(codeMirror, 'italic')
  }

  render() {
    const { note, storage, viewMode, showEditorToolbar } = this.props
    const { currentCursor, currentSelections } = this.state

    const codeEditor = (
      <CustomizedCodeEditor
        className='editor'
        key={note._id}
        codeMirrorRef={this.codeMirrorRef}
        value={this.state.content}
        onChange={(updater) => this.updateContent(updater, false)}
        onPaste={this.handlePaste}
        onDrop={this.handleDrop}
        onCursorActivity={this.handleCursorActivity}
        onLocalSearchToggle={(editor, showLocalSearch) =>
          this.toggleSearch(showLocalSearch, editor, true)
        }
        onLocalSearchReplaceToggle={(editor, showLocalReplace) =>
          this.toggleSearchReplace(showLocalReplace, editor)
        }
      />
    )

    const markdownPreviewer = (
      <CustomizedMarkdownPreviewer
        content={this.state.content}
        attachmentMap={storage.attachmentMap}
        updateContent={this.updateContent}
      />
    )

    return (
      <Container>
        {viewMode !== 'preview' &&
          this.state.showSearch &&
          this.codeMirror != null && (
            <SearchBarContainer
              className={viewMode === 'split' ? 'halfWidth' : ''}
            >
              <LocalSearch
                key={this.state.showReplace + ''}
                searchQuery={this.state.searchQuery}
                replaceQuery={this.state.replaceQuery}
                searchOptions={this.state.searchOptions}
                codeMirror={this.codeMirror}
                showingReplace={this.state.showReplace}
                onSearchToggle={this.toggleSearch}
                onCursorActivity={this.handleCursorActivity}
                onSearchQueryChange={this.handleOnSearchQueryChange}
                onReplaceToggle={this.toggleSearchReplace}
                onReplaceQueryChange={this.handleOnReplaceQueryChange}
                onUpdateSearchOptions={this.updateSearchReplaceOptions}
              />
            </SearchBarContainer>
          )}
        <ContentSection>
          {viewMode === 'preview' ? (
            markdownPreviewer
          ) : viewMode === 'split' ? (
            <>
              {showEditorToolbar && (
                <ToolbarRow>
                  <EditorToolbar codeMirror={this.codeMirror} />
                </ToolbarRow>
              )}
              <div className='splitLeft'>{codeEditor}</div>
              <div className='splitRight'>{markdownPreviewer}</div>
            </>
          ) : (
            <>
              {showEditorToolbar && (
                <ToolbarRow>
                  <EditorToolbar codeMirror={this.codeMirror} />
                </ToolbarRow>
              )}
              {codeEditor}
            </>
          )}
        </ContentSection>
        <div className='bottomBar'>
          <EditorSelectionStatus
            cursor={currentCursor}
            selections={currentSelections}
          />
          <EditorKeyMapSelect />
          <EditorThemeSelect />
          <EditorIndentationStatus />
        </div>
      </Container>
    )
  }
}

export default NoteDetail

const Container = styled.div`
  ${backgroundColor};
  display: flex;
  flex-direction: column;
  height: 100%;
  & > .bottomBar {
    ${backgroundColor};
    display: flex;
    ${borderTop};
    height: 24px;
    & > :first-child {
      flex: 1;
    }
    z-index: 5001;
  }

  overflow: hidden;
`

const SearchBarContainer = styled.div`
  width: 100%;
  &.halfWidth {
    width: 50%;
  }
`

const ContentSection = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;

  .editor .CodeMirror {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
  }

  .MarkdownPreviewer {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 10px 10px;
    box-sizing: border-box;
  }
  .splitLeft {
    position: absolute;
    width: 50%;
    height: 100%;
    ${borderRight}
  }
  .splitRight {
    position: absolute;
    left: 50%;
    width: 50%;
    height: 100%;
  }
`

const ToolbarRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
  position: absolute;
  bottom: ${({ theme }) => theme.sizes.spaces.l}px;
  right: 0;
  left: 0;
  margin: auto;
  z-index: 1;
  width: fit-content;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border: solid 1px ${({ theme }) => theme.colors.border.second};
  border-radius: 5px;
`
