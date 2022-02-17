import { useState, useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { useParams } from 'react-router'

import { useCommits } from 'services/commits'
import { useBranches } from 'services/branches'
import { useRepo } from 'services/repo'

import Checkbox from 'ui/Checkbox'
import Select from 'ui/Select'
import Icon from 'ui/Icon'
import Button from 'ui/Button'

import CommitsTable from './CommitsTable'
import { useSetCrumbs } from '../context'

function CommitsTab() {
  const setCrumbs = useSetCrumbs()
  const { provider, owner, repo } = useParams()
  const { data: branches } = useBranches({ provider, owner, repo })
  const { data: repoData } = useRepo({ provider, owner, repo })
  const branchesNames = branches?.map((branch) => branch.name) || []

  const [branchName, setBranch] = useState(repoData?.repository?.defaultBranch)
  const [hideFailedCI, setHideFailedCI] = useState(false)
  const {
    data: { commits },
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCommits({
    provider,
    owner,
    repo,
    filters: {
      hideFailedCI,
      branchName,
    },
  })

  useLayoutEffect(() => {
    setCrumbs([
      {
        pageName: '',
        readOnly: true,
        children: (
          <span className="flex items-center gap-1">
            <Icon name="branch" variant="developer" size="sm" />
            {branchName}
          </span>
        ),
      },
    ])
  }, [branchName, setCrumbs])

  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="flex gap-2 justify-between px-2 sm:px-0">
        <div className="flex gap-1 flex-col">
          <h2 className="font-semibold flex gap-1 flex-initial">
            <span>
              <Icon name="branch" variant="developer" size="sm" />
            </span>
            Branch Context
          </h2>
          <div>
            <Select
              className="bg-ds-gray-primary"
              items={branchesNames}
              onChange={(branch) => setBranch(branch)}
              value={branchName}
            />
          </div>
        </div>

        <Checkbox
          label="Hide commits with failed CI"
          name="filter commits"
          onChange={(e) => setHideFailedCI(e.target.checked)}
          value={hideFailedCI}
        />
      </div>
      <CommitsTable commits={commits} />
      {hasNextPage && (
        <div className="flex-1 mt-4 flex justify-center">
          <Button
            hook="load-more"
            isLoading={isFetchingNextPage}
            onClick={fetchNextPage}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}
CommitsTab.propTypes = {
  branchName: PropTypes.string,
}

export default CommitsTab
