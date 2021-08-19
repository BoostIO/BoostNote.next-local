import React from 'react'
import { SectionHeader } from './styled'
import Image from '../atoms/Image'
import { PrimaryLink } from './AboutTab'
import styled from '../../shared/lib/styled'

const SponsorTab = () => {
  return (
    <div>
      <SectionHeader>
        Please support the development of the free and open-source Boost Note
        application.
      </SectionHeader>
      <SponsorText>
        We need your support to maintain the Boost Note app sustainably. Thanks
        for helping us!
      </SponsorText>
      <div>
        <SponsorText>
          The BoostIO company is currently focusing on developing the Boost Note
          next cloud spaces. You can find more information about the cloud space
          and its features on{' '}
          <PrimaryLink href='https://boostnote.io/'>
            Boost Note webpage
          </PrimaryLink>
          .
        </SponsorText>

        <SponsorText>
          Boost Note local spaces are very popular with many satisfied users, so
          the application will be further developed by the open-source community
          and a designated maintainer{' '}
          <PrimaryLink href='https://github.com/Komediruzecki'>
            Komediruzecki
          </PrimaryLink>
          .
        </SponsorText>
        <SponsorText>
          If you want to help support the development, you can do so by engaging
          with our community, creating issues, and contributing to solving them,
          as well as suggesting new features on our new{' '}
          <PrimaryLink href='https://github.com/BoostIO/BoostNote.next-local'>
            Github repository
          </PrimaryLink>
          .
        </SponsorText>

        <SponsorText>
          If you want to support the maintainer please do so by{' '}
          <PrimaryLink href={'https://www.buymeacoffee.com/komediruzecki'}>
            following this link
          </PrimaryLink>
          .
        </SponsorText>
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

const SponsorText = styled.p`
  max-width: 700px;
  font-size: ${({ theme }) => theme.sizes.fonts.md}px;
`

export default SponsorTab
