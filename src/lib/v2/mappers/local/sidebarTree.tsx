import {
  getMapValues,
  sortByAttributeAsc,
  sortByAttributeDesc,
} from '../../../../shared/lib/utils/array'
import {
  mdiArchiveOutline,
  mdiExport,
  mdiFileDocumentOutline,
  mdiTextBoxPlus,
  mdiFolderPlusOutline,
  mdiLinkVariant,
  mdiPaperclip,
  mdiPencil,
  mdiStar,
  mdiStarOutline,
  mdiTag,
  mdiTrashCanOutline,
} from '@mdi/js'
import { MenuItem, MenuTypes } from '../../../../shared/lib/stores/contextMenu'
import { SidebarDragState } from '../../../../shared/lib/dnd'
import React from 'react'
import {
  FolderDoc,
  NoteDoc,
  NoteDocEditibleProps,
  NoteStorage,
  ObjectMap,
  TagDoc,
} from '../../../db/types'
import { FoldingProps } from '../../../../shared/components/atoms/FoldingWrapper'
import {
  getArchiveHref,
  getAttachmentsHref,
  getDocHref,
  getFolderHref,
  getFolderName,
  getFolderPathname,
  getLabelHref,
  getNoteTitle,
  getParentFolderPathname,
  getTagName,
  getWorkspaceHref,
  isDirectSubPathname,
  values,
} from '../../../db/utils'
import {
  SidebarTreeLabelSortingOrder,
  SidebarTreeLabelSortingOrders,
  SidebarTreeSortingOrder,
} from '../../../../shared/lib/sidebar'
import {
  CreateFolderRequestBody,
  CreateNoteRequestBody,
} from '../../hooks/useLocalDB'
import { NavResource } from '../../interfaces/resources'
import { CollapsableType } from '../../stores/sidebarCollapse'
import { LocalExportResourceRequestBody } from '../../hooks/useLocalUI'
import {
  SidebarNavCategory,
  SidebarNavControls,
  SidebarTreeChildRow,
} from '../../../../shared/components/organisms/Sidebar/molecules/SidebarTree'
import { FOLDER_ID_PREFIX } from '../../../db/consts'
import copy from 'copy-to-clipboard'
import { mapControlsToPopup } from '../../../../shared/components/organisms/Sidebar/atoms/SidebarHeader'

type LocalTreeItem = {
  id: string
  parentId?: string
  label: string
  defaultIcon?: string
  emoji?: string
  bookmarked?: boolean
  trashed?: boolean
  children: string[]
  folding?: FoldingProps
  folded?: boolean
  href?: string
  active?: boolean
  lastUpdated?: string // could be calculated for workspace as any last updated
  navigateTo?: () => void
  controls?: SidebarNavControls[]
  contextControls?: MenuItem[]
  dropIn?: boolean
  dropAround?: boolean
  onDragStart?: () => void
  onDrop?: (position?: SidebarDragState) => void
}

function compareStringStart(a: string, b: string, prefix: string) {
  return ~~b.startsWith(prefix) - ~~a.startsWith(prefix)
}

function sortLabels(
  sortingOrder: SidebarTreeLabelSortingOrder,
  a: TagDoc,
  b: TagDoc,
  numberOfTagsA: number,
  numberOfTagsB: number
) {
  switch (sortingOrder) {
    case 'created-date-asc':
      return a.createdAt.localeCompare(b.createdAt)
    case 'created-date-dsc':
      return -a.createdAt.localeCompare(b.createdAt)
    case 'a-z':
      if (a._id.trim() === '' && b._id.trim() !== '') {
        return 1
      }
      if (b._id.trim() === '' && a._id.trim() !== '') {
        return -1
      }
      return a._id.localeCompare(b._id)
    case 'z-a':
      if (a._id.trim() === '' && b._id.trim() !== '') {
        return 1
      }
      if (b._id.trim() === '' && a._id.trim() !== '') {
        return -1
      }
      return -a._id.localeCompare(b._id)
    case 'updated-date-asc':
      return a.updatedAt.localeCompare(b.updatedAt)
    case 'count-dsc':
      return numberOfTagsB - numberOfTagsA
    case 'count-asc':
      return numberOfTagsA - numberOfTagsB
    case 'updated-date-dsc':
    default:
      return -a.updatedAt.localeCompare(b.updatedAt)
  }
}

