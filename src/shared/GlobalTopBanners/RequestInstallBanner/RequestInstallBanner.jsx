import { useParams, useRouteMatch } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import { providerToName } from 'shared/utils'
import Icon from 'ui/Icon'
import TopBanner from 'ui/TopBanner'

function RequestInstallBanner() {
  const { provider } = useParams()
  const { params } = useLocationParams()
  const ownerMatch = useRouteMatch('/:provider/:owner')
  const { setup_action: setupAction } = params

  if (
    providerToName(provider) !== 'Github' ||
    !ownerMatch?.isExact ||
    setupAction !== 'request'
  )
    return null

  return (
    <TopBanner localStorageKey="request-install-banner">
      <TopBanner.Start>
        <p className="flex items-center gap-1 text-xs">
          <span className="flex items-center gap-1 font-semibold">
            <Icon name="information-circle" />
            Installation request sent.
          </span>
          Since you&apos;re a member of the requested organization, you need the
          owner to approve and install the app.
        </p>
      </TopBanner.Start>
      <TopBanner.End>
        <TopBanner.DismissButton>
          <Icon size="sm" variant="solid" name="x" />
        </TopBanner.DismissButton>
      </TopBanner.End>
    </TopBanner>
  )
}

export default RequestInstallBanner