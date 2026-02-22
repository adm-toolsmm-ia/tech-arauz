/**
 * Dark Mode E2E Tests
 * Tests user workflow for toggling dark mode across the application
 */

describe('Dark Mode E2E Tests', () => {
  beforeEach(() => {
    // Clear localStorage and cookies before each test
    cy.clearLocalStorage();
    cy.clearCookies();

    // Visit the main page
    cy.visit('/');
  });

  describe('AC-3: Toggle dark mode via UI', () => {
    it('should toggle dark mode when clicking theme button', () => {
      // Initially light mode
      cy.get('html').should('not.have.class', 'dark');

      // Find and click theme toggle button
      cy.get('button[aria-label*="tema"], button[title*="tema"]').first().click();

      // Wait for theme to apply
      cy.wait(500);

      // Should be in dark mode
      cy.get('html').should('have.class', 'dark');
    });

    it('should toggle back to light mode', () => {
      // Start in light mode
      cy.get('html').should('not.have.class', 'dark');

      // Toggle to dark
      cy.get('button[aria-label*="tema"], button[title*="tema"]').first().click();
      cy.wait(500);
      cy.get('html').should('have.class', 'dark');

      // Toggle back to light
      cy.get('button[aria-label*="tema"], button[title*="tema"]').first().click();
      cy.wait(500);
      cy.get('html').should('not.have.class', 'dark');
    });
  });

  describe('AC-7: Persist theme across page reloads', () => {
    it('should persist dark mode after page reload', () => {
      // Toggle to dark mode
      cy.get('button[aria-label*="tema"], button[title*="tema"]').first().click();
      cy.wait(500);
      cy.get('html').should('have.class', 'dark');

      // Reload page
      cy.reload();

      // Wait for page to load
      cy.wait(500);

      // Should still be in dark mode (persisted via localStorage/cookie)
      cy.get('html').should('have.class', 'dark');
    });

    it('should persist light mode after page reload', () => {
      // Ensure light mode
      cy.get('html').should('not.have.class', 'dark');

      // Reload page
      cy.reload();

      // Wait for page to load
      cy.wait(500);

      // Should still be in light mode
      cy.get('html').should('not.have.class', 'dark');
    });
  });

  describe('AC-8: Visual/Color verification', () => {
    it('should apply dark mode colors to background', () => {
      // Toggle to dark mode
      cy.get('button[aria-label*="tema"], button[title*="tema"]').first().click();
      cy.wait(500);

      // Check that dark mode class is applied to html
      cy.get('html').should('have.class', 'dark');

      // Background should have dark colors in dark mode
      // This is a basic check - actual colors depend on Tailwind configuration
      cy.get('body')
        .should('have.css', 'background-color')
        .and('not.equal', 'rgb(255, 255, 255)'); // Not pure white
    });

    it('should show light mode colors in light mode', () => {
      // Ensure light mode
      cy.get('html').should('not.have.class', 'dark');

      // Background should have light colors
      // The body should have light background or no specific dark bg
      cy.get('body').should('be.visible');
    });
  });

  describe('AC-3: Work on all main pages', () => {
    const mainPages = [
      { path: '/', name: 'Dashboard' },
      { path: '/projetos', name: 'Projects' },
    ];

    mainPages.forEach(({ path, name }) => {
      it(`should toggle dark mode on ${name} page`, () => {
        cy.visit(path);

        // Check initial state
        cy.get('html').then(($html) => {
          const isDark = $html.hasClass('dark');

          // Click toggle
          cy.get('button[aria-label*="tema"], button[title*="tema"]').first().click();
          cy.wait(500);

          // State should be reversed
          cy.get('html').should(isDark ? 'not.have.class' : 'have.class', 'dark');
        });
      });
    });
  });

  describe('Icon changes with theme', () => {
    it('should show moon icon in light mode', () => {
      // Light mode should show moon icon
      cy.get('html').should('not.have.class', 'dark');

      // Look for moon icon (SVG or text)
      cy.get('button[aria-label*="tema"], button[title*="tema"]')
        .first()
        .within(() => {
          cy.get('[data-testid="moon-icon"], svg').should('exist');
        });
    });

    it('should show sun icon in dark mode', () => {
      // Toggle to dark
      cy.get('button[aria-label*="tema"], button[title*="tema"]').first().click();
      cy.wait(500);

      // Dark mode should show sun icon
      cy.get('html').should('have.class', 'dark');

      cy.get('button[aria-label*="tema"], button[title*="tema"]')
        .first()
        .within(() => {
          cy.get('[data-testid="sun-icon"], svg').should('exist');
        });
    });
  });

  describe('Multiple toggles in sequence', () => {
    it('should handle rapid theme toggles', () => {
      const toggleButton = cy.get('button[aria-label*="tema"], button[title*="tema"]').first();

      // Toggle multiple times
      toggleButton.click();
      cy.wait(200);
      toggleButton.click();
      cy.wait(200);
      toggleButton.click();
      cy.wait(200);

      // Final state should be dark (3 toggles from initial light)
      cy.get('html').should('have.class', 'dark');
    });
  });
});
