/**
 * Indeed Content Script
 *
 * Injects "Tailor with Talor" button on Indeed job postings
 */

(function() {
  'use strict';

  // Configuration
  const TALOR_WEB_URL = 'https://www.talorme.com';
  const BUTTON_ID = 'talor-tailor-button';
  const OBSERVER_DELAY = 500;

  let buttonInjected = false;

  /**
   * Extract job details from Indeed job page
   */
  function extractJobDetails() {
    const jobTitle = document.querySelector('.jobsearch-JobInfoHeader-title, h1.jobsearch-JobInfoHeader-title-container')?.textContent?.trim() || '';
    const companyName = document.querySelector('[data-company-name="true"], .jobsearch-InlineCompanyRating-companyHeader a')?.textContent?.trim() || '';
    const location = document.querySelector('[data-testid="job-location"], .jobsearch-JobInfoHeader-subtitle div')?.textContent?.trim() || '';
    const jobUrl = window.location.href;

    // Extract job description
    const descriptionElement = document.querySelector('#jobDescriptionText, .jobsearch-jobDescriptionText');
    const description = descriptionElement?.innerText?.trim() || '';

    return {
      title: jobTitle,
      company: companyName,
      location: location,
      url: jobUrl,
      description: description,
      source: 'indeed'
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
   * Handle button click
   */
  function handleTailorClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const jobDetails = extractJobDetails();

    chrome.storage.local.set({
      pendingJob: jobDetails,
      timestamp: Date.now()
    }, () => {
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
    const selectors = [
      '.jobsearch-JobInfoHeader-title-container',
      '.jobsearch-JobComponent-header',
      '#viewJobSSRRoot header',
      '.jobsearch-ViewJobLayout-jobDisplay header',
      'h1.jobsearch-JobInfoHeader-title-container'
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
   * Inject the Talor button
   */
  function injectButton() {
    if (buttonInjected || document.getElementById(BUTTON_ID)) {
      return;
    }

    const container = findButtonContainer();
    if (!container) {
      console.log('[Talor] Indeed container not found, will retry');
      return;
    }

    const button = createTalorButton();

    const wrapper = document.createElement('div');
    wrapper.className = 'talor-button-wrapper';
    wrapper.appendChild(button);

    // Insert after the job title/header
    container.appendChild(wrapper);

    buttonInjected = true;
    console.log('[Talor] Indeed button injected successfully');
  }

  /**
   * Initialize
   */
  function init() {
    console.log('[Talor] Indeed content script loaded');

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(injectButton, OBSERVER_DELAY);
    } else {
      window.addEventListener('load', () => {
        setTimeout(injectButton, OBSERVER_DELAY);
      });
    }

    // Watch for dynamic changes
    const observer = new MutationObserver(() => {
      if (!buttonInjected) {
        setTimeout(injectButton, OBSERVER_DELAY);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Re-inject on URL changes
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

  init();
})();
