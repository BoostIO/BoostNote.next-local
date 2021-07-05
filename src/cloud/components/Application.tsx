import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { usePreferences } from '../lib/stores/preferences'
import { usePage } from '../lib/stores/pageStore'
import {
  useGlobalKeyDownHandler,
  isSingleKeyEventOutsideOfInput,
  preventKeyboardEventPropagation,
  isSingleKeyEvent,
} from '../lib/keyboard'
import { isActiveElementAnInput, InputableDomElement } from '../lib/dom'
import { useEffectOnce } from 'react-use'
import { useSettings } from '../lib/stores/settings'
import { shortcuts } from '../lib/shortcuts'
import { useSearch } from '../lib/stores/search'
import AnnouncementAlert from './atoms/AnnouncementAlert'
import {
  modalDiscountEventEmitter,
  modalImportEventEmitter,
  newFolderEventEmitter,
  searchEventEmitter,
  toggleSidebarSearchEventEmitter,
  toggleSidebarTimelineEventEmitter,
  toggleSidebarTreeEventEmitter,
  toggleSidebarNotificationsEventEmitter,
} from '../lib/utils/events'
import { usePathnameChangeEffect, useRouter } from '../lib/router'
import { useNav } from '../lib/stores/nav'
import EventSource from './organisms/EventSource'
import ApplicationLayout from '../../shared/components/molecules/ApplicationLayout'
import { useGlobalData } from '../lib/stores/globalData'
import { SidebarState } from '../../shared/lib/sidebar'
import { mapUsers } from '../../shared/lib/mappers/users'
import { SerializedTeam } from '../interfaces/db/team'
import { getTeamURL } from '../lib/utils/patterns'
import {
  mdiCog,
  mdiDownload,
  mdiGiftOutline,
  mdiImport,
  mdiInbox,
  mdiLogoutVariant,
  mdiMagnify,
  mdiPaperclip,
  mdiPlusCircleOutline,
  mdiWeb,
} from '@mdi/js'
import { buildIconUrl } from '../api/files'
import ImportModal from './organisms/Modal/contents/Import/ImportModal'
import { SerializedTeamInvite } from '../interfaces/db/teamInvite'
import { getHexFromUUID } from '../lib/utils/string'
import { stringify } from 'querystring'
import { sendToHost, useElectron, usingElectron } from '../lib/stores/electron'
import { SidebarSpace } from '../../shared/components/organisms/Sidebar/molecules/SidebarSpaces'
import ContentLayout, {
  ContentLayoutProps,
} from '../../shared/components/templates/ContentLayout'
import cc from 'classcat'
import { useCloudResourceModals } from '../lib/hooks/useCloudResourceModals'
import { mapTopbarTree } from '../lib/mappers/topbarTree'
import FuzzyNavigation from '../../shared/components/organisms/FuzzyNavigation'
import {
  mapFuzzyNavigationItems,
  mapFuzzyNavigationRecentItems,
} from '../lib/mappers/fuzzyNavigation'
import { useModal } from '../../shared/lib/stores/modal'
import NewDocButton from './molecules/NewDocButton'
import { useCloudSidebarTree } from '../lib/hooks/sidebar/useCloudSidebarTree'
import { isEligibleForDiscount } from '../lib/subscription'
import { trackEvent } from '../api/track'
import { MixpanelActionTrackTypes } from '../interfaces/analytics/mixpanel'
import DiscountModal from './organisms/Modal/contents/DiscountModal'
import { Notification as UserNotification } from '../interfaces/db/notifications'
import useNotificationState from '../../shared/lib/hooks/useNotificationState'
import { useNotifications } from '../../shared/lib/stores/notifications'
import '../lib/i18n'
import { useI18n } from '../lib/hooks/useI18n'
import { TFunction } from 'i18next'
import { lngKeys } from '../lib/i18n/types'
import SidebarV2, {
  PopOverState,
} from '../../shared/components/organisms/SidebarV2'
import SidebarHeader from '../../shared/components/organisms/SidebarV2/atoms/SidebarHeader'
import SidebarButtonList from '../../shared/components/organisms/SidebarV2/molecules/SidebarButtonList'
import NotifyIcon from '../../shared/components/atoms/NotifyIcon'
import { getTeamLinkHref } from './atoms/Link/TeamLink'
import SidebarButton from '../../shared/components/organisms/SidebarV2/atoms/SidebarButton'
import CloudGlobalSearch from './organisms/CloudGlobalSearch'

