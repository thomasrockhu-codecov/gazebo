import { render, screen } from 'custom-testing-library'
import userEvent from '@testing-library/user-event'

import UserOnboardingModal from './UserOnboardingModal'

describe('UserOnboardingModal', () => {
  const currentUser = {
    email: 'user@gmail.com',
  }

  function setup() {
    render(<UserOnboardingModal currentUser={currentUser} />)
  }

  function getCheckbox(name) {
    return screen.getByRole('checkbox', { name })
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('has the form with the basic questions', () => {
      expect(
        screen.getByRole('heading', {
          name: /what type of projects brings you here\?/i,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', {
          name: /What is your goal we can help with\?/i,
        })
      ).toBeInTheDocument()
    })

    it('has the next button disabled', () => {
      const button = screen.getByRole('button', {
        name: /next/i,
      })
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
    })
  })

  describe('when the user picks a type of projects', () => {
    beforeEach(() => {
      setup()
      getCheckbox(/educational/i).click()
    })

    it('selects the checkbox', () => {
      expect(getCheckbox(/educational/i)).toBeChecked()
    })

    it('still has the next button disabled', () => {
      const button = screen.getByRole('button', {
        name: /next/i,
      })
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
    })

    describe('when the user clicks again', () => {
      beforeEach(() => {
        getCheckbox(/educational/i).click()
      })

      it('unselects the checkbox', () => {
        expect(getCheckbox(/educational/i)).not.toBeChecked()
      })
    })
  })

  describe('when the user picks a goal', () => {
    beforeEach(() => {
      setup()
      getCheckbox(/just starting to write tests/i).click()
    })

    it('selects the checkbox', () => {
      expect(getCheckbox(/just starting to write tests/i)).toBeChecked()
    })

    it('still has the next button disabled', () => {
      const button = screen.getByRole('button', {
        name: /next/i,
      })
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
    })
  })

  describe('when the user selects a goal and type of projects', () => {
    beforeEach(() => {
      setup()
      getCheckbox(/educational/i).click()
      getCheckbox(/just starting to write tests/i).click()
    })

    it('has the next button enabled', () => {
      expect(
        screen.getByRole('button', {
          name: /next/i,
        })
      ).not.toBeDisabled()
    })

    describe('when the user clicks next', () => {
      beforeEach(() => {
        screen
          .getByRole('button', {
            name: /next/i,
          })
          .click()
      })

      it('doesnt render the basic questions anymore', () => {
        expect(
          screen.queryByRole('heading', {
            name: /what type of projects brings you here\?/i,
          })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('heading', {
            name: /What is your goal we can help with\?/i,
          })
        ).not.toBeInTheDocument()
      })

      it('renders an input for the email', () => {
        expect(
          screen.getByRole('textbox', {
            name: /personal email/i,
          })
        ).toBeInTheDocument()
      })
    })
  })

  describe('when the user picked "Your organization" type of project', () => {
    beforeEach(() => {
      setup()
      getCheckbox(/your organization/i).click()
      getCheckbox(/just starting to write tests/i).click()
      screen
        .getByRole('button', {
          name: /next/i,
        })
        .click()
    })

    it('renders a field to enter business email', () => {
      expect(
        screen.getByRole('textbox', {
          name: /work email/i,
        })
      ).toBeInTheDocument()
    })
  })

  describe('when the user types in the other field', () => {
    beforeEach(() => {
      setup()
      userEvent.type(
        screen.getByRole('textbox', {
          name: /other/i,
        }),
        'experimenting'
      )
    })

    it('selects the checkbox "Other"', () => {
      expect(getCheckbox(/other/i)).toBeChecked()
    })
  })
})