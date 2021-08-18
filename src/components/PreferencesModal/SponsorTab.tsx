import React from 'react'
import { SectionHeader } from './styled'
import Button from '../../shared/components/atoms/Button'
import { openNew } from '../../lib/platform'
import Image from '../atoms/Image'

const SponsorTab = () => {
  return (
    <div>
      <SectionHeader>Please support our open source activity</SectionHeader>
      <p>
        We need your support to maintain Boost Note app sustainably. Thanks for
        helping us!
      </p>
      <div>
        <Button
          onClick={() => openNew('https://www.buymeacoffee.com/komediruzecki ')}
        >
          Komediruzecki - buy me a coffee
        </Button>
      </div>
      <div>
        <Image
          style={{ marginLeft: 0, width: '420px', paddingTop: '1em' }}
          src={'/app/static/komediruzecki-buymeacoffee-com.png'}
        />
      </div>
    </div>
  )
}

export default SponsorTab
