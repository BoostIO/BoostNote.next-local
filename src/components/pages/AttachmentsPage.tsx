import React from 'react'

import {
  StorageAttachmentsRouteParams,
  useRouteParams,
} from '../../lib/routeParams'
import { useDb } from '../../lib/db'
import { getFileList } from '../../lib/dnd'
import AttachmentList from '../organisms/AttachmentList'
import { mdiPaperclip } from '@mdi/js'
import PageDraggableHeader from '../atoms/PageDraggableHeader'
import { NoteStorage } from '../../lib/db/types'
import Application from '../Application'
import { getAttachmentsHref } from '../../lib/db/utils'
import { useRouter } from '../../lib/router'
import styled from '../../shared/lib/styled'
import { topParentId } from '../../lib/v2/mappers/local/topbarTree'

const Container = styled.div`
  height: 100%;
`

interface AttachmentsPageProps {
  storage: NoteStorage
}

const AttachmentsPage = ({ storage }: AttachmentsPageProps) => {
  const routeParams = useRouteParams() as StorageAttachmentsRouteParams
  const { workspaceId } = routeParams

  const { addAttachments } = useDb()
  const { push } = useRouter()

  const attachmentsHref = getAttachmentsHref(storage)
  return (
    <Application
      content={{
        topbar: {
          breadcrumbs: [
            {
              label: 'Attachments',
              active: true,
              parentId: topParentId,
              icon: mdiPaperclip,
              link: {
                href: attachmentsHref,
                navigateTo: () => push(attachmentsHref),
              },
            },
          ],
        },
      }}
    >
      <Container
        onDragOver={(event: React.DragEvent) => {
          event.preventDefault()
        }}
        onDrop={(event: React.DragEvent) => {
          event.preventDefault()

          const files = getFileList(event)
          addAttachments(workspaceId, files)
        }}
      >
        <PageDraggableHeader
          iconPath={mdiPaperclip}
          label={`Attachments in ${storage.name}`}
        />

        <AttachmentList workspace={storage} />
      </Container>
    </Application>
  )
}

export default AttachmentsPage
