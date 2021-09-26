import { NoteDocEditibleProps, NoteDocImportableProps } from '../db/types'

const noteContent = [
  '# Welcome to Boost Note Local',
  '',
  '## Here are few helpful links to get you started',
  '',
  '- [About](https://github.com/BoostIO/BoostNote.next-local/wiki/About)',
  '',
  '- [Keymap](https://github.com/BoostIO/BoostNote.next-local/wiki/Keyboard-Shortcuts)',
  '',
  '- [Discussions](https://github.com/BoostIO/BoostNote.next-local/discussions)',
  '',
  '- [Q&A](https://github.com/BoostIO/BoostNote.next-local/discussions/categories/q-a)',
  '',
]

export const welcomeNote: Partial<
  NoteDocEditibleProps | NoteDocImportableProps
> = {
  title: 'Welcome',
  content: noteContent.join('\n'),
  folderPathname: '/',
}
