# Testing Guide - SNPITC Email & Payment Integration

## Overview

This document covers the comprehensive testing strategy for the SNPITC Email and Payment Integration system, including unit tests, integration tests, and end-to-end tests.

## Test Structure

```
tests/
├── api/                    # API endpoint unit tests
│   ├── admin/
│   │   ├── email/
│   │   │   └── accounts.test.ts
│   │   └── payments/
│   │       ├── catalog.test.ts
│   │       └── transactions.test.ts
├── components/             # Component unit tests
├── integration/            # Integration tests
│   └── email-payment-integration.test.ts
└── e2e/                   # End-to-end tests
    └── admin-panel.test.ts
```

## Test Types

### 1. Unit Tests

**Purpose**: Test individual functions, components, and API endpoints in isolation.

**Coverage**:
- API endpoint logic
- Component rendering and behavior
- Utility functions
- Database operations (mocked)

**Technologies**:
- Jest
- React Testing Library
- Node Mocks HTTP

**Running Unit Tests**:
```bash
# Run all unit tests
npm run test:unit

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### 2. Integration Tests

**Purpose**: Test the interaction between different system components.

**Coverage**:
- Database schema and relations
- Email account lifecycle
- Payment processing workflow
- Audit logging
- System alerts

**Prerequisites**:
- Test database configured (`TEST_DATABASE_URL`)
- Database migrations applied

**Running Integration Tests**:
```bash
# Run integration tests
npm run test:integration

# Setup test database first
export TEST_DATABASE_URL="postgresql://user:password@localhost:5432/test_db"
npx prisma migrate deploy
npm run test:integration
```

### 3. End-to-End Tests

**Purpose**: Test complete user workflows in a real browser environment.

**Coverage**:
- Admin panel navigation
- Email account management UI
- Payment catalog management UI
- Transaction monitoring
- Responsive design
- Accessibility

**Technologies**:
- Playwright
- Multiple browsers (Chrome, Firefox, Safari)
- Mobile and desktop viewports

**Running E2E Tests**:
```bash
# Install browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run specific browser
npx playwright test --project=chromium
```

## Test Configuration

### Jest Configuration

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/components/ui/**',
  ],
  testMatch: [
    '<rootDir>/tests/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  testTimeout: 30000,
}

module.exports = createJestConfig(customJestConfig)
```

### Playwright Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
})
```

## Test Environment Setup

### Environment Variables

```bash
# Required for all tests
NODE_ENV=test
NEXTAUTH_SECRET=test-secret
NEXTAUTH_URL=http://localhost:3000

# Required for integration tests
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/test_db

# Optional for E2E tests in CI
RUN_E2E_TESTS=true
PLAYWRIGHT_BASE_URL=http://localhost:3000
```

### Database Setup

1. **Create Test Database**:
```sql
CREATE DATABASE snpitc_test;
CREATE USER test_user WITH PASSWORD 'test_password';
GRANT ALL PRIVILEGES ON DATABASE snpitc_test TO test_user;
```

2. **Apply Migrations**:
```bash
export TEST_DATABASE_URL="postgresql://test_user:test_password@localhost:5432/snpitc_test"
npx prisma migrate deploy
npx prisma db seed
```

## Running All Tests

### Comprehensive Test Suite

```bash
# Run all tests with reporting
npm run test:all
```

This command runs:
1. Unit tests with coverage
2. Integration tests (if database configured)
3. E2E tests (if enabled)
4. Type checking
5. Linting

### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npx prisma migrate deploy
        env:
          TEST_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/postgres
      
      - run: npm run test:all
        env:
          TEST_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/postgres
          RUN_E2E_TESTS: true
```

## Test Data Management

### Test Fixtures

```typescript
// tests/fixtures/email-accounts.ts
export const testEmailAccounts = [
  {
    email: 'student1@test.com',
    password: 'hashed-password',
    type: 'STUDENT',
    displayName: 'Test Student 1',
    isActive: true,
    quota: 1024 * 1024 * 1024
  }
]

// tests/fixtures/payment-items.ts
export const testPaymentItems = [
  {
    name: 'Test Semester Fee',
    feeType: 'SEMESTER',
    amount: 50000,
    currency: 'INR',
    category: 'Academic',
    isActive: true
  }
]
```

### Database Cleanup

