import React, {
  useCallback,
  useState,
  useMemo,
  KeyboardEventHandler,
  ChangeEventHandler,
} from 'react'
import { SectionControl } from './styled'
import { useTranslation } from 'react-i18next'
import { usePreferences, EditorIndentSizeOptions } from '../../lib/preferences'
import { themes } from '../../lib/CodeMirror'
import CustomizedCodeEditor from '../atoms/CustomizedCodeEditor'
import { useDebounce } from 'react-use'
import Form from '../../shared/components/molecules/Form'
import FormSelect, {
  FormSelectOption,
  SimpleFormSelect,
} from '../../shared/components/molecules/Form/atoms/FormSelect'
import { lngKeys } from '../../lib/i18n/types'

const defaultPreviewContent = `# hello-world.js

\`\`\`js
function say() {
  console.log('Hello, World!')
}
\`\`\`
`

const EditorTab = () => {
  const { preferences, setPreferences } = usePreferences()

  const selectEditorTheme = useCallback(
    (value) => {
      setPreferences({
        'editor.theme': value,
      })
    },
    [setPreferences]
  )

  const [fontSize, setFontSize] = useState(
    preferences['editor.fontSize'].toString()
  )
  const updateFontSize: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setFontSize(event.target.value)
    },
    [setFontSize]
  )
  useDebounce(
    () => {
      const parsedFontSize = parseInt(fontSize, 10)
      if (!Number.isNaN(parsedFontSize)) {
        setPreferences({
          'editor.fontSize': parsedFontSize,
        })
      }
    },
    500,
    [fontSize, setPreferences]
  )

  const [fontFamily, setFontFamily] = useState(preferences['editor.fontFamily'])
  const updateFontFamily: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setFontFamily(event.target.value)
    },
    [setFontFamily]
  )
  useDebounce(
    () => {
      setPreferences({
        'editor.fontFamily': fontFamily,
      })
    },
    500,
    [fontFamily, setPreferences]
  )

  const selectEditorIndentType = useCallback(
    (value) => {
      setPreferences({
        'editor.indentType': value,
      })
    },
    [setPreferences]
  )

  const selectEditorIndentSize = useCallback(
    (value) => {
      setPreferences({
        'editor.indentSize': parseInt(value, 10) as EditorIndentSizeOptions,
      })
    },
    [setPreferences]
  )

  const selectEditorKeyMap = useCallback(
    (value) => {
      setPreferences({
        'editor.keyMap': value,
      })
    },
    [setPreferences]
  )

  const selectShowEditorToolbar = useCallback(
    (formOption: FormSelectOption) => {
      setPreferences({
        'editor.showEditorToolbar': formOption.value === 'Show',
      })
    },
    [setPreferences]
  )

  const codeEditorKeydownInterceptor = useMemo<KeyboardEventHandler>(() => {
    return (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
      }
    }
  }, [])

  const [previewContent, setPreviewContent] = useState(defaultPreviewContent)

  const { t } = useTranslation()
  return (
    <div>
      <Form
        rows={[
          {
            title: t('preferences.editorTheme'),
            items: [
              {
                type: 'node',
                element: (
                  <SimpleFormSelect
                    value={preferences['editor.theme']}
                    onChange={selectEditorTheme}
                    options={themes}
                  />
                ),
              },
            ],
          },
          {
            title: t('preferences.editorFontSize'),
            items: [
              {
                type: 'input',
                props: {
                  type: 'number',
                  value: fontSize,
                  onChange: updateFontSize,
                },
              },
            ],
          },
          {
            title: t('preferences.editorFontFamily'),
            items: [
              {
                type: 'input',
                props: {
                  type: 'text',
                  value: fontFamily,
                  onChange: updateFontFamily,
                },
              },
            ],
          },
          {
            title: t('preferences.editorIndentType'),
            items: [
              {
                type: 'node',
                element: (
                  <SimpleFormSelect
                    value={preferences['editor.indentType']}
                    onChange={selectEditorIndentType}
                    options={['spaces', 'tabs']}
                  />
                ),
              },
            ],
          },
          {
            title: t('preferences.editorIndentSize'),
            items: [
              {
                type: 'node',
                element: (
                  <SimpleFormSelect
                    value={preferences['editor.indentSize'] + ''}
                    onChange={selectEditorIndentSize}
                    options={['2', '4', '8']}
                  />
                ),
              },
            ],
          },
          {
            title: t(lngKeys.SettingsShowEditorToolbar),
            items: [
              {
                type: 'node',
                element: (
                  <FormSelect
                    options={[
                      {
                        label: t(lngKeys.GeneralShowVerb),
                        value: 'Show',
                      },
                      { label: t(lngKeys.GeneralHideVerb), value: 'Hide' },
                    ]}
                    value={{
                      label: preferences['editor.showEditorToolbar']
                        ? t(lngKeys.GeneralShowVerb)
                        : t(lngKeys.GeneralHideVerb),
                      value: preferences['editor.showEditorToolbar']
                        ? 'Show'
                        : 'Hide',
                    }}
                    onChange={selectShowEditorToolbar}
                  />
                ),
              },
            ],
          },
          {
            title: t('preferences.editorKeymap'),
            items: [
              {
                type: 'node',
                element: (
                  <SimpleFormSelect
                    value={preferences['editor.keyMap'] + ''}
                    onChange={selectEditorKeyMap}
                    options={['default', 'vim', 'emacs']}
                  />
                ),
              },
            ],
          },
          {
            title: t('preferences.editorPreview'),
            items: [
              {
                type: 'node',
                element: (
                  <SectionControl onKeyDown={codeEditorKeydownInterceptor}>
                    <CustomizedCodeEditor
                      value={previewContent}
                      onChange={(newValue) => setPreviewContent(newValue)}
                    />
                  </SectionControl>
                ),
              },
            ],
          },
        ]}
      />
    </div>
  )
}

export default EditorTab
