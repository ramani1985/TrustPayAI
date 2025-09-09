describe('Payment Flow', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display payment form', () => {
    cy.contains('Process Payment').should('be.visible')
    cy.get('input[name="amount"]').should('be.visible')
    cy.get('select[name="currency"]').should('be.visible')
    cy.get('input[name="source"]').should('be.visible')
    cy.get('input[name="email"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
  })

  it('should show default values', () => {
    cy.get('input[name="amount"]').should('have.value', '1000')
    cy.get('select[name="currency"]').should('have.value', 'USD')
    cy.get('input[name="source"]').should('have.value', 'tok_test_visa')
    cy.get('input[name="email"]').should('have.value', 'donor@example.com')
  })

  it('should show amount in dollars', () => {
    cy.get('input[name="amount"]').clear().type('2500')
    cy.contains('$25.00 USD').should('be.visible')
  })

  it('should validate required fields', () => {
    cy.get('input[name="amount"]').clear()
    cy.get('input[name="source"]').clear()
    cy.get('input[name="email"]').clear()
    
    cy.get('button[type="submit"]').click()
    
    cy.contains('Amount must be at least 1 cent').should('be.visible')
    cy.contains('Source is required').should('be.visible')
    cy.contains('Invalid email format').should('be.visible')
  })

  it('should validate amount range', () => {
    // Test minimum amount
    cy.get('input[name="amount"]').clear().type('0')
    cy.get('button[type="submit"]').click()
    cy.contains('Amount must be at least 1 cent').should('be.visible')
    
    // Test maximum amount
    cy.get('input[name="amount"]').clear().type('10000001')
    cy.get('button[type="submit"]').click()
    cy.contains('Amount cannot exceed $100,000').should('be.visible')
  })

  it('should validate email format', () => {
    cy.get('input[name="email"]').clear().type('invalid-email')
    cy.get('button[type="submit"]').click()
    cy.contains('Invalid email format').should('be.visible')
  })

  it('should process a successful payment', () => {
    // Mock successful API response
    cy.intercept('POST', '/api/charge', {
      statusCode: 200,
      body: {
        transactionId: 'txn_test_123',
        provider: 'stripe',
        status: 'success',
        riskScore: 0.2,
        explanation: 'Low risk transaction approved'
      }
    }).as('processCharge')

    cy.fillPaymentForm({
      amount: 1000,
      currency: 'USD',
      source: 'tok_test_visa',
      email: 'test@example.com'
    })

    cy.get('button[type="submit"]').click()
    cy.wait('@processCharge')

    // Check for success indicators
    cy.contains('Payment Result').should('be.visible')
    cy.contains('txn_test_123').should('be.visible')
    cy.contains('stripe').should('be.visible')
    cy.contains('success').should('be.visible')
    cy.contains('20.0%').should('be.visible')
    cy.contains('Low risk transaction approved').should('be.visible')
  })

  it('should handle blocked high-risk payment', () => {
    // Mock blocked API response
    cy.intercept('POST', '/api/charge', {
      statusCode: 200,
      body: {
        transactionId: 'txn_test_456',
        provider: 'none',
        status: 'blocked',
        riskScore: 0.8,
        explanation: 'High risk transaction blocked'
      }
    }).as('processCharge')

    cy.fillPaymentForm({
      amount: 10000,
      currency: 'USD',
      source: 'tok_test',
      email: 'test@example.ru'
    })

    cy.get('button[type="submit"]').click()
    cy.wait('@processCharge')

    // Check for blocked indicators
    cy.contains('Payment Result').should('be.visible')
    cy.contains('blocked').should('be.visible')
    cy.contains('80.0%').should('be.visible')
    cy.contains('High risk transaction blocked').should('be.visible')
  })

  it('should handle failed payment', () => {
    // Mock failed API response
    cy.intercept('POST', '/api/charge', {
      statusCode: 200,
      body: {
        transactionId: 'txn_test_789',
        provider: 'stripe',
        status: 'failed',
        riskScore: 0.3,
        explanation: 'Payment processing failed'
      }
    }).as('processCharge')

    cy.fillPaymentForm({
      amount: 1000,
      currency: 'USD',
      source: 'tok_invalid',
      email: 'test@example.com'
    })

    cy.get('button[type="submit"]').click()
    cy.wait('@processCharge')

    // Check for failed indicators
    cy.contains('Payment Result').should('be.visible')
    cy.contains('failed').should('be.visible')
    cy.contains('Payment processing failed').should('be.visible')
  })

  it('should handle API errors', () => {
    // Mock API error
    cy.intercept('POST', '/api/charge', {
      statusCode: 500,
      body: { error: 'Internal server error' }
    }).as('processCharge')

    cy.fillPaymentForm({
      amount: 1000,
      currency: 'USD',
      source: 'tok_test',
      email: 'test@example.com'
    })

    cy.get('button[type="submit"]').click()
    cy.wait('@processCharge')

    // Check for error message
    cy.contains('Internal server error').should('be.visible')
  })

  it('should clear form when clear button is clicked', () => {
    cy.get('input[name="amount"]').clear().type('5000')
    cy.get('input[name="email"]').clear().type('new@example.com')
    
    cy.get('button').contains('Clear').click()
    
    cy.get('input[name="amount"]').should('have.value', '1000')
    cy.get('input[name="email"]').should('have.value', 'donor@example.com')
  })

  it('should show loading state during payment processing', () => {
    // Mock delayed API response
    cy.intercept('POST', '/api/charge', {
      statusCode: 200,
      body: {
        transactionId: 'txn_test_123',
        provider: 'stripe',
        status: 'success',
        riskScore: 0.2,
        explanation: 'Low risk transaction approved'
      },
      delay: 2000
    }).as('processCharge')

    cy.fillPaymentForm({
      amount: 1000,
      currency: 'USD',
      source: 'tok_test',
      email: 'test@example.com'
    })

    cy.get('button[type="submit"]').click()
    
    // Check for loading state
    cy.contains('Processing...').should('be.visible')
    cy.get('button[type="submit"]').should('be.disabled')
    
    cy.wait('@processCharge')
    
    // Check that loading state is gone
    cy.contains('Processing...').should('not.exist')
    cy.get('button[type="submit"]').should('not.be.disabled')
  })
})
