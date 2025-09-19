/**
 * End-to-End Tests for Admin Panel
 * Tests the complete admin panel functionality including email and payment management
 */

import { test, expect } from '@playwright/test'

// Skip E2E tests in CI unless explicitly enabled
const skipE2ETests = process.env.CI && !process.env.RUN_E2E_TESTS

test.describe('Admin Panel E2E Tests', () => {
  // Skip tests if not configured for E2E
  if (skipE2ETests) {
    test.skip('E2E tests require RUN_E2E_TESTS=true in CI environment', () => {})
    return
  }

  test.beforeEach(async ({ page }) => {
    // Mock authentication for testing
    await page.route('**/api/auth/**', async route => {
      if (route.request().url().includes('/session')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'test-admin-id',
              name: 'Test Admin',
              email: 'admin@test.com',
              role: 'ADMIN'
            }
          })
        })
      } else {
        await route.continue()
      }
    })

    // Mock API responses for testing
    await page.route('**/api/admin/**', async route => {
      const url = route.request().url()
      
      if (url.includes('/email/accounts')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            accounts: [
              {
                id: 'account-1',
                email: 'student1@test.com',
                displayName: 'Test Student 1',
                type: 'STUDENT',
                isActive: true,
                quota: 1000000000,
                createdAt: new Date().toISOString(),
                stats: {
                  emailsSent: 5,
                  emailsReceived: 10,
                  storageUsed: 50000000,
                  lastLogin: new Date().toISOString()
                }
              }
            ],
            pagination: {
              page: 1,
              limit: 20,
              total: 1,
              pages: 1
            }
          })
        })
      } else if (url.includes('/payments/catalog')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: [
              {
                id: 'item-1',
                name: 'Semester Fee',
                description: 'Regular semester fee',
                feeType: 'SEMESTER',
                amount: 50000,
                currency: 'INR',
                category: 'Academic',
                isActive: true,
                isRecurring: true,
                recurringInterval: 'SEMESTER',
                stats: {
                  totalPayments: 25,
                  completedPayments: 23,
                  totalRevenue: 1250000
                }
              }
            ],
            pagination: {
              page: 1,
              limit: 20,
              total: 1,
              pages: 1
            }
          })
        })
      } else if (url.includes('/payments/transactions')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            transactions: [
              {
                id: 'txn-1',
                transactionId: 'TXN_001',
                student: {
                  email: 'student1@test.com',
                  displayName: 'Test Student 1',
                  type: 'STUDENT'
                },
                feeType: 'SEMESTER',
                totalAmount: 50000,
                currency: 'INR',
                status: 'COMPLETED',
                gateway: 'RAZORPAY',
                paymentMethod: 'card',
                createdAt: new Date().toISOString(),
                completedAt: new Date().toISOString()
              }
            ],
            pagination: {
              page: 1,
              limit: 20,
              total: 1,
              pages: 1
            }
          })
        })
      } else {
        await route.continue()
      }
    })
  })

  test.describe('Admin Dashboard Navigation', () => {
    test('should navigate to admin dashboard', async ({ page }) => {
      await page.goto('/admin')
      
      await expect(page).toHaveTitle(/Admin Panel/)
      await expect(page.locator('h1')).toContainText('Admin Dashboard')
    })

    test('should show email and payment management sections', async ({ page }) => {
      await page.goto('/admin')
      
      // Check for email management section
      await expect(page.locator('text=Email Management')).toBeVisible()
      await expect(page.locator('text=Payment Management')).toBeVisible()
      
      // Check for navigation links
      await expect(page.locator('a[href="/admin/email"]')).toBeVisible()
      await expect(page.locator('a[href="/admin/payments"]')).toBeVisible()
    })
  })

  test.describe('Email Account Management', () => {
    test('should display email accounts list', async ({ page }) => {
      await page.goto('/admin/email/accounts')
      
      await expect(page.locator('h1')).toContainText('Email Account Management')
      
      // Wait for accounts to load
      await page.waitForSelector('[data-testid="email-accounts-table"]')
      
      // Check if test account is displayed
      await expect(page.locator('text=student1@test.com')).toBeVisible()
      await expect(page.locator('text=Test Student 1')).toBeVisible()
      await expect(page.locator('text=STUDENT')).toBeVisible()
    })

    test('should open create account dialog', async ({ page }) => {
      await page.goto('/admin/email/accounts')
      
      // Click create account button
      await page.click('button:has-text("Create Account")')
      
      // Check if dialog opened
      await expect(page.locator('[role="dialog"]')).toBeVisible()
      await expect(page.locator('text=Create Email Account')).toBeVisible()
      
      // Check form fields
      await expect(page.locator('input[name="email"]')).toBeVisible()
      await expect(page.locator('input[name="password"]')).toBeVisible()
      await expect(page.locator('select[name="type"]')).toBeVisible()
    })

    test('should filter email accounts', async ({ page }) => {
      await page.goto('/admin/email/accounts')
      
      // Wait for accounts to load
      await page.waitForSelector('[data-testid="email-accounts-table"]')
      
      // Use search filter
      await page.fill('input[placeholder*="Search"]', 'student1')
      await page.keyboard.press('Enter')
      
      // Check if filtered results are shown
      await expect(page.locator('text=student1@test.com')).toBeVisible()
    })

    test('should show account statistics', async ({ page }) => {
      await page.goto('/admin/email/accounts')
      
      // Wait for accounts to load
      await page.waitForSelector('[data-testid="email-accounts-table"]')
      
      // Check if statistics are displayed
      await expect(page.locator('text=5')).toBeVisible() // emails sent
      await expect(page.locator('text=10')).toBeVisible() // emails received
    })
  })

  test.describe('Payment Catalog Management', () => {
    test('should display payment catalog items', async ({ page }) => {
      await page.goto('/admin/payments/catalog')
      
      await expect(page.locator('h1')).toContainText('Payment Catalog Management')
      
      // Wait for items to load
      await page.waitForSelector('[data-testid="payment-catalog-table"]')
      
      // Check if test item is displayed
      await expect(page.locator('text=Semester Fee')).toBeVisible()
      await expect(page.locator('text=₹50,000')).toBeVisible()
      await expect(page.locator('text=SEMESTER')).toBeVisible()
    })

    test('should open create item dialog', async ({ page }) => {
      await page.goto('/admin/payments/catalog')
      
      // Click create item button
      await page.click('button:has-text("Add Item")')
      
      // Check if dialog opened
      await expect(page.locator('[role="dialog"]')).toBeVisible()
      await expect(page.locator('text=Create Payment Item')).toBeVisible()
      
      // Check form fields
      await expect(page.locator('input[name="name"]')).toBeVisible()
      await expect(page.locator('textarea[name="description"]')).toBeVisible()
      await expect(page.locator('select[name="feeType"]')).toBeVisible()
      await expect(page.locator('input[name="amount"]')).toBeVisible()
    })

    test('should show item statistics', async ({ page }) => {
      await page.goto('/admin/payments/catalog')
      
      // Wait for items to load
      await page.waitForSelector('[data-testid="payment-catalog-table"]')
      
      // Check if statistics are displayed
      await expect(page.locator('text=23/25 payments')).toBeVisible()
      await expect(page.locator('text=₹12,50,000')).toBeVisible()
    })
  })

  test.describe('Payment Transaction Monitoring', () => {
    test('should display payment transactions', async ({ page }) => {
      await page.goto('/admin/payments/transactions')
      
      await expect(page.locator('h1')).toContainText('Payment Transaction Monitoring')
      
      // Wait for transactions to load
      await page.waitForSelector('[data-testid="payment-transactions-table"]')
      
      // Check if test transaction is displayed
      await expect(page.locator('text=TXN_001')).toBeVisible()
      await expect(page.locator('text=Test Student 1')).toBeVisible()
      await expect(page.locator('text=₹50,000')).toBeVisible()
      await expect(page.locator('text=COMPLETED')).toBeVisible()
    })

    test('should show analytics cards', async ({ page }) => {
      await page.goto('/admin/payments/transactions')
      
      // Check for analytics cards
      await expect(page.locator('text=Total Revenue')).toBeVisible()
      await expect(page.locator('text=Total Transactions')).toBeVisible()
      await expect(page.locator('text=Average Amount')).toBeVisible()
      await expect(page.locator('text=Success Rate')).toBeVisible()
    })

    test('should filter transactions', async ({ page }) => {
      await page.goto('/admin/payments/transactions')
      
      // Wait for transactions to load
      await page.waitForSelector('[data-testid="payment-transactions-table"]')
      
      // Use status filter
      await page.selectOption('select[name="status"]', 'COMPLETED')
      
      // Check if filtered results are shown
      await expect(page.locator('text=COMPLETED')).toBeVisible()
    })
  })

  test.describe('Email Monitoring', () => {
    test('should display email monitoring page', async ({ page }) => {
      await page.goto('/admin/email/monitoring')
      
      await expect(page.locator('h1')).toContainText('Email Monitoring')
      await expect(page.locator('text=Monitor email traffic')).toBeVisible()
    })

    test('should show monitoring tabs', async ({ page }) => {
      await page.goto('/admin/email/monitoring')
      
      // Check for tabs
      await expect(page.locator('text=Email Monitoring')).toBeVisible()
      await expect(page.locator('text=Advanced Search')).toBeVisible()
      await expect(page.locator('text=Analytics')).toBeVisible()
    })
  })

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      await page.goto('/admin')
      
      // Check if mobile navigation works
      await expect(page.locator('h1')).toContainText('Admin Dashboard')
      
      // Check if content is responsive
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible()
    })

    test('should work on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })
      
      await page.goto('/admin/email/accounts')
      
      // Check if tablet layout works
      await expect(page.locator('h1')).toContainText('Email Account Management')
    })
  })

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Mock API error
      await page.route('**/api/admin/email/accounts', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        })
      })

      await page.goto('/admin/email/accounts')
      
      // Check if error is handled gracefully
      await expect(page.locator('text=Error loading')).toBeVisible()
    })

    test('should handle network errors', async ({ page }) => {
      // Simulate network failure
      await page.route('**/api/admin/**', async route => {
        await route.abort('failed')
      })

      await page.goto('/admin/payments/catalog')
      
      // Check if network error is handled
      await expect(page.locator('text=Network error')).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/admin')
      
      // Check for ARIA labels
      await expect(page.locator('[aria-label]')).toHaveCount({ min: 1 })
      await expect(page.locator('[role="button"]')).toHaveCount({ min: 1 })
    })

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/admin/email/accounts')
      
      // Test keyboard navigation
      await page.keyboard.press('Tab')
      await page.keyboard.press('Enter')
      
      // Check if keyboard navigation works
      await expect(page.locator(':focus')).toBeVisible()
    })
  })
})
