/**
 * Glassdoor Content Script
 *
 * Adds "Tailor with Talor" button to Glassdoor job postings
 */

(function() {
  'use strict';

  const TALOR_WEB_URL = 'https://www.talorme.com';

  // Track if button has been added to prevent duplicates
  let buttonAdded = false;

  /**
   * Extract job details from Glassdoor page
   */
  function extractJobDetails() {
    try {
      // Job title
      const titleElement = document.querySelector('[data-test="job-title"], .JobDetails_jobTitle__Rw_gn, h1.e1tk4kwz0');
      const title = titleElement?.textContent?.trim() || '';

      // Company name
      const companyElement = document.querySelector('[data-test="employer-name"], .EmployerProfile_employerName__Xemli, .e1tk4kwz5');
      const company = companyElement?.textContent?.trim() || '';

      // Location
      const locationElement = document.querySelector('[data-test="location"], .JobDetails_location__mSg5h, .e1tk4kwz1');
      const location = locationElement?.textContent?.trim() || '';

      // Job URL
      const jobUrl = window.location.href;

      // Job description
      const descriptionElement = document.querySelector('[data-test="jobDescriptionContent"], .JobDetails_jobDescription__uW_fK, .desc');
      const description = descriptionElement?.textContent?.trim() || '';

      return {
        title,
        company,
        location,
        jobUrl,
        description: description.substring(0, 500), // First 500 chars
        source: 'glassdoor'
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
      '[data-test="job-apply-button-container"], .JobDetails_jobDetailsHeader__pjn6z, .JobDetails_jobDetails__K_JJX'
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
      source: 'chrome-extension-glassdoor'
    });

    const tailorUrl = `${TALOR_WEB_URL}/tailor?${params.toString()}`;

    // Track usage
    chrome.runtime.sendMessage({
      type: 'track_tailor_click',
      data: {
        source: 'glassdoor',
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

    // Watch for dynamic content changes (Glassdoor is a SPA)
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

  console.log('[Talor] Glassdoor content script loaded');
})();
