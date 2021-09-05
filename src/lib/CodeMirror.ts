import CodeMirror from 'codemirror'
import 'codemirror/addon/runmode/runmode'
import 'codemirror/addon/mode/overlay'
import 'codemirror/addon/comment/comment'
import 'codemirror/addon/edit/continuelist'
import 'codemirror/addon/dialog/dialog'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/scroll/scrollpastend'
import 'codemirror/addon/search/searchcursor'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/mode/gfm/gfm'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/css/css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/keymap/sublime'
import 'codemirror/keymap/emacs'
import 'codemirror/keymap/vim'
import 'codemirror-abap'
import { loadMode } from '../shared/lib/codemirror/util'

export function getCodeMirrorTheme(theme?: string) {
  if (theme == null) return 'default'
  if (theme === 'solarized-dark') return 'solarized dark'
  return theme
}

loadMode(CodeMirror)

export default CodeMirror

export const themes = [
  '3024-day',
  'base16-light',
  'dracula',
  'gruvbox-dark',
  'liquibyte',
  'mbo',
  'neo',
  'paraiso-light',
  'solarized',
  'solarized-dark',
  'twilight',
  'zenburn',
  '3024-night',
  'bespin',
  'duotone-dark',
  'hopscotch',
  'lucario',
  'mdn-like',
  'night',
  'pastel-on-dark',
  'ssms',
  'vibrant-ink',
  'abcdef',
  'blackboard',
  'duotone-light',
  'icecoder',
  'material',
  'midnight',
  'nord',
  'railscasts',
  'the-matrix',
  'xq-dark',
  'ambiance',
  'cobalt',
  'eclipse',
  'idea',
  'material-darker',
  'monokai',
  'oceanic-next',
  'rubyblue',
  'tomorrow-night-bright',
  'xq-light',
  'ambiance-mobile',
  'colorforth',
  'elegant',
  'isotope',
  'material-ocean',
  'moxer',
  'panda-syntax',
  'seti',
  'tomorrow-night-eighties',
  'yeti',
  'base16-dark',
  'darcula',
  'erlang-dark',
  'lesser-dark',
  'material-palenight',
  'neat',
  'paraiso-dark',
  'shadowfox',
  'ttcn',
  'yonce',
  'ayu-mirage',
  'ayu-dark',
].sort()

export interface EditorPosition {
  line: number
  ch: number
}
