import React, { useEffect, useMemo } from 'react'
import { useRouter } from '../lib/router'
import { useRouteParams } from '../lib/routeParams'
import StorageCreatePage from './pages/StorageCreatePage'
import { useDb } from '../lib/db'
import AttachmentsPage from './pages/AttachmentsPage'
import WikiNotePage from './pages/WikiNotePage'
import { size, values } from '../lib/db/utils'
import ArchivePage from './pages/ArchivePage'
import LabelsPage from './pages/LabelsPage'
import TimelinePage from './pages/TimelinePage'
import NotFoundErrorPage from './pages/NotFoundErrorPage'

const Router = () => {
  const routeParams = useRouteParams()
  const { storageMap } = useDb()

  useRedirect()
  switch (routeParams.name) {
    case 'workspaces.notes': {
      const { workspaceId } = routeParams
      const storage = storageMap[workspaceId]
      if (storage == null) {
        break
      }

      return <WikiNotePage storage={storage} />
    }

    case 'workspaces.labels.show': {
      const { workspaceId, tagName } = routeParams
      const storage = storageMap[workspaceId]
      if (storage == null) {
        break
      }

      return <LabelsPage storage={storage} tagName={tagName} />
    }

    case 'workspaces.archive': {
      const { workspaceId } = routeParams
      const storage = storageMap[workspaceId]
      if (storage == null) {
        break
      }

      return <ArchivePage storage={storage} />
    }
    case 'workspaces.attachments': {
      const { workspaceId } = routeParams
      const storage = storageMap[workspaceId]
      if (storage == null) {
        break
      }

      return <AttachmentsPage storage={storage} />
    }
    case 'workspaces.timeline': {
      const { workspaceId } = routeParams
      const storage = storageMap[workspaceId]
      if (storage == null) {
        break
      }

      return <TimelinePage storage={storage} />
    }
    case 'workspaces.create':
      return <StorageCreatePage />
  }

  if (size(storageMap) == 0) {
    return <StorageCreatePage />
  }

  return (
    <NotFoundErrorPage
      title={'Page not found'}
      description={
        'Check the URL or click other link in the left side navigation.'
      }
    />
  )
}

export default Router

function useRedirect() {
  const { pathname, replace } = useRouter()
  const { storageMap } = useDb()

  const firstStorageId = useMemo<string | null>(() => {
    const storages = values(storageMap)
    if (storages.length > 0) {
      return storages[0].id
    }
    return null
  }, [storageMap])

  useEffect(() => {
    if (pathname === '' || pathname === '/' || pathname === '/app') {
      if (firstStorageId == null) {
        replace('/app/storages')
      } else {
        replace(`/app/storages/${firstStorageId}`)
      }
    }
  }, [pathname, replace, firstStorageId])
}
