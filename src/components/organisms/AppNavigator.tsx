import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useDb } from '../../lib/db'
import { entries } from '../../lib/db/utils'
import { mdiMessageQuestion } from '@mdi/js'
import { useActiveStorageId } from '../../lib/routeParams'
import { openContextMenu, setBadgeCount } from '../../lib/electronOnly'
import { osName } from '../../lib/platform'
import SidebarSpaces, {
  SidebarSpace,
} from '../../shared/components/organisms/Sidebar/molecules/SidebarSpaces'
import { useStorageRouter } from '../../lib/storageRouter'
import { MenuItemConstructorOptions } from 'electron/main'
import { useTranslation } from 'react-i18next'
import { DialogIconTypes, useDialog } from '../../shared/lib/stores/dialog'
import BasicInputFormLocal from '../v2/organisms/BasicInputFormLocal'
import { useModal } from '../../shared/lib/stores/modal'
import { useToast } from '../../shared/lib/stores/toast'
import styled from '../../shared/lib/styled'
import SidebarPopOver from '../../shared/components/organisms/Sidebar/atoms/SidebarPopOver'

const TopLevelNavigator = () => {
  const { storageMap, renameStorage, removeStorage } = useDb()
  const { navigate } = useStorageRouter()
  const { messageBox } = useDialog()
  const { openModal, closeLastModal } = useModal()
  const { pushMessage } = useToast()
  const { t } = useTranslation()
  const [showSpaces, setShowSpaces] = useState(false)
  const activeStorageId = useActiveStorageId()

  const [notificationCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    setBadgeCount(
      Object.values(notificationCounts).reduce((prev, curr) => prev + curr, 0)
    )
  }, [notificationCounts])

  const inputRef = useRef<HTMLInputElement>(null)
  const spaces = useMemo(() => {
    const spaces: SidebarSpace[] = []

    entries(storageMap).forEach(([workspaceId, workspace], index) => {
      spaces.push({
        label: workspace.name,
        active: activeStorageId === workspaceId,
        tooltip: `${osName === 'macos' ? '⌘' : 'Ctrl'} ${index + 1}`,
        linkProps: {
          onClick: (event) => {
            event.preventDefault()
            navigate(workspace.id)
          },
          onContextMenu: (event) => {
            event.preventDefault()
            event.stopPropagation()
            const menuItems: MenuItemConstructorOptions[] = [
              {
                type: 'normal',
                label: t('storage.rename'),
                click: async () => {
                  openModal(
                    <BasicInputFormLocal
                      inputRef={inputRef}
                      defaultIcon={mdiMessageQuestion}
                      defaultInputValue={workspace.name}
                      placeholder='Folder name'
                      submitButtonProps={{
                        label: t('storage.rename'),
                      }}
                      onSubmit={async (workspaceName: string | null) => {
                        if (workspaceName == '' || workspaceName == null) {
                          pushMessage({
                            title: 'Cannot rename folder',
                            description: 'Folder name should not be empty.',
                          })
                          return
                        }
                        await renameStorage(workspace.id, workspaceName)
                        closeLastModal()
                      }}
                    />,
                    {
                      showCloseIcon: true,
                      title: `Rename "${workspace.name}" storage`,
                    }
                  )
                },
              },
              { type: 'separator' },
              {
                type: 'normal',
                label: t('storage.remove'),
                click: async () => {
                  messageBox({
                    title: `Remove "${workspace.name}" storage`,
                    message:
                      "This operation won't delete the actual storage folder. You can add it to the app again.",
                    iconType: DialogIconTypes.Warning,
                    buttons: [
                      {
                        label: t('storage.remove'),
                        defaultButton: true,
                        onClick: () => {
                          removeStorage(workspace.id)
                        },
                      },
                      { label: t('general.cancel'), cancelButton: true },
                    ],
                  })
                },
              },
            ]

            openContextMenu({ menuItems })
          },
        },
      })
    })

    return spaces
  }, [
    storageMap,
    activeStorageId,
    navigate,
    t,
    openModal,
    renameStorage,
    closeLastModal,
    pushMessage,
    messageBox,
    removeStorage,
  ])

  return (
    <Container>
      {showSpaces && (
        <SidebarPopOver onClose={() => setShowSpaces(false)}>
          <SidebarSpaces
            className='sidebar__spaces'
            spaces={spaces}
            onSpacesBlur={() => setShowSpaces(false)}
          />
        </SidebarPopOver>
      )}
    </Container>
  )
}

export default TopLevelNavigator

const Container = styled.div``
