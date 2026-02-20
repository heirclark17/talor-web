/**
 * LinkedIn Content Script
 *
 * Adds "Tailor with Talor" button to LinkedIn job postings
 */

(function() {
  'use strict';

  const TALOR_WEB_URL = 'https://www.talorme.com';

  // Track if button has been added to prevent duplicates
  let buttonAdded = false;

  /**
   * Extract job details from LinkedIn page
   */
  function extractJobDetails() {
    try {
      // Job title
      const titleElement = document.querySelector('.job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title, h1.t-24');
      const title = titleElement?.textContent?.trim() || '';

      // Company name
      const companyElement = document.querySelector('.job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name, a.ember-view');
      const company = companyElement?.textContent?.trim() || '';

      // Location
      const locationElement = document.querySelector('.job-details-jobs-unified-top-card__bullet, .jobs-unified-top-card__bullet');
      const location = locationElement?.textContent?.trim() || '';

      // Job URL
      const jobUrl = window.location.href;

      // Job description
      const descriptionElement = document.querySelector('.jobs-description__content, .jobs-box__html-content, #job-details');
      const description = descriptionElement?.textContent?.trim() || '';

      return {
        title,
        company,
        location,
        jobUrl,
        description: description.substring(0, 500), // First 500 chars
        source: 'linkedin'
      };
    } catch (error) {
      console.error('[Talor] Error extracting job details:', error);
      return null;
    }
  }

  /**
   * Create and inject "Tailor with Talor" button
   */
  function injectTailorButton() {
    if (buttonAdded) return;

    // Find the action buttons container
    const actionContainer = document.querySelector(
      '.jobs-apply-button--top-card, .jobs-unified-top-card__content--two-pane, .jobs-details__main-content'
    );

    if (!actionContainer) {
      console.log('[Talor] Action container not found yet');
      return;
    }

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'talor-button-container';
    buttonContainer.style.marginTop = '12px';

    // Create button
    const button = document.createElement('button');
    button.className = 'talor-extension-button';
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <circle cx="12" cy="13" r="2"></circle>
        <path d="M12 15v4"></path>
      </svg>
      <span>Tailor Resume with Talor</span>
    `;

    button.addEventListener('click', handleTailorClick);

    buttonContainer.appendChild(button);
    actionContainer.insertBefore(buttonContainer, actionContainer.firstChild);

    buttonAdded = true;
    console.log('[Talor] Button injected successfully');
  }

  /**
   * Handle button click
   */
  function handleTailorClick(e) {
    e.preventDefault();
    e.stopPropagation();

    // Extract job details
    const jobDetails = extractJobDetails();

    if (!jobDetails || !jobDetails.title || !jobDetails.company) {
      alert('Could not extract job details. Please try again or copy the job URL manually.');
      return;
    }

    // Build Talor URL with job details
    const params = new URLSearchParams({
      jobUrl: jobDetails.jobUrl,
      company: jobDetails.company,
      title: jobDetails.title,
      source: 'chrome-extension-linkedin'
    });

    const tailorUrl = `${TALOR_WEB_URL}/tailor?${params.toString()}`;

    // Track usage
    chrome.runtime.sendMessage({
      type: 'track_tailor_click',
      data: {
        source: 'linkedin',
        company: jobDetails.company,
        title: jobDetails.title
      }
    });

    // Open Talor in new tab
    window.open(tailorUrl, '_blank');

    // Visual feedback
    const button = e.currentTarget;
    const originalText = button.innerHTML;
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>Opening Talor...</span>
    `;
    button.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

    setTimeout(() => {
      button.innerHTML = originalText;
      button.style.background = '';
    }, 2000);
  }

  /**
   * Initialize extension
   */
  function init() {
    // Try to inject button immediately
    injectTailorButton();

    // Watch for dynamic content changes (LinkedIn is a SPA)
    const observer = new MutationObserver(() => {
      if (!buttonAdded) {
        injectTailorButton();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Also try again after delay (fallback)
    setTimeout(injectTailorButton, 1000);
    setTimeout(injectTailorButton, 3000);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('[Talor] LinkedIn content script loaded');
})();