```typescript
// tests/helpers/cleanup.ts
export async function cleanupTestData() {
  await prisma.payment.deleteMany({
    where: { student: { email: { contains: 'test-' } } }
  })
  await prisma.emailAccount.deleteMany({
    where: { email: { contains: 'test-' } }
  })
  await prisma.paymentCatalogItem.deleteMany({
    where: { name: { contains: 'Test ' } }
  })
}
```

## Mocking Strategies

### API Mocking

```typescript
// jest.setup.js
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      // ... other methods
    },
    // ... other models
  },
}))
```

### Authentication Mocking

```typescript
// tests/helpers/auth.ts
export const mockAdminSession = {
  user: {
    id: 'admin-id',
    email: 'admin@test.com',
    role: 'ADMIN'
  }
}

jest.mock('next-auth', () => ({
  getServerSession: jest.fn().mockResolvedValue(mockAdminSession)
}))
```

## Test Coverage

### Coverage Requirements

- **Unit Tests**: Minimum 80% code coverage
- **API Endpoints**: 100% coverage for critical paths
- **Components**: 90% coverage for admin components
- **Integration**: All major workflows covered

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/lcov-report/index.html
```

### Coverage Configuration

```javascript
// jest.config.js
collectCoverageFrom: [
  'src/**/*.{js,jsx,ts,tsx}',
  '!src/**/*.d.ts',
  '!src/app/**/layout.tsx',
  '!src/app/**/loading.tsx',
  '!src/components/ui/**',
],
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

## Performance Testing

### Load Testing

```typescript
// tests/performance/api-load.test.ts
describe('API Performance', () => {
  it('should handle concurrent email account requests', async () => {
    const requests = Array(100).fill(null).map(() =>
      fetch('/api/admin/email/accounts')
    )
    
    const responses = await Promise.all(requests)
    const avgResponseTime = responses.reduce((sum, r) => 
      sum + r.headers.get('x-response-time'), 0) / responses.length
    
    expect(avgResponseTime).toBeLessThan(500) // 500ms
  })
})
```

## Security Testing

### Authentication Tests

```typescript
describe('Security', () => {
  it('should deny access without authentication', async () => {
    mockGetServerSession.mockResolvedValue(null)
    
    const response = await GET(mockRequest)
    expect(response.status).toBe(403)
  })
  
  it('should deny access for non-admin users', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { role: 'USER' }
    })
    
    const response = await GET(mockRequest)
    expect(response.status).toBe(403)
  })
})
```

## Debugging Tests

### Debug Configuration

```json
// .vscode/launch.json
{
  "configurations": [
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Test Debugging Tips

1. **Use `test.only`** to run specific tests
2. **Add `console.log`** statements for debugging
3. **Use `--verbose`** flag for detailed output
4. **Check test artifacts** in `test-results/` directory

## Best Practices

### Writing Tests

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **Use Descriptive Names**: Test names should explain what they test
3. **Keep Tests Independent**: Each test should be able to run in isolation
4. **Mock External Dependencies**: Don't rely on external services
5. **Test Edge Cases**: Include error conditions and boundary values

### Test Organization

1. **Group Related Tests**: Use `describe` blocks effectively
2. **Use Setup/Teardown**: Leverage `beforeEach`/`afterEach` for common setup
3. **Share Test Utilities**: Create reusable helper functions
4. **Maintain Test Data**: Keep test fixtures up to date

### Performance

1. **Parallel Execution**: Run tests in parallel when possible
2. **Selective Testing**: Use test patterns to run specific suites
3. **Efficient Mocking**: Mock heavy operations and external calls
4. **Database Optimization**: Use transactions for test isolation

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Ensure `TEST_DATABASE_URL` is set
   - Check database is running and accessible
   - Verify migrations are applied

2. **Playwright Browser Issues**:
   - Run `npx playwright install`
   - Check system dependencies
   - Verify base URL is accessible

3. **Mock Issues**:
   - Clear mocks between tests
   - Verify mock implementations
   - Check import paths

### Getting Help

1. Check test logs in `test-results/`
2. Review coverage reports for missing tests
3. Use debug mode for step-by-step execution
4. Consult framework documentation

## Continuous Improvement

### Metrics to Track

- Test execution time
- Coverage percentage
- Flaky test rate
- Test maintenance effort

### Regular Tasks

- Review and update test data
- Refactor slow or flaky tests
- Add tests for new features
- Update documentation