function sortTreeItems<
  T extends LocalTreeItem | (SidebarTreeChildRow & { lastUpdated?: string })
>(items: Array<T>, sortingOrder: SidebarTreeSortingOrder) {
  switch (sortingOrder) {
    case 'a-z':
      return sortByAttributeAsc('label', items).sort((a, b) =>
        compareStringStart(a.id, b.id, FOLDER_ID_PREFIX)
      )
    case 'z-a':
      return sortByAttributeDesc('label', items).sort((a, b) =>
        compareStringStart(a.id, b.id, FOLDER_ID_PREFIX)
      )
    case 'last-updated':
      return sortByAttributeDesc('lastUpdated', items).sort((a, b) =>
        compareStringStart(a.id, b.id, FOLDER_ID_PREFIX)
      )
    case 'drag':
    default:
      // already sorted by ordered IDs if drag and drop was selected
      return items
  }
}

function getWorkspaceChildrenOrdered(
  sortingOrder: SidebarTreeSortingOrder,
  workspaceRows: LocalTreeItem[]
): LocalTreeItem[] {
  return sortTreeItems(workspaceRows, sortingOrder)
}

function getFolderChildrenOrderedIds(
  parentFolder: FolderDoc,
  notes: NoteDoc[],
  folders: FolderDoc[]
): string[] {
  const children: string[] = []
  const parentFolderPathname = getFolderPathname(parentFolder._id)
  notes.forEach((note) => {
    if (note.folderPathname == parentFolderPathname) {
      children.push(note._id)
    }
  })

  folders.forEach((folder) => {
    const folderPathname = getFolderPathname(folder._id)
    if (isDirectSubPathname(parentFolderPathname, folderPathname)) {
      children.push(folder.orderId)
    }
  })

  return children
}

export function mapTreeControls(
  workspace: NoteStorage,
  exportDocuments: (
    workspace: NoteStorage,
    exportSettings: LocalExportResourceRequestBody
  ) => void
) {
  if (workspace == null) {
    return []
  }
  return [
    {
      type: MenuTypes.Normal,
      label: 'Export Folder',
      icon: mdiExport,
      onClick: () =>
        exportDocuments(workspace, {
          folderName: workspace.name,
          folderPathname: '/',
          exportingStorage: true,
        }),
    },
  ] as MenuItem[]
}

