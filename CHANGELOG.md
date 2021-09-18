# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For more info on features and upcoming changes, please visit our [Open Issues](https://github.com/BoostIO/BoostNote.next-local/issues) and community [Wiki](https://github.com/BoostIO/BoostNote.next-local/wiki) and [Discussions](https://github.com/BoostIO/BoostNote.next-local/discussions).

## [Unreleased]

## [0.23.0] - 2021-10-20

### TBA

## [Released]

## [0.22.3] - 2021-09-18

### Added

- Changelog to repository
- Proper instructions to `readme.md`
- Project Wiki documentation (docs/\*.md)
- Updates icon on dialog
- Codemirror themes `ayu-dark` and `ayu-mirage`

### Fixed

- Menu items for zoom (zoom in/out/reset)
- Tag autocomplete not showing the first item
- Missing Space/Storage info page in Preferences
- Space creation page sidebar showing when no spaces
- Sidebar showing when no spaces on 404 pages
- Navigating to invalid spaces (push message instead of 404 page)
- Updater message title and descriptions
- PDF export themes not being consistent with HTML (also add missing CodeMirror default theme)
- Archive and restore of the note in Drag and Drop view
- Trashing note from same folder and then trashing sub-folder note would render incomplete view before refresh
- Reload/Archive bug

### Changed

- Tag auto-close behavior (no auto-close on adding new tag)

### Removed

- Cloud specific menu items

## [0.21.1] - 2021-08-06

### Removed

- Cloud feature intro
- Cloud premium feature buttons

## [0.21.0] - 2021-08-06

### Removed

- Cloud space support

### Fixed

- Drag and drop ordering of side navigator
- Improve app stability (storage loading, error logging, and folder rename regex bug)
- Update issue of macOS (the app didn't restart properly after updating)
