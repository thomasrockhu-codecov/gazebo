import PropTypes from 'prop-types'

import { usePrefetchCommitFileEntry } from './hooks/usePrefetchCommitFileEntry'

import { displayTypeParameter } from '../../constants'
import FileEntry from '../BaseEntries/FileEntry'

function CommitFileEntry({
  commitSha,
  filePath,
  isCriticalFile,
  name,
  path,
  displayType,
}) {
  const { runPrefetch } = usePrefetchCommitFileEntry({
    path: filePath,
  })

  return (
    <FileEntry
      linkRef={commitSha}
      filePath={filePath}
      isCriticalFile={isCriticalFile}
      name={name}
      displayType={displayType}
      path={path}
      runPrefetch={runPrefetch}
    />
  )
}

CommitFileEntry.propTypes = {
  commitSha: PropTypes.string.isRequired,
  filePath: PropTypes.string.isRequired,
  isCriticalFile: PropTypes.bool,
  name: PropTypes.string.isRequired,
  displayType: PropTypes.oneOf(Object.values(displayTypeParameter)),
  path: PropTypes.string,
}

export default CommitFileEntry