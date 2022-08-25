import { useQuery, useQueryClient } from '@tanstack/react-query'
import map from 'lodash/map'

import Api from 'shared/api'
import { mapEdges } from 'shared/utils/graphql'
const comparisonFragment = `
  fragment ComparisonFragment on Commit {
    compareWithParent {
      state
      patchTotals {
        coverage
      }
      impactedFiles {
        patchCoverage {
          coverage
        }
        headName
        baseCoverage {
          coverage
        }
        headCoverage {
          coverage
        }
      }
    }
  }
`

export function useCommitYaml({ provider, owner, repo, commitid }) {
  const query = `
    query CommitYaml($owner: String!, $repo: String!, $commitid: String!) {
      owner(username: $owner) {
        repository(name: $repo) {
          commit(id: $commitid) {
            commitid
            yaml
          }
        }
      }
    }
  `

  return useQuery(['commit-yaml', provider, owner, repo, commitid], () => {
    return Api.graphql({
      provider,
      query,
      variables: {
        owner,
        repo,
        commitid,
      },
    }).then((res) => {
      return res?.data?.owner?.repository?.commit?.yaml
    })
  })
}

function useCompareTotals({ provider, owner, repo, commitid, opts = {} }) {
  const query = `
    query CompareTotals($owner: String!, $repo: String!, $commitid: String!) {
      owner(username: $owner) {
        repository(name: $repo) {
          commit(id: $commitid) {
            ...ComparisonFragment
          }
        }
      }
    }
    ${comparisonFragment}
  `

  return useQuery(
    ['impactedFiles', provider, owner, repo, commitid],
    () => {
      return Api.graphql({
        provider,
        query,
        variables: {
          owner,
          repo,
          commitid,
        },
      }).then(
        (res) => res?.data?.owner?.repository?.commit?.compareWithParent ?? {}
      )
    },
    {
      ...opts,
    }
  )
}
/*
TODO This/useCommit was not implemented correctly and needs a refactor, leaving for the moment.
- useCommit is not reusable and also does not let you fetch commit data without polling files which is another call
- Refer to the following PR for the change where props of the component are replaced with this hook and for such cases
 we need to address the issue above and refactor the hook for better usage. https://github.com/codecov/gazebo/pull/1248
*/
export function useCommit({
  provider,
  owner,
  repo,
  commitid,
  refetchInterval = 2000,
}) {
  const query = `
    query Commit($owner: String!, $repo: String!, $commitid: String!) {
        owner(username: $owner) {
          repository(name: $repo) {
            commit(id: $commitid) {
              totals {
                coverage # Absolute coverage of the commit
              }
              state
              commitid
              pullId
              branchName
              createdAt
              author {
                username
              }
              uploads {
                edges {
                  node {
                    state
                    provider
                    createdAt
                    updatedAt
                    flags
                    jobCode
                    downloadUrl
                    ciUrl
                    uploadType
                    buildCode
                    errors {
                      edges {
                        node {
                          errorCode
                        }
                      }
                    }
                  }
                }
              }
              message
              ciPassed
              parent {
                commitid # commitid of the parent, used for the comparison

                totals {
                  coverage # coverage of the parent
                }
              }
              ...ComparisonFragment
            }
          }
        }
      }
      ${comparisonFragment}
    `

  function processUploads(uploads) {
    const edgelessUploads = mapEdges(uploads)
    return map(edgelessUploads, (upload) => ({
      ...upload,
      errors: mapEdges(upload?.errors),
    }))
  }

  const tempKey = ['commit', provider, owner, repo, commitid]

  const commitQuery = useQuery(tempKey, () => {
    return Api.graphql({
      provider,
      query,
      variables: {
        provider,
        owner,
        repo,
        commitid,
      },
    }).then((res) => {
      const commit = res?.data?.owner?.repository?.commit
      if (!commit) return {}
      return {
        commit: {
          ...commit,
          uploads: processUploads(commit?.uploads),
        },
      }
    })
  })

  const queryClient = useQueryClient()

  const state = commitQuery?.data?.commit?.compareWithParent?.state
  const shouldPoll = state === 'pending'

  useCompareTotals({
    provider,
    owner,
    repo,
    commitid,
    opts: {
      refetchInterval,
      enabled: shouldPoll,
      onSuccess: (data) => {
        const impactedFileData = {
          ...commitQuery?.data,
          commit: {
            ...commitQuery?.data.commit,
            compareWithParent: data,
          },
        }
        queryClient.setQueryData(tempKey, impactedFileData)
      },
    },
  })

  return commitQuery
}
