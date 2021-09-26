import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { NoteStorage, Attachment, AttachmentData } from '../../lib/db/types'
import { size, values } from '../../lib/db/utils'
import { downloadBlob } from '../../lib/download'
import { openContextMenu, openPath } from '../../lib/electronOnly'
import copy from 'copy-to-clipboard'
import styled from '../../shared/lib/styled'
import { useLocalUI } from '../../lib/v2/hooks/useLocalUI'
import ImagePreview from '../molecules/Image/ImagePreview'
import { useModal } from '../../shared/lib/stores/modal'

const ListContainer = styled.div`
  display: flex;
  align-items: center;

  flex-direction: row;
  flex-wrap: wrap;
`

const ListItem = styled.div`
  width: 90px;
  height: 90px;
  margin: 6px;
  background-size: cover;
  background-position: 50%;

  &:hover {
    cursor: pointer;
  }
`

interface AttachmentListItemProps {
  workspaceId: string
  attachment: Attachment
}

const AttachmentListItem = ({
  workspaceId,
  attachment,
}: AttachmentListItemProps) => {
  const { closeLastModal, openModal } = useModal()
  const { removeAttachment } = useLocalUI()
  const [data, setData] = useState<AttachmentData | null>(null)

  useEffect(() => {
    attachment.getData().then((data) => {
      setData(data)
    })
  }, [attachment])

  const src = useMemo(() => {
    if (data == null) {
      return ''
    }
    switch (data.type) {
      case 'blob':
        return URL.createObjectURL(data.blob)
      case 'src':
        return data.src
    }
  }, [data])

  const showEnlargedImage = useCallback(() => {
    if (src == '') {
      return
    }
    closeLastModal()
    openModal(<ImagePreview src={src} />, {
      showCloseIcon: true,
      hideBackground: true,
      width: 'full',
    })
  }, [closeLastModal, openModal, src])

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(src)
    }
  }, [src])

  if (data == null) {
    return null
  }

  return (
    <ListItem
      onClick={showEnlargedImage}
      key={attachment!.name}
      style={{
        backgroundImage: `url("${src}")`,
      }}
      onContextMenu={(event: React.MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()

        openContextMenu({
          menuItems: [
            data.type === 'blob'
              ? {
                  type: 'normal',
                  label: 'Download',
                  click: () => {
                    downloadBlob(data.blob, attachment.name)
                  },
                }
              : {
                  type: 'normal',
                  label: 'Open on disk',
                  click: () => {
                    const filePath = data.src.substring('file://'.length)
                    openPath(filePath)
                  },
                },
            {
              type: 'normal',
              label: 'Copy Attachment Name',
              click: () => {
                copy(attachment.name)
              },
            },
            {
              type: 'normal',
              label: 'Remove Attachment',
              click: () => removeAttachment(workspaceId, attachment.name),
            },
          ],
        })
      }}
    />
  )
}
interface AttachmentListProps {
  workspace: NoteStorage
}

const AttachmentList = ({ workspace }: AttachmentListProps) => {
  const { attachmentMap } = workspace

  const attachments = useMemo(() => {
    if (size(attachmentMap) === 0) {
      return (
        <NoAttachmentsContainer>
          No attachments found, please add some images to a document to see them
          here.
        </NoAttachmentsContainer>
      )
    }
    return values(attachmentMap).map((attachment) => {
      return (
        <AttachmentListItem
          workspaceId={workspace.id}
          attachment={attachment}
          key={attachment.name}
        />
      )
    })
  }, [attachmentMap, workspace])

  return <ListContainer>{attachments}</ListContainer>
}

const NoAttachmentsContainer = styled.div`
  margin: 1em;
`

export default AttachmentList