export function mapTree(
  initialLoadDone: boolean,
  sortingOrder: SidebarTreeSortingOrder,
  labelSortingOrder: SidebarTreeLabelSortingOrder,
  labelSetSortingOrder: (newSortValue: SidebarTreeLabelSortingOrder) => void,
  workspace: NoteStorage,
  docMap: ObjectMap<NoteDoc>,
  folderMap: ObjectMap<FolderDoc>,
  labelMap: ObjectMap<TagDoc>,
  currentRouterPath: string,
  sideBarOpenedLinksIdsSet: Set<string>,
  sideBarOpenedFolderIdsSet: Set<string>,
  toggleItem: (type: CollapsableType, id: string) => void,
  getFoldEvents: (
    type: CollapsableType,
    key: string,
    reversed?: boolean
  ) => FoldingProps,
  push: (url: string) => void,
  toggleNoteBookmark: (
    workspaceId: string,
    docId: string,
    bookmarked: boolean
  ) => void,
  toggleNoteArchived: (
    workspaceId: string,
    docId: string,
    archived: boolean
  ) => void,
  deleteFolder: (target: {
    workspaceId: string
    pathname: string
  }) => Promise<void>,
  createFolder: (body: CreateFolderRequestBody) => Promise<void>,
  createNote: (body: CreateNoteRequestBody) => Promise<void>,
  draggedResource: React.MutableRefObject<NavResource | undefined>,
  dropInDocOrFolder: (
    workspace: NoteStorage,
    targetedResource: NavResource,
    targetedPosition: SidebarDragState
  ) => void,
  openRenameFolderForm: (workspaceId: string, folder: FolderDoc) => void,
  openRenameNoteForm: (workspaceId: string, doc: NoteDoc) => void,
  exportDocuments: (
    workspace: NoteStorage,
    exportSettings: LocalExportResourceRequestBody
  ) => void,
  copyNoteLink: (
    storageId: string,
    noteId: string,
    noteProps: Partial<NoteDocEditibleProps>
  ) => Promise<string | undefined>,
  pushMessage: (context: any) => any
): SidebarNavCategory[] | undefined {
  if (!initialLoadDone || workspace == null) {
    return undefined
  }

  const currentPathWithWorkspace = `${getWorkspaceHref(
    workspace
  )}/${currentRouterPath}`
  const items = new Map<string, LocalTreeItem>()
  const [notes, folders] = [values(docMap), values(folderMap)]
  folders.forEach((folder) => {
    const folderOrderId = folder.orderId
    const folderId = folder._id
    const folderPathname = getFolderPathname(folderId)
    if (folderPathname == '/') {
      return
    }
    const folderName = getFolderName(folder, workspace.name)
    const parentFolderPathname = getParentFolderPathname(folderPathname)
    const href = getFolderHref(folder, workspace.id)
    const parentFolderDoc = folderMap[parentFolderPathname]
    const parentFolderId =
      parentFolderDoc != null && parentFolderPathname != '/'
        ? parentFolderDoc.orderId
        : workspace.id
    items.set(folderOrderId, {
      id: folderOrderId,
      lastUpdated: folder.updatedAt,
      label: folderName,
      folded: !sideBarOpenedFolderIdsSet.has(folderOrderId),
      folding: getFoldEvents('folders', folderOrderId),
      href,
      active: href === currentPathWithWorkspace,
      navigateTo: () => push(href),
      onDrop: (position: SidebarDragState) =>
        dropInDocOrFolder(
          workspace,
          { type: 'folder', result: folder },
          position
        ),
      onDragStart: () => {
        draggedResource.current = { type: 'folder', result: folder }
      },
      dropIn: true,
      dropAround: sortingOrder === 'drag',
      controls: [
        {
          icon: mdiTextBoxPlus,
          onClick: undefined,
          placeholder: 'Note title..',
          create: (title: string) =>
            createNote({
              workspaceId: workspace.id,
              docProps: {
                title: title,
                folderPathname: folderPathname,
              },
            }),
        },
        {
          icon: mdiFolderPlusOutline,
          onClick: undefined,
          placeholder: 'Folder name..',
          create: (folderName: string) =>
            createFolder({
              workspaceId: workspace.id,
              destinationPathname: folderPathname,
              folderName: folderName,
            }),
        },
      ],

      contextControls: [
        // todo: no control for bookmark for now (add bookmarked property to folder DB)
        // {
        // type: MenuTypes.Normal,
        // icon: folder.bookmarked ? mdiStar : mdiStarOutline,
        // label:
        //   treeSendingMap.get(folderId) === 'bookmark'
        //     ? '...'
        //     : folder.bookmarked
        //     ? 'Bookmarked'
        //     : 'Bookmark',
        // onClick: () =>
        //   toggleFolderBookmark(folder.teamId, folder.id, folder.bookmarked),
        // },
        {
          type: MenuTypes.Normal,
          icon: mdiPencil,
          label: 'Rename',
          onClick: () => openRenameFolderForm(workspace.id, folder),
        },
        {
          type: MenuTypes.Normal,
          icon: mdiTrashCanOutline,
          label: 'Delete',
          onClick: () =>
            deleteFolder({
              workspaceId: workspace.id,
              pathname: folderPathname,
            }),
        },
        {
          type: MenuTypes.Normal,
          label: 'Export Folder',
          icon: mdiExport,
          onClick: () =>
            exportDocuments(workspace, {
              folderName,
              folderPathname,
              exportingStorage: false,
            }),
        },
      ],
      parentId: parentFolderId,
      children:
        folder.orderedIds != null
          ? folder.orderedIds
          : getFolderChildrenOrderedIds(folder, notes, folders),
    })
  })

  notes.forEach((doc) => {
    if (doc.trashed) {
      return
    }
    const noteId = doc._id
    const href = getDocHref(doc, workspace.id)
    const bookmarked = !!doc.data.bookmarked
    const parentFolderDoc = workspace.folderMap[doc.folderPathname]
    const parentNoteId =
      parentFolderDoc != null
        ? parentFolderDoc.pathname == '/'
          ? workspace.id
          : parentFolderDoc.orderId
        : workspace.id
    items.set(noteId, {
      id: noteId,
      lastUpdated: doc.updatedAt, // doc.head != null ? doc.head.created : doc.updatedAt,
      label: getNoteTitle(doc, 'Untitled'),
      bookmarked: bookmarked,
      defaultIcon: mdiFileDocumentOutline,
      trashed: doc.trashed,
      children: [],
      href,
      active: href === currentPathWithWorkspace,
      dropAround: sortingOrder === 'drag',
      navigateTo: () => push(href),
      onDrop: (position: SidebarDragState) =>
        dropInDocOrFolder(workspace, { type: 'doc', result: doc }, position),
      onDragStart: () => {
        draggedResource.current = { type: 'doc', result: doc }
      },
      contextControls: [
        {
          type: MenuTypes.Normal,
          icon: bookmarked ? mdiStar : mdiStarOutline,
          label: bookmarked ? 'Bookmarked' : 'Bookmark',
          onClick: () => toggleNoteBookmark(workspace.id, noteId, bookmarked),
        },
        {
          type: MenuTypes.Normal,
          icon: mdiPencil,
          label: 'Rename',
          onClick: () => openRenameNoteForm(workspace.id, doc),
        },
        {
          type: MenuTypes.Normal,
          icon: mdiArchiveOutline,
          label: doc.trashed ? 'Restore' : 'Archive',
          onClick: () => toggleNoteArchived(workspace.id, noteId, doc.trashed),
        },
        {
          type: MenuTypes.Normal,
          icon: mdiLinkVariant,
          label: 'Copy note link',
          onClick: async () => {
            const noteLink = await copyNoteLink(workspace.id, noteId, {
              title: getNoteTitle(doc, 'Untitled'),
              folderPathname: doc.folderPathname,
            })
            if (noteLink) {
              copy(noteLink)
              pushMessage({
                type: 'success',
                title: 'Note Link Copied',
                description: 'Paste note link in any note to add a link to it',
              })
            } else {
              pushMessage({
                title: 'Note Link Error',
                description:
                  'An error occurred while attempting to create a note link',
              })
            }
          },
        },
      ],
      parentId: parentNoteId,
    })
  })

  const arrayItems = getMapValues(items)
  const tree: Partial<SidebarNavCategory>[] = []

  const bookmarked = arrayItems.reduce((acc, val) => {
    if (!val.bookmarked) {
      return acc
    }
    acc.push({
      id: val.id,
      depth: 0,
      label: val.label,
      emoji: val.emoji,
      defaultIcon: val.defaultIcon,
      href: val.href,
      navigateTo: val.navigateTo,
      contextControls: val.contextControls,
    })
    return acc
  }, [] as SidebarTreeChildRow[])

  const workspaceRows = arrayItems.filter(
    (item) => item.parentId == workspace.id
  )
  const rootFolder = workspace.folderMap['/']
  let orderedWorkspaceRows: LocalTreeItem[] = []
  if (sortingOrder == 'drag') {
    const rootOrderedIds =
      rootFolder != null ? rootFolder.orderedIds : undefined
    if (rootOrderedIds == null) {
      orderedWorkspaceRows = workspaceRows
    } else {
      rootOrderedIds.forEach((orderId) => {
        const workspaceChildItem = items.get(orderId)
        if (workspaceChildItem != null) {
          orderedWorkspaceRows.push(workspaceChildItem)
        }
      })
    }
  } else {
    orderedWorkspaceRows = getWorkspaceChildrenOrdered(
      sortingOrder,
      workspaceRows
    )
  }
  const navTree = orderedWorkspaceRows.reduce((acc, val) => {
    acc.push({
      ...val,
      depth: 0,
      rows: buildChildrenNavRows(sortingOrder, val.children, 1, items),
    })
    return acc
  }, [] as SidebarTreeChildRow[])

  const notesPerLabelIdMap = notes.reduce((acc, note) => {
    const noteLabelNames = note.tags || []
    noteLabelNames.forEach((tagName) => {
      const label = labelMap[tagName]
      if (label) {
        let noteIds = acc.get(label._id)
        if (noteIds == null) {
          noteIds = []
          acc.set(label._id, noteIds)
        }
        noteIds.push(note._id)
      }
    })
    return acc
  }, new Map<string, string[]>())

  const labels = values(labelMap)
    .filter((tag) => (notesPerLabelIdMap.get(tag._id) || []).length > 0)
    .sort((a, b) =>
      sortLabels(
        labelSortingOrder,
        a,
        b,
        (notesPerLabelIdMap.get(a._id) || []).length,
        (notesPerLabelIdMap.get(b._id) || []).length
      )
    )
    .reduce((acc, val) => {
      const tagName = getTagName(val._id)
      const href = getLabelHref(workspace, tagName)
      acc.push({
        id: val._id,
        depth: 0,
        label: tagName,
        defaultIcon: mdiTag,
        href,
        active: href === currentPathWithWorkspace,
        navigateTo: () => push(href),
      })
      return acc
    }, [] as SidebarTreeChildRow[])

  if (bookmarked.length > 0) {
    tree.push({
      label: 'Bookmarks',
      rows: bookmarked,
    })
  }
  tree.push({
    label: 'Folder',
    rows: navTree,
    controls: [
      {
        icon: mdiTextBoxPlus,
        onClick: undefined,
        placeholder: 'Note title..',
        create: (title: string) =>
          createNote({
            workspaceId: workspace.id,
            docProps: { title: title },
          }),
      },
      {
        icon: mdiFolderPlusOutline,
        onClick: undefined,
        placeholder: 'Folder name..',
        create: (folderName: string) =>
          createFolder({
            workspaceId: workspace.id,
            folderName: folderName,
            destinationPathname: '/',
          }),
      },
    ],
    contextControls: mapTreeControls(workspace, exportDocuments),
  })

  const sidebarSortingControls = mapControlsToPopup({
    Sorting: Object.values(SidebarTreeLabelSortingOrders).map((sort) => {
      return {
        type: 'radio',
        label: sort.label,
        icon: sort.icon,
        checked: sort.value === labelSortingOrder,
        onClick: () => labelSetSortingOrder(sort.value),
      }
    }),
  })

  if (labels.length > 0) {
    tree.push({
      label: 'Labels',
      rows: labels,
      contextControls: [...sidebarSortingControls],
    })
  }

  const attachmentsHref = getAttachmentsHref(workspace)
  const archiveHref = getArchiveHref(workspace)
  tree.push({
    label: 'More',
    rows: [
      {
        id: 'sidenav-attachment-local',
        label: 'Attachments',
        defaultIcon: mdiPaperclip,
        href: attachmentsHref,
        active: attachmentsHref === currentPathWithWorkspace,
        navigateTo: () => push(attachmentsHref),
        depth: 0,
      },
      {
        id: 'sidenav-archived-local',
        label: 'Archive',
        defaultIcon: mdiArchiveOutline,
        href: archiveHref,
        active: archiveHref === currentPathWithWorkspace,
        navigateTo: () => push(archiveHref),
        depth: 0,
      },
    ],
  })

  tree.forEach((category) => {
    const key = (category.label || '').toLocaleLowerCase()
    const foldKey = `fold-${key}`
    const hideKey = `hide-${key}`
    category.folded = sideBarOpenedLinksIdsSet.has(foldKey)
    category.folding = getFoldEvents('links', foldKey, true)
    category.hidden = sideBarOpenedLinksIdsSet.has(hideKey)
    category.toggleHidden = () => toggleItem('links', hideKey)
  })
  return tree as SidebarNavCategory[]
}

function buildChildrenNavRows(
  sortingOrder: SidebarTreeSortingOrder,
  childrenIds: string[],
  depth: number,
  map: Map<string, LocalTreeItem>
) {
  const rows = childrenIds.reduce((acc, childId) => {
    const childRow = map.get(childId)
    if (childRow == null) {
      return acc
    }

    if (childRow.trashed) {
      return acc
    }

    acc.push({
      ...childRow,
      depth,
      rows: buildChildrenNavRows(
        sortingOrder,
        childRow.children,
        depth + 1,
        map
      ),
    })

    return acc
  }, [] as (SidebarTreeChildRow & { lastUpdated?: string })[])

  return sortTreeItems(rows, sortingOrder)
}
