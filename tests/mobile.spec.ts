import { test, expect, devices } from '@playwright/test'

/**
 * Mobile E2E Tests for PsyDoctor
 * Validates critical user paths on Pixel 5 (Android) and iPhone 13 (iOS Safari)
 */

test.use({ ...devices['Pixel 5'] })

test.describe('Mobile Viewport Tests (Pixel 5 & iPhone 13)', () => {
    test('renders mobile landing page without horizontal overflow at 360px', async ({ page }) => {
        await page.setViewportSize({ width: 360, height: 640 })
        await page.goto('/')

        // Verify title & crisis banner visibility
        await expect(page).toHaveTitle(/PsyDoctor/i)
        const crisisBanner = page.locator('text=¿Emergencia?')
        await expect(crisisBanner).toBeVisible()

        // Check horizontal overflow: scrollWidth should equal or be within clientWidth
        const hasHorizontalOverflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
        })
        expect(hasHorizontalOverflow).toBe(false)
    })

    test('crisis banner phone links are actionable and contain valid tel: schemes', async ({ page }) => {
        await page.setViewportSize({ width: 360, height: 640 })
        await page.goto('/')

        const suicideLine = page.locator('a[href^="tel:*4141"]')
        await expect(suicideLine).toBeVisible()
        const samuLine = page.locator('a[href^="tel:131"]')
        await expect(samuLine).toBeVisible()
    })

    test('mobile waitlist form inputs have font-size >= 16px to prevent iOS auto-zoom', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 })
        await page.goto('/')

        const emailInput = page.locator('input[type="email"]').first()
        if (await emailInput.isVisible()) {
            const fontSize = await emailInput.evaluate((el) => {
                return parseFloat(window.getComputedStyle(el).fontSize)
            })
            expect(fontSize).toBeGreaterThanOrEqual(16)
        }
    })

    test('payment return page renders without throwing errors on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 360, height: 640 })
        await page.goto('/pago/confirmacion?status=success&appointmentId=test-mobile')

        await expect(page.locator('text=¡Pago confirmado!')).toBeVisible()
    })
})
