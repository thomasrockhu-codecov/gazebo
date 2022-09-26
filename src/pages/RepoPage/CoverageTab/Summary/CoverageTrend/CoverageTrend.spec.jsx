import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import CoverageTrend from './CoverageTrend'

import { useBranchSelector, useRepoCoverageTimeseries } from '../../hooks'

jest.mock('../../hooks')
jest.mock('../TrendDropdown', () => () => 'TrendDropdown')

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={[`/gh/caleb/mighty-nein`]}>
    <Route path="/:provider/:owner/:repo">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const renderCoverageTab = () => render(<CoverageTrend />, { wrapper })
describe('CoverageTrend', () => {
  function setup({ coverageData }) {
    useRepoCoverageTimeseries.mockReturnValue(coverageData)
    useBranchSelector.mockReturnValue({
      selection: { name: 'bells-hells' },
    })
  }

  describe('when fetching', () => {
    beforeEach(() =>
      setup({
        coverageData: {
          isFetching: true,
        },
      })
    )
    it('renders a spinner', () => {
      renderCoverageTab()
      expect(screen.getByTestId('spinner')).toBeInTheDocument()
    })
  })

  describe('coverage exists', () => {
    beforeEach(() =>
      setup({
        coverageData: {
          data: {
            coverage: [{}],
            coverageChange: 40,
          },
        },
      })
    )
    it('rendered the change %', () => {
      renderCoverageTab()
      expect(screen.getByText(/40.00%+/)).toBeInTheDocument()
    })
  })

  describe('coverage is empty', () => {
    beforeEach(() =>
      setup({
        coverageData: {
          data: {
            coverage: [],
          },
        },
      })
    )
    it('does messages if there is no reports', () => {
      renderCoverageTab()
      expect(
        screen.getByText(/No coverage reports found in this timespan./)
      ).toBeInTheDocument()
    })
  })
})