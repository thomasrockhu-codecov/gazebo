import { render } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import Header from './Header'

jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')

describe('Header', () => {
  function setup(props = {}) {
    render(
      <MemoryRouter initialEntries={['/gh']}>
        <Route path="/:provider">
          <Header {...props} />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({
        currentUsername: 'lewis',
      })
    })
  })
})
