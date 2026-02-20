/**
 * LinkedIn Content Script
 *
 * Injects "Tailor with Talor" button on LinkedIn job postings
 */

(function() {
  'use strict';

  // Configuration
  const TALOR_WEB_URL = 'https://www.talorme.com';
  const BUTTON_ID = 'talor-tailor-button';
  const OBSERVER_DELAY = 500; // ms to wait before checking for button placement

  // Track if button already injected (prevent duplicates)
  let buttonInjected = false;

  /**
   * Extract job details from LinkedIn job page
   */
  function extractJobDetails() {
    const jobTitle = document.querySelector('.job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title')?.textContent?.trim() || '';
    const companyName = document.querySelector('.job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name')?.textContent?.trim() || '';
    const location = document.querySelector('.job-details-jobs-unified-top-card__bullet, .jobs-unified-top-card__bullet')?.textContent?.trim() || '';
    const jobUrl = window.location.href;

    // Extract job description
    const descriptionElement = document.querySelector('.jobs-description__content, .jobs-box__html-content');
    const description = descriptionElement?.innerText?.trim() || '';

    return {
      title: jobTitle,
      company: companyName,
      location: location,
      url: jobUrl,
      description: description,
      source: 'linkedin'
    };
  }

  /**
   * Create Talor button element
   */
  function createTalorButton() {
    const button = document.createElement('button');
    button.id = BUTTON_ID;
    button.className = 'talor-extension-button';
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
      </svg>
      <span>Tailor with Talor</span>
    `;

    button.addEventListener('click', handleTailorClick);

    return button;
  }

  /**
   * Handle button click - send job details to Talor web app
   */
  function handleTailorClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const jobDetails = extractJobDetails();

    // Store job details in chrome.storage for the web app to retrieve
    chrome.storage.local.set({
      pendingJob: jobDetails,
      timestamp: Date.now()
    }, () => {
      // Open Talor web app in new tab with job URL
      const encodedUrl = encodeURIComponent(jobDetails.url);
      const talorUrl = `${TALOR_WEB_URL}/tailor?jobUrl=${encodedUrl}&source=extension`;

      window.open(talorUrl, '_blank');
    });

    // Visual feedback
    const button = e.currentTarget;
    button.classList.add('talor-button-clicked');
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>Opening Talor...</span>
    `;

    setTimeout(() => {
      button.classList.remove('talor-button-clicked');
      button.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
        <span>Tailor with Talor</span>
      `;
    }, 2000);
  }

  /**
   * Find the best container to inject the button
   */
  function findButtonContainer() {
    // Try multiple selectors (LinkedIn changes their DOM frequently)
    const selectors = [
      '.jobs-unified-top-card__content--two-pane',
      '.jobs-details-top-card__content-container',
      '.job-details-jobs-unified-top-card__container--two-pane',
      '.jobs-unified-top-card',
      '.jobs-details-top-card'
    ];

    for (const selector of selectors) {
      const container = document.querySelector(selector);
      if (container) {
        return container;
      }
    }

    return null;
  }

  /**
   * Inject the Talor button into the page
   */
  function injectButton() {
    // Prevent duplicate injection
    if (buttonInjected || document.getElementById(BUTTON_ID)) {
      return;
    }

    const container = findButtonContainer();
    if (!container) {
      console.log('[Talor] Button container not found, will retry');
      return;
    }

    const button = createTalorButton();

    // Create wrapper for proper positioning
    const wrapper = document.createElement('div');
    wrapper.className = 'talor-button-wrapper';
    wrapper.appendChild(button);

    // Insert button at the top of the container
    container.insertBefore(wrapper, container.firstChild);

    buttonInjected = true;
    console.log('[Talor] Button injected successfully');
  }

  /**
   * Initialize the extension
   */
  function init() {
    console.log('[Talor] LinkedIn content script loaded');

    // Inject button immediately if page is ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(injectButton, OBSERVER_DELAY);
    } else {
      window.addEventListener('load', () => {
        setTimeout(injectButton, OBSERVER_DELAY);
      });
    }

    // Watch for dynamic content changes (LinkedIn is a SPA)
    const observer = new MutationObserver((mutations) => {
      if (!buttonInjected) {
        setTimeout(injectButton, OBSERVER_DELAY);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Re-inject on URL changes (for SPA navigation)
    let lastUrl = window.location.href;
    new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        buttonInjected = false;
        setTimeout(injectButton, OBSERVER_DELAY);
      }
    }).observe(document, { subtree: true, childList: true });
  }

  // Start the extension
  init();
})();
