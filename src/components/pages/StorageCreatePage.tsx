import React from 'react'
import FSStorageCreateForm from '../organisms/FSStorageCreateForm'
import { mdiBookPlusMultiple } from '@mdi/js'
import Application from '../Application'
import Icon from '../../shared/components/atoms/Icon'

const StorageCreatePage = () => {
  return (
    <Application
      hideSidebar={true}
      content={{
        reduced: true,
        header: (
          <>
            <Icon path={mdiBookPlusMultiple} size={16} />
            <span style={{ marginLeft: 10, marginRight: 10 }}>
              Create Local Space
            </span>
          </>
        ),
      }}
    >
      <FSStorageCreateForm />
    </Application>
  )
}

export default StorageCreatePage
