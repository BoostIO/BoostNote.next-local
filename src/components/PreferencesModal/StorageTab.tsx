import React, { useCallback, useState } from 'react'
import { useDb } from '../../lib/db'
import { NoteStorage } from '../../lib/db/types'
import { useRouter } from '../../lib/router'
import { useTranslation } from 'react-i18next'
import {
  FormHeading,
  FormTextInput,
  FormLabelGroup,
  FormLabelGroupLabel,
  FormLabelGroupContent,
  FormControlGroup,
} from '../atoms/form'
import { useToast } from '../../shared/lib/stores/toast'
import Button from '../../shared/components/atoms/Button'
import styled from '../../shared/lib/styled'
import { useDialog, DialogIconTypes } from '../../shared/lib/stores/dialog'

interface StorageEditPageProps {
  storage: NoteStorage
}

const StorageEditPage = ({ storage }: StorageEditPageProps) => {
  const db = useDb()
  const router = useRouter()
  const { t } = useTranslation()
  const [newName, setNewName] = useState(storage.name)
  const { messageBox } = useDialog()
  const { pushMessage } = useToast()

  const removeCallback = useCallback(() => {
    messageBox({
      title: t('storage.delete', { storage: storage.name }),
      message:
        "This operation won't delete the actual data files in your disk. You can add it to the app again.",
      iconType: DialogIconTypes.Warning,
      buttons: [
        {
          variant: 'warning',
          label: t('storage.remove'),
          onClick: async () => {
            try {
              await db.removeStorage(storage.id)
              router.push('/app')
            } catch {
              pushMessage({
                title: t('general.networkError'),
                description: `An error occurred while deleting space (id: ${storage.id})`,
              })
            }
          },
        },
        {
          label: t('general.cancel'),
          cancelButton: true,
          defaultButton: true,
          variant: 'secondary',
        },
      ],
    })
  }, [storage, t, db, router, messageBox, pushMessage])

  const updateStorageName = useCallback(() => {
    db.renameStorage(storage.id, newName)
  }, [storage.id, db, newName])

  return (
    <div>
      <h2>Space Settings</h2>
      <p>Location : {storage.location}</p>

      <FormLabelGroup>
        <FormLabelGroupLabel>Space Name</FormLabelGroupLabel>
        <FormLabelGroupContent>
          <FormTextInput
            type='text'
            value={newName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewName(e.target.value)
            }
          />
        </FormLabelGroupContent>
      </FormLabelGroup>
      <FormControlGroup>
        <Button variant={'primary'} onClick={updateStorageName}>
          Save
        </Button>
      </FormControlGroup>

      <hr />

      <FormHeading depth={2}>Remove Space</FormHeading>
      <p>
        This will not delete the actual data files in your disk. You can add it
        to the app again.&nbsp;
        <InlineLinkButton>
          <Button
            className={'storage__tab__link'}
            variant={'link'}
            onClick={removeCallback}
          >
            Remove
          </Button>
        </InlineLinkButton>
      </p>
    </div>
  )
}

const InlineLinkButton = styled.a`
  .storage__tab__link {
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
`

export default StorageEditPage
