import Application from '../Application'
import { mdiAlertBoxOutline } from '@mdi/js'
import React from 'react'
import Icon from '../../shared/components/atoms/Icon'

interface NoteFoundErrorPageProps {
  title: string
  description: string
}

const NoteFoundErrorPage = ({
  title,
  description,
}: NoteFoundErrorPageProps) => {
  return (
    <Application
      hideSidebar={true}
      content={{
        header: (
          <div style={{ margin: '0 10px' }}>
            <Icon path={mdiAlertBoxOutline} size={20} />
            <span style={{ marginLeft: 10 }}>{title}</span>
          </div>
        ),
      }}
    >
      <div style={{ marginLeft: 15 }}>{description}</div>
    </Application>
  )
}

export default NoteFoundErrorPage