interface ApplicationProps {
  content: ContentLayoutProps
  className?: string
  initialSidebarState?: SidebarState
}

const Application = ({
  content: { topbar, ...content },
  children,
  initialSidebarState,
}: React.PropsWithChildren<ApplicationProps>) => {
  const { preferences, setPreferences } = usePreferences()
  const {
    initialLoadDone,
    docsMap,
    foldersMap,
    workspacesMap,
    currentParentFolderId,
    currentWorkspaceId,
  } = useNav()
  const {
    team,
    permissions = [],
    currentUserPermissions,
    currentUserIsCoreMember,
  } = usePage()
  const { openModal } = useModal()
  const {
    globalData: { teams, invites, currentUser },
  } = useGlobalData()
  const { push, query, goBack, goForward, pathname } = useRouter()
  const [popOverState, setPopOverState] = useState<PopOverState>(null)
  const [sidebarState, setSidebarState] = useState<SidebarState | undefined>(
    initialSidebarState != null
      ? initialSidebarState
      : preferences.lastSidebarState
  )
  const { openSettingsTab, closeSettingsTab } = useSettings()
  const { usingElectron, sendToElectron } = useElectron()
  const { openNewFolderForm } = useCloudResourceModals()
  const [showFuzzyNavigation, setShowFuzzyNavigation] = useState(false)
  const {
    treeWithOrderedCategories,
    sidebarHeaderControls,
  } = useCloudSidebarTree()
  const { counts } = useNotifications()
  const { translate } = useI18n()
  const [showSearchScreen, setShowSearchScreen] = useState(true)

  usePathnameChangeEffect(() => {
    setShowFuzzyNavigation(false)
    setShowSearchScreen(false)
  })

  useEffectOnce(() => {
    if (query.settings === 'upgrade') {
      openSettingsTab('teamUpgrade')
    }
  })

  useEffect(() => {
    setPreferences({ lastSidebarState: sidebarState })
  }, [sidebarState, setPreferences])

  useEffect(() => {
    const handler = () => {
      setShowFuzzyNavigation((prev) => !prev)
    }
    searchEventEmitter.listen(handler)
    return () => {
      searchEventEmitter.unlisten(handler)
    }
  }, [])

  const sidebarResize = useCallback(
    (width: number) => setPreferences({ sideBarWidth: width }),
    [setPreferences]
  )

  const users = useMemo(() => {
    return mapUsers(permissions, currentUser)
  }, [permissions, currentUser])

  const topbarTree = useMemo(() => {
    if (team == null) {
      return undefined
    }

    return mapTopbarTree(
      team,
      initialLoadDone,
      docsMap,
      foldersMap,
      workspacesMap,
      push
    )
  }, [team, initialLoadDone, docsMap, foldersMap, workspacesMap, push])

  const spaces = useMemo(() => {
    return mapSpaces(push, teams, invites, counts, team)
  }, [teams, team, invites, push, counts])

  const openCreateFolderModal = useCallback(() => {
    openNewFolderForm({
      team,
      workspaceId: currentWorkspaceId,
      parentFolderId: currentParentFolderId,
    })
  }, [openNewFolderForm, currentParentFolderId, team, currentWorkspaceId])

  useEffect(() => {
    if (team == null || currentUserPermissions == null) {
      return
    }
    newFolderEventEmitter.listen(openCreateFolderModal)
    return () => {
      newFolderEventEmitter.unlisten(openCreateFolderModal)
    }
  }, [team, currentUserPermissions, openCreateFolderModal])

  const overrideBrowserCtrlsHandler = useCallback(
    async (event: KeyboardEvent) => {
      if (team == null) {
        return
      }

      if (isSingleKeyEventOutsideOfInput(event, shortcuts.teamMembers)) {
        preventKeyboardEventPropagation(event)
        openSettingsTab('teamMembers')
      }

      if (isSingleKeyEvent(event, 'escape') && isActiveElementAnInput()) {
        if (isCodeMirrorTextAreaEvent(event)) {
          return
        }
        preventKeyboardEventPropagation(event)
        ;(document.activeElement as InputableDomElement).blur()
      }
    },
    [openSettingsTab, team]
  )
  useGlobalKeyDownHandler(overrideBrowserCtrlsHandler)

  const toggleSidebarTree = useCallback(() => {
    closeSettingsTab()
    setSidebarState((prev) => {
      return prev === 'tree' ? undefined : 'tree'
    })
  }, [closeSettingsTab])
  useEffect(() => {
    toggleSidebarTreeEventEmitter.listen(toggleSidebarTree)
    return () => {
      toggleSidebarTreeEventEmitter.unlisten(toggleSidebarTree)
    }
  }, [toggleSidebarTree])

  const toggleSidebarSearch = useCallback(() => {
    closeSettingsTab()
    setSidebarState((prev) => {
      return prev === 'search' ? undefined : 'search'
    })
  }, [closeSettingsTab])
  useEffect(() => {
    toggleSidebarSearchEventEmitter.listen(toggleSidebarSearch)
    return () => {
      toggleSidebarSearchEventEmitter.unlisten(toggleSidebarSearch)
    }
  }, [toggleSidebarSearch])

  const toggleSidebarTimeline = useCallback(() => {
    closeSettingsTab()
    setSidebarState((prev) => {
      return prev === 'timeline' ? undefined : 'timeline'
    })
  }, [closeSettingsTab])
  useEffect(() => {
    toggleSidebarTimelineEventEmitter.listen(toggleSidebarTimeline)
    return () => {
      toggleSidebarTimelineEventEmitter.unlisten(toggleSidebarTimeline)
    }
  }, [toggleSidebarTimeline])

  useEffect(() => {
    const handler = () =>
      setPopOverState((prev) =>
        prev !== 'notifications' ? 'notifications' : null
      )
    toggleSidebarNotificationsEventEmitter.listen(handler)
    return () => toggleSidebarNotificationsEventEmitter.unlisten(handler)
  }, [])

  const openImportModal = useCallback(() => {
    closeSettingsTab()
    openModal(<ImportModal />, { showCloseIcon: true })
  }, [closeSettingsTab, openModal])

  useEffect(() => {
    modalImportEventEmitter.listen(openImportModal)
    return () => {
      modalImportEventEmitter.unlisten(openImportModal)
    }
  }, [openImportModal])

  useEffect(() => {
    const openDiscountModal = () => {
      if (team == null) {
        return
      }
      trackEvent(MixpanelActionTrackTypes.UpgradeDiscount, { team: team.id })
      openModal(<DiscountModal />, { showCloseIcon: true, width: 'large' })
    }
    modalDiscountEventEmitter.listen(openDiscountModal)
    return () => {
      modalDiscountEventEmitter.unlisten(openDiscountModal)
    }
  }, [openModal, team])

  useEffect(() => {
    if (!usingElectron) {
      return
    }
    sendToElectron('sidebar--state', { state: sidebarState })
  }, [usingElectron, , sendToElectron, sidebarState])

  useEffect(() => {
    setPopOverState(null)
  }, [sidebarState])

  const onSpacesBlurCallback = useCallback(() => {
    setPopOverState(null)
  }, [])

  const spaceBottomRows = useMemo(
    () => buildSpacesBottomRows(push, translate),
    [push, translate]
  )

  const {
    state: notificationState,
    getMore: getMoreNotifications,
    setViewed,
  } = useNotificationState(team?.id)
  const notificationClick = useCallback(
    (notification: UserNotification) => {
      setPopOverState(null)
      setViewed(notification)
      push(notification.link)
    },
    [push, setViewed]
  )

  const { history } = useSearch()
  return (
    <>
      {team != null && <EventSource teamId={team.id} />}
      {showFuzzyNavigation && team != null && (
        <FuzzyNavigation
          close={() => setShowFuzzyNavigation(false)}
          allItems={mapFuzzyNavigationItems(
            team,
            push,
            docsMap,
            foldersMap,
            workspacesMap
          )}
          recentItems={mapFuzzyNavigationRecentItems(
            team,
            history,
            push,
            docsMap,
            foldersMap,
            workspacesMap
          )}
        />
      )}
      <ApplicationLayout
        sidebar={
          <SidebarV2
            className={cc(['application__sidebar'])}
            popOver={popOverState}
            onSpacesBlur={onSpacesBlurCallback}
            spaces={spaces}
            spaceBottomRows={spaceBottomRows}
            sidebarExpandedWidth={preferences.sideBarWidth}
            tree={treeWithOrderedCategories}
            sidebarResize={sidebarResize}
            header={
              <>
                <SidebarHeader
                  onSpaceClick={() => setPopOverState('spaces')}
                  spaceName={team != null ? team.name : '...'}
                  spaceImage={
                    team != null && team.icon != null
                      ? buildIconUrl(team.icon.location)
                      : undefined
                  }
                  controls={sidebarHeaderControls}
                />
                {team == null ? null : (
                  <SidebarButtonList
                    rows={[
                      {
                        label: translate(lngKeys.GeneralSearchVerb),
                        icon: mdiMagnify,
                        variant: 'transparent',
                        labelClick: () => setShowSearchScreen((prev) => !prev),
                        id: 'sidebar__button__search',
                        active: showSearchScreen,
                      },
                      {
                        label: translate(lngKeys.GeneralInbox),
                        icon:
                          team != null && counts[team.id] ? (
                            <NotifyIcon
                              size={16}
                              text={counts[team.id]}
                              path={mdiInbox}
                            />
                          ) : (
                            mdiInbox
                          ),
                        variant: 'transparent',
                        labelClick: () => setPopOverState('notifications'),
                        id: 'sidebar__button__inbox',
                      },
                      {
                        label: translate(lngKeys.SidebarSettingsAndMembers),
                        icon: mdiCog,
                        variant: 'transparent',
                        labelClick: () => openSettingsTab('teamMembers'),
                        id: 'sidebar__button__members',
                      },
                    ]}
                  >
                    {currentUserIsCoreMember && <NewDocButton team={team} />}
                  </SidebarButtonList>
                )}
              </>
            }
            treeBottomRows={
              team != null && (
                <SidebarButtonList
                  rows={[
                    {
                      label: translate(lngKeys.GeneralAttachments),
                      icon: mdiPaperclip,
                      variant: 'subtle',
                      labelClick: () => openSettingsTab('api'),
                      id: 'sidebar__button__attachments',
                    },
                    {
                      label: translate(lngKeys.GeneralShared),
                      icon: mdiWeb,
                      variant: 'subtle',
                      labelHref: getTeamLinkHref(team, 'shared'),
                      active: getTeamLinkHref(team, 'shared') === pathname,
                      labelClick: () => push(getTeamLinkHref(team, 'shared')),
                      id: 'sidebar__button__shared',
                    },
                    {
                      label: translate(lngKeys.GeneralImport),
                      icon: mdiImport,
                      variant: 'subtle',
                      labelClick: () => openSettingsTab('api'),
                      id: 'sidebar__button__import',
                    },
                  ]}
                >
                  {isEligibleForDiscount(team) ? (
                    <SidebarButton
                      variant='subtle'
                      icon={
                        <NotifyIcon text='!' size={16} path={mdiGiftOutline} />
                      }
                      id='sidebar__button__promo'
                      label={translate(lngKeys.SidebarNewUserDiscount)}
                      labelClick={() =>
                        openModal(<DiscountModal />, {
                          showCloseIcon: true,
                          width: 'large',
                        })
                      }
                    />
                  ) : null}
                </SidebarButtonList>
              )
            }
            users={users}
            notificationState={notificationState}
            getMoreNotifications={getMoreNotifications}
            notificationClick={notificationClick}
          />
        }
        pageBody={
          showSearchScreen ? (
            <CloudGlobalSearch team={team} />
          ) : (
            <ContentLayout
              {...content}
              topbar={{
                ...topbar,
                tree: topbarTree,
                navigation: {
                  goBack,
                  goForward,
                },
              }}
            >
              {children}
            </ContentLayout>
          )
        }
      />
      <AnnouncementAlert />
    </>
  )
}

