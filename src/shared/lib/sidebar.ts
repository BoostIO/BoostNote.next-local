import {
  mdiMouseMoveDown,
  mdiSortAlphabeticalAscending,
  mdiSortAlphabeticalDescending,
  mdiSortBoolAscending,
  mdiSortBoolDescending,
  mdiSortClockAscending,
  mdiSortClockDescending,
} from '@mdi/js'

export const defaultSidebarExpandedWidth = 250
export const maxSidebarExpandedWidth = 500
export const minSidebarExpandedWidth = 150

export type SidebarTreeSortingOrder = 'drag' | 'a-z' | 'z-a' | 'last-updated'
export type SidebarTreeLabelSortingOrder =
  | 'a-z'
  | 'z-a'
  | 'created-date-asc'
  | 'created-date-dsc'
  | 'updated-date-asc'
  | 'updated-date-dsc'
  | 'count-asc'
  | 'count-dsc'

export const SidebarTreeLabelSortingOrders = {
  updatedDateAsc: {
    value: 'updated-date-asc',
    label: 'Last updated last',
    icon: mdiSortClockAscending,
  },
  updatedDateDsc: {
    value: 'updated-date-dsc',
    label: 'Last updated first',
    icon: mdiSortClockDescending,
  },
  createdDateAsc: {
    value: 'created-date-asc',
    label: 'Created first',
    icon: mdiSortClockAscending,
  },
  createdDateDsc: {
    value: 'created-date-dsc',
    label: 'Created last',
    icon: mdiSortClockDescending,
  },
  aZ: {
    value: 'a-z',
    label: 'Label A-Z',
    icon: mdiSortAlphabeticalAscending,
  },
  zA: {
    value: 'z-a',
    label: 'Label Z-A',
    icon: mdiSortAlphabeticalDescending,
  },
  countAsc: {
    value: 'count-asc',
    label: 'Lowest count first',
    icon: mdiSortBoolAscending,
  },
  countDsc: {
    value: 'count-dsc',
    label: 'Highest count first',
    icon: mdiSortBoolDescending,
  },
} as {
  [title: string]: {
    value: SidebarTreeLabelSortingOrder
    label: string
    icon: string
  }
}

export const SidebarTreeSortingOrders = {
  lastUpdated: {
    value: 'last-updated',
    label: 'Last updated',
    icon: mdiSortClockAscending,
  },
  aZ: {
    value: 'a-z',
    label: 'Title A-Z',
    icon: mdiSortAlphabeticalAscending,
  },
  zA: {
    value: 'z-a',
    label: 'Title Z-A',
    icon: mdiSortAlphabeticalDescending,
  },
  dragDrop: {
    value: 'drag',
    label: 'Drag and drop',
    icon: mdiMouseMoveDown,
  },
} as {
  [title: string]: {
    value: SidebarTreeSortingOrder
    label: string
    icon: string
  }
}
