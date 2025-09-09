/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
       */
      dataCy(value: string): Chainable<JQuery<HTMLElement>>
      
      /**
       * Custom command to fill payment form
       * @example cy.fillPaymentForm({ amount: 1000, email: 'test@example.com' })
       */
      fillPaymentForm(data: {
        amount?: number;
        currency?: string;
        source?: string;
        email?: string;
      }): Chainable<void>
      
      /**
       * Custom command to wait for API response
       * @example cy.waitForApiResponse('POST', '/api/charge')
       */
      waitForApiResponse(method: string, url: string): Chainable<void>
    }
  }
}

Cypress.Commands.add('dataCy', (value) => {
  return cy.get(`[data-cy=${value}]`)
})

Cypress.Commands.add('fillPaymentForm', (data) => {
  if (data.amount) {
    cy.get('input[name="amount"]').clear().type(data.amount.toString())
  }
  if (data.currency) {
    cy.get('select[name="currency"]').select(data.currency)
  }
  if (data.source) {
    cy.get('input[name="source"]').clear().type(data.source)
  }
  if (data.email) {
    cy.get('input[name="email"]').clear().type(data.email)
  }
})

Cypress.Commands.add('waitForApiResponse', (method, url) => {
  cy.intercept(method, url).as('apiResponse')
  cy.wait('@apiResponse')
})