export default Application

function mapSpaces(
  push: (url: string) => void,
  teams: SerializedTeam[],
  invites: SerializedTeamInvite[],
  counts: Record<string, number>,
  team?: SerializedTeam
) {
  const rows: SidebarSpace[] = []
  teams.forEach((globalTeam) => {
    const href = `${process.env.BOOST_HUB_BASE_URL}${getTeamURL(globalTeam)}`
    rows.push({
      label: globalTeam.name,
      active: team?.id === globalTeam.id,
      notificationCount: counts[globalTeam.id],
      icon:
        globalTeam.icon != null
          ? buildIconUrl(globalTeam.icon.location)
          : undefined,
      linkProps: {
        href,
        onClick: (event: React.MouseEvent) => {
          event.preventDefault()
          push(href)
        },
      },
    })
  })

  invites.forEach((invite) => {
    const query = { t: invite.team.id, i: getHexFromUUID(invite.id) }
    const href = `${process.env.BOOST_HUB_BASE_URL}/invite?${stringify(query)}`
    rows.push({
      label: `${invite.team.name} (invited)`,
      icon:
        invite.team.icon != null
          ? buildIconUrl(invite.team.icon.location)
          : undefined,
      linkProps: {
        href,
        onClick: (event: React.MouseEvent) => {
          event.preventDefault()
          push(`/invite?${stringify(query)}`)
        },
      },
    })
  })

  return rows
}

