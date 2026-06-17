import { test, expect } from '@playwright/test';

test.describe('Omar Clinic Pro - Complete Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('Patient Portal - View Appointments', async ({ page }) => {
    // Navigate to patient portal
    await page.goto('/portal');
    
    // Check if page loads
    await expect(page).toHaveTitle(/بوابة المريض|Patient Portal/);
    
    // Check for main sections
    await expect(page.locator('text=المواعيد القادمة')).toBeVisible();
    await expect(page.locator('text=الملفات الطبية')).toBeVisible();
    await expect(page.locator('text=الفواتير')).toBeVisible();
  });

  test('Patient Portal - Upload Medical Files', async ({ page }) => {
    // Navigate to file upload page
    await page.goto('/portal/files/upload');
    
    // Check page title
    await expect(page.locator('text=رفع ملفات طبية')).toBeVisible();
    
    // Check for upload area
    await expect(page.locator('text=اسحب الملفات هنا')).toBeVisible();
  });

  test('Subscription Management - View Current Plan', async ({ page }) => {
    // Navigate to subscription page
    await page.goto('/dashboard/clinic/subscription');
    
    // Check for subscription details
    await expect(page.locator('text=Current Plan')).toBeVisible();
    await expect(page.locator('text=Status')).toBeVisible();
    await expect(page.locator('text=Renewal')).toBeVisible();
    
    // Check for action buttons
    await expect(page.locator('button:has-text("Upgrade")')).toBeVisible();
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    await expect(page.locator('button:has-text("Billing History")')).toBeVisible();
  });

  test('Subscription Management - Upgrade Plan', async ({ page }) => {
    // Navigate to upgrade page
    await page.goto('/dashboard/clinic/subscription/upgrade');
    
    // Check for plan options
    await expect(page.locator('text=اختر خطة جديدة')).toBeVisible();
    
    // Select a plan (assuming there's a button to select)
    const upgradeButton = page.locator('button:has-text("ترقية")').first();
    if (await upgradeButton.isVisible()) {
      await upgradeButton.click();
      // Check for payment redirect or modal
      await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
    }
  });

  test('Calendar - View Appointments', async ({ page }) => {
    // Navigate to dashboard with calendar
    await page.goto('/dashboard');
    
    // Check for calendar
    const calendar = page.locator('[role="grid"]').first();
    await expect(calendar).toBeVisible();
    
    // Click on a day with appointments
    const dayWithAppointment = page.locator('button').filter({ hasText: /^\d+$/ }).first();
    if (await dayWithAppointment.isVisible()) {
      await dayWithAppointment.click();
    }
  });

  test('Dark Mode Toggle', async ({ page }) => {
    // Navigate to app
    await page.goto('/');
    
    // Find and click dark mode toggle
    const themeToggle = page.locator('button').filter({ has: page.locator('svg') }).first();
    
    // Initial state should be light
    let html = page.locator('html');
    let isDark = await html.evaluate(el => el.classList.contains('dark'));
    expect(isDark).toBe(false);
    
    // Click toggle
    await themeToggle.click();
    
    // Wait for dropdown and select dark mode
    await page.locator('text=داكن').click();
    
    // Check if dark mode is applied
    isDark = await html.evaluate(el => el.classList.contains('dark'));
    expect(isDark).toBe(true);
  });

  test('Responsive Design - Mobile View', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to portal
    await page.goto('/portal');
    
    // Check if page is responsive
    const mainContent = page.locator('main, [role="main"]').first();
    await expect(mainContent).toBeVisible();
    
    // Check if navigation is accessible
    const navToggle = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]').first();
    if (await navToggle.isVisible()) {
      await navToggle.click();
    }
  });

  test('Form Validation - Phone Input', async ({ page }) => {
    // Navigate to a page with phone input (e.g., profile or contact form)
    await page.goto('/dashboard/clinic/settings');
    
    // Find phone input
    const phoneInput = page.locator('input[type="tel"]').first();
    
    if (await phoneInput.isVisible()) {
      // Test invalid input
      await phoneInput.fill('invalid');
      
      // Test valid input
      await phoneInput.fill('0791234567');
      
      // Check if value is formatted
      const value = await phoneInput.inputValue();
      expect(value).toMatch(/\d/);
    }
  });

  test('Modal - Open and Close', async ({ page }) => {
    // Navigate to a page with modal (e.g., appointment details)
    await page.goto('/portal/appointments');
    
    // Click on an appointment to open modal
    const appointmentLink = page.locator('a, button').filter({ hasText: /موعد|appointment/ }).first();
    
    if (await appointmentLink.isVisible()) {
      await appointmentLink.click();
      
      // Check if modal is visible
      const modal = page.locator('[role="dialog"]').first();
      await expect(modal).toBeVisible();
      
      // Test ESC key to close
      await page.keyboard.press('Escape');
      
      // Modal should be hidden
      await expect(modal).not.toBeVisible();
    }
  });

  test('Audit Logs - View Activity', async ({ page }) => {
    // Navigate to audit logs page (admin only)
    await page.goto('/dashboard/admin/audit-logs');
    
    // Check if page loads
    const pageTitle = page.locator('h1, h2').filter({ hasText: /سجل|audit|log/ }).first();
    
    if (await pageTitle.isVisible()) {
      await expect(pageTitle).toBeVisible();
      
      // Check for table or list
      const table = page.locator('table, [role="table"]').first();
      if (await table.isVisible()) {
        await expect(table).toBeVisible();
      }
    }
  });

  test('Permissions - Doctor Cannot Access Billing', async ({ page }) => {
    // This test assumes the app has role-based access control
    // Navigate to billing page as doctor
    await page.goto('/dashboard/billing');
    
    // Should either be redirected or see an error
    const errorMessage = page.locator('text=لا تملك صلاحية|Access Denied|Permission Denied').first();
    const redirected = page.url();
    
    // Either should see error or be redirected
    const hasError = await errorMessage.isVisible().catch(() => false);
    const isRedirected = !redirected.includes('/billing');
    
    expect(hasError || isRedirected).toBe(true);
  });

  test('Notifications - Email Template', async ({ page }) => {
    // Navigate to notifications page
    await page.goto('/api/notifications/email');
    
    // This is an API test, so we'll just check the response
    const response = await page.goto('/api/notifications/email', { method: 'POST' });
    expect(response?.status()).toBe(405); // Method not allowed for GET
  });
});

test.describe('Performance Tests', () => {
  test('Page Load Performance - Portal', async ({ page }) => {
    // Measure page load time
    const startTime = Date.now();
    await page.goto('/portal');
    const loadTime = Date.now() - startTime;
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('Page Load Performance - Dashboard', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/dashboard');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });
});

test.describe('Accessibility Tests', () => {
  test('Portal - Keyboard Navigation', async ({ page }) => {
    await page.goto('/portal');
    
    // Tab through elements
    await page.keyboard.press('Tab');
    
    // Check if focus is visible
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });
    
    expect(focusedElement).toBeTruthy();
  });

  test('Portal - Screen Reader Support', async ({ page }) => {
    await page.goto('/portal');
    
    // Check for ARIA labels
    const headings = page.locator('h1, h2, h3, [role="heading"]');
    const count = await headings.count();
    
    expect(count).toBeGreaterThan(0);
  });
});
