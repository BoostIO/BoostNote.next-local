import React from 'react'
import { NoteStorage } from '../../lib/db/types'
import ImportLegacyNotesForm from '../organisms/ImportLegacyNotesForm'

interface StorageEditPageProps {
  storage: NoteStorage
}

const ImportTab = ({ storage }: StorageEditPageProps) => {
  return (
    <div>
      <ImportLegacyNotesForm storageId={storage.id} />
    </div>
  )
}

export default ImportTab