function buildSpacesBottomRows(push: (url: string) => void, t: TFunction) {
  return [
    {
      label: t(lngKeys.CreateNewSpace),
      icon: mdiPlusCircleOutline,
      linkProps: {
        href: `${process.env.BOOST_HUB_BASE_URL}/cooperate`,
        onClick: (event: React.MouseEvent) => {
          event.preventDefault()
          push(`/cooperate`)
        },
      },
    },
    {
      label: t(lngKeys.DownloadDesktopApp),
      icon: mdiDownload,
      linkProps: {
        href: 'https://github.com/BoostIO/BoostNote.next/releases/latest',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    },
    {
      label: t(lngKeys.LogOut),
      icon: mdiLogoutVariant,
      linkProps: {
        href: '/api/oauth/signout',
        onClick: (event: React.MouseEvent) => {
          event.preventDefault()
          if (usingElectron) {
            sendToHost('sign-out')
          } else {
            window.location.href = `${process.env.BOOST_HUB_BASE_URL}/api/oauth/signout`
          }
        },
      },
    },
  ]
}

function isCodeMirrorTextAreaEvent(event: KeyboardEvent) {
  const target = event.target as HTMLTextAreaElement
  if (target == null || target.tagName.toLowerCase() !== 'textarea') {
    return false
  }
  const classNameOfParentParentElement =
    target.parentElement?.parentElement?.className
  if (classNameOfParentParentElement == null) {
    return false
  }
  if (!/CodeMirror/.test(classNameOfParentParentElement)) {
    return false
  }

  return true
}
