describe('Transactions Page', () => {
  beforeEach(() => {
    cy.visit('/transactions')
  })

  it('should display transactions page', () => {
    cy.contains('Transaction History').should('be.visible')
    cy.contains('View all processed payments and their risk assessments').should('be.visible')
  })

  it('should show transaction statistics', () => {
    // Mock transactions API response
    cy.intercept('GET', '/api/transactions*', {
      statusCode: 200,
      body: {
        transactions: [
          {
            id: 'txn_1',
            amount: 1000,
            currency: 'USD',
            source: 'tok_test_1',
            email: 'test1@example.com',
            provider: 'stripe',
            status: 'success',
            riskScore: 0.2,
            explanation: 'Low risk transaction',
            timestamp: '2023-01-01T00:00:00.000Z'
          },
          {
            id: 'txn_2',
            amount: 2000,
            currency: 'USD',
            source: 'tok_test_2',
            email: 'test2@example.com',
            provider: 'paypal',
            status: 'failed',
            riskScore: 0.8,
            explanation: 'High risk transaction',
            timestamp: '2023-01-01T01:00:00.000Z'
          },
          {
            id: 'txn_3',
            amount: 5000,
            currency: 'USD',
            source: 'tok_test_3',
            email: 'test3@example.com',
            provider: 'stripe',
            status: 'blocked',
            riskScore: 0.9,
            explanation: 'Blocked transaction',
            timestamp: '2023-01-01T02:00:00.000Z'
          }
        ],
        pagination: {
          limit: 20,
          offset: 0,
          total: 3,
          hasMore: false
        },
        stats: {
          total: 3,
          success: 1,
          failed: 1,
          blocked: 1,
          byProvider: {
            stripe: 2,
            paypal: 1
          }
        }
      }
    }).as('getTransactions')

    cy.wait('@getTransactions')

    // Check statistics cards
    cy.contains('Total Transactions').should('be.visible')
    cy.contains('3').should('be.visible')
    cy.contains('Successful').should('be.visible')
    cy.contains('Failed').should('be.visible')
    cy.contains('Blocked').should('be.visible')
  })

  it('should display transaction list', () => {
    // Mock transactions API response
    cy.intercept('GET', '/api/transactions*', {
      statusCode: 200,
      body: {
        transactions: [
          {
            id: 'txn_1',
            amount: 1000,
            currency: 'USD',
            source: 'tok_test_1',
            email: 'test1@example.com',
            provider: 'stripe',
            status: 'success',
            riskScore: 0.2,
            explanation: 'Low risk transaction',
            timestamp: '2023-01-01T00:00:00.000Z'
          }
        ],
        pagination: {
          limit: 20,
          offset: 0,
          total: 1,
          hasMore: false
        },
        stats: {
          total: 1,
          success: 1,
          failed: 0,
          blocked: 0,
          byProvider: {
            stripe: 1,
            paypal: 0
          }
        }
      }
    }).as('getTransactions')

    cy.wait('@getTransactions')

    // Check transaction details
    cy.contains('$10.00 USD').should('be.visible')
    cy.contains('success').should('be.visible')
    cy.contains('stripe').should('be.visible')
    cy.contains('test1@example.com').should('be.visible')
    cy.contains('20.0%').should('be.visible')
    cy.contains('Low risk transaction').should('be.visible')
  })

  it('should show different status indicators', () => {
    // Mock transactions with different statuses
    cy.intercept('GET', '/api/transactions*', {
      statusCode: 200,
      body: {
        transactions: [
          {
            id: 'txn_success',
            amount: 1000,
            currency: 'USD',
            source: 'tok_success',
            email: 'success@example.com',
            provider: 'stripe',
            status: 'success',
            riskScore: 0.2,
            explanation: 'Success transaction',
            timestamp: '2023-01-01T00:00:00.000Z'
          },
          {
            id: 'txn_failed',
            amount: 2000,
            currency: 'USD',
            source: 'tok_failed',
            email: 'failed@example.com',
            provider: 'paypal',
            status: 'failed',
            riskScore: 0.8,
            explanation: 'Failed transaction',
            timestamp: '2023-01-01T01:00:00.000Z'
          },
          {
            id: 'txn_blocked',
            amount: 5000,
            currency: 'USD',
            source: 'tok_blocked',
            email: 'blocked@example.com',
            provider: 'stripe',
            status: 'blocked',
            riskScore: 0.9,
            explanation: 'Blocked transaction',
            timestamp: '2023-01-01T02:00:00.000Z'
          }
        ],
        pagination: {
          limit: 20,
          offset: 0,
          total: 3,
          hasMore: false
        },
        stats: {
          total: 3,
          success: 1,
          failed: 1,
          blocked: 1,
          byProvider: {
            stripe: 2,
            paypal: 1
          }
        }
      }
    }).as('getTransactions')

    cy.wait('@getTransactions')

    // Check status indicators
    cy.contains('success').should('be.visible')
    cy.contains('failed').should('be.visible')
    cy.contains('blocked').should('be.visible')
  })

  it('should show risk score with appropriate colors', () => {
    // Mock transactions with different risk scores
    cy.intercept('GET', '/api/transactions*', {
      statusCode: 200,
      body: {
        transactions: [
          {
            id: 'txn_low_risk',
            amount: 1000,
            currency: 'USD',
            source: 'tok_low',
            email: 'low@example.com',
            provider: 'stripe',
            status: 'success',
            riskScore: 0.2,
            explanation: 'Low risk transaction',
            timestamp: '2023-01-01T00:00:00.000Z'
          },
          {
            id: 'txn_high_risk',
            amount: 5000,
            currency: 'USD',
            source: 'tok_high',
            email: 'high@example.com',
            provider: 'stripe',
            status: 'blocked',
            riskScore: 0.9,
            explanation: 'High risk transaction',
            timestamp: '2023-01-01T01:00:00.000Z'
          }
        ],
        pagination: {
          limit: 20,
          offset: 0,
          total: 2,
          hasMore: false
        },
        stats: {
          total: 2,
          success: 1,
          failed: 0,
          blocked: 1,
          byProvider: {
            stripe: 2,
            paypal: 0
          }
        }
      }
    }).as('getTransactions')

    cy.wait('@getTransactions')

    // Check risk scores are displayed
    cy.contains('20.0%').should('be.visible')
    cy.contains('90.0%').should('be.visible')
  })

  it('should show empty state when no transactions', () => {
    // Mock empty transactions response
    cy.intercept('GET', '/api/transactions*', {
      statusCode: 200,
      body: {
        transactions: [],
        pagination: {
          limit: 20,
          offset: 0,
          total: 0,
          hasMore: false
        },
        stats: {
          total: 0,
          success: 0,
          failed: 0,
          blocked: 0,
          byProvider: {
            stripe: 0,
            paypal: 0
          }
        }
      }
    }).as('getTransactions')

    cy.wait('@getTransactions')

    // Check empty state
    cy.contains('No transactions').should('be.visible')
    cy.contains('Get started by processing your first payment').should('be.visible')
  })

  it('should handle API errors', () => {
    // Mock API error
    cy.intercept('GET', '/api/transactions*', {
      statusCode: 500,
      body: { error: 'Internal server error' }
    }).as('getTransactions')

    cy.wait('@getTransactions')

    // Check error message
    cy.contains('Internal server error').should('be.visible')
    cy.get('button').contains('Dismiss').should('be.visible')
  })

  it('should load more transactions when load more button is clicked', () => {
    // Mock initial transactions response
    cy.intercept('GET', '/api/transactions?limit=20&offset=0', {
      statusCode: 200,
      body: {
        transactions: [
          {
            id: 'txn_1',
            amount: 1000,
            currency: 'USD',
            source: 'tok_test_1',
            email: 'test1@example.com',
            provider: 'stripe',
            status: 'success',
            riskScore: 0.2,
            explanation: 'Low risk transaction',
            timestamp: '2023-01-01T00:00:00.000Z'
          }
        ],
        pagination: {
          limit: 20,
          offset: 0,
          total: 2,
          hasMore: true
        },
        stats: {
          total: 2,
          success: 1,
          failed: 0,
          blocked: 0,
          byProvider: {
            stripe: 1,
            paypal: 0
          }
        }
      }
    }).as('getInitialTransactions')

    // Mock load more transactions response
    cy.intercept('GET', '/api/transactions?limit=20&offset=1', {
      statusCode: 200,
      body: {
        transactions: [
          {
            id: 'txn_2',
            amount: 2000,
            currency: 'USD',
            source: 'tok_test_2',
            email: 'test2@example.com',
            provider: 'paypal',
            status: 'failed',
            riskScore: 0.8,
            explanation: 'High risk transaction',
            timestamp: '2023-01-01T01:00:00.000Z'
          }
        ],
        pagination: {
          limit: 20,
          offset: 1,
          total: 2,
          hasMore: false
        },
        stats: {
          total: 2,
          success: 1,
          failed: 1,
          blocked: 0,
          byProvider: {
            stripe: 1,
            paypal: 1
          }
        }
      }
    }).as('getMoreTransactions')

    cy.wait('@getInitialTransactions')

    // Check load more button is visible
    cy.get('button').contains('Load More').should('be.visible')

    // Click load more
    cy.get('button').contains('Load More').click()
    cy.wait('@getMoreTransactions')

    // Check that more transactions are loaded
    cy.contains('$20.00 USD').should('be.visible')
    cy.contains('test2@example.com').should('be.visible')
  })
})
