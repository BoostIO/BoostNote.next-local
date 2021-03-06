import React from 'react'
import cc from 'classcat'
import {
  defaultSidebarExpandedWidth,
  maxSidebarExpandedWidth,
  minSidebarExpandedWidth,
} from '../../../lib/sidebar'
import styled from '../../../lib/styled'
import WidthEnlarger from '../../atoms/WidthEnlarger'
import Spinner from '../../atoms/Spinner'
import SidebarTree, { SidebarNavCategory } from './molecules/SidebarTree'
import SidebarPopOver from './atoms/SidebarPopOver'
import SidebarSpaces, { SidebarSpaceProps } from './molecules/SidebarSpaces'
import SidebarContextList from '../Sidebar/atoms/SidebarContextList'
import VerticalScroller from '../../atoms/VerticalScroller'

export type PopOverState = null | 'spaces' | 'notifications'

type SidebarProps = {
  popOver: PopOverState
  sidebarExpandedWidth?: number
  sidebarResize?: (width: number) => void
  className?: string
  header?: React.ReactNode
  tree?: SidebarNavCategory[]
  treeBottomRows?: React.ReactNode
} & SidebarSpaceProps

const Sidebar = ({
  popOver,
  onSpacesBlur: onPopOverBlur,
  spaces,
  sidebarExpandedWidth = defaultSidebarExpandedWidth,
  sidebarResize,
  tree,
  header,
  treeBottomRows,
  className,
}: SidebarProps) => {
  return (
    <SidebarContainer className={cc(['sidebar', className])}>
      {popOver === 'spaces' ? (
        <SidebarPopOver>
          <SidebarSpaces spaces={spaces} onSpacesBlur={onPopOverBlur} />
        </SidebarPopOver>
      ) : null}
      <WidthEnlarger
        position='right'
        minWidth={minSidebarExpandedWidth}
        maxWidth={maxSidebarExpandedWidth}
        defaultWidth={sidebarExpandedWidth}
        onResizeEnd={sidebarResize}
        className={cc(['sidebar--expanded'])}
      >
        <SidebarContextList className='sidebar--expanded__wrapper'>
          <div className='sidebar--expanded__wrapper__header'>{header}</div>
          <VerticalScroller className='sidebar--expanded__wrapper__content'>
            {tree == null ? (
              <Spinner className='sidebar__loader' />
            ) : (
              <SidebarTree tree={tree} />
            )}
            {treeBottomRows}
          </VerticalScroller>
        </SidebarContextList>
      </WidthEnlarger>
    </SidebarContainer>
  )
}

export default React.memo(Sidebar)

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: top;
  flex: 0 0 auto;
  height: 100vh;

  .sidebar--expanded,
  .width__enlarger__content,
  .sidebar--expanded__wrapper {
    height: 100% !important;
  }

  .sidebar__loader {
    margin: auto;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .sidebar--expanded__wrapper__header {
    flex: 0 0 auto;
  }

  .sidebar--expanded__wrapper__content {
    flex: 1 1 auto;
    position: relative;
    padding-bottom: ${({ theme }) => theme.sizes.spaces.df}px;
  }

  .sidebar--expanded {
    border-right: 1px solid ${({ theme }) => theme.colors.border.main};
    height: 100%;
    max-height: 100%;
    position: relative;
  }

  .sidebar--expanded__wrapper {
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
`
