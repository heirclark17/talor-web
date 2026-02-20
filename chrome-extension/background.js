/**
 * Talor Extension - Background Service Worker
 *
 * Handles communication between content scripts and the web app
 */

console.log('[Talor] Background service worker loaded');

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Talor] Extension installed', details);

  if (details.reason === 'install') {
    // Open welcome page on first install
    chrome.tabs.create({
      url: 'https://www.talorme.com/?source=extension-install'
    });

    // Set default settings
    chrome.storage.local.set({
      extensionVersion: chrome.runtime.getManifest().version,
      installedAt: Date.now()
    });
  } else if (details.reason === 'update') {
    console.log('[Talor] Extension updated to version', chrome.runtime.getManifest().version);
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Talor] Message received:', request);

  if (request.action === 'extractJobData') {
    // Content script is requesting job data extraction
    handleJobExtraction(request, sender, sendResponse);
    return true; // Keep channel open for async response
  }

  if (request.action === 'storeJobData') {
    // Store job data for web app to retrieve
    chrome.storage.local.set({
      pendingJob: request.jobData,
      timestamp: Date.now()
    }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'getStoredJob') {
    // Web app is requesting stored job data
    chrome.storage.local.get(['pendingJob', 'timestamp'], (result) => {
      // Clear job data after 5 minutes (stale)
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      if (result.timestamp && result.timestamp < fiveMinutesAgo) {
        chrome.storage.local.remove(['pendingJob', 'timestamp']);
        sendResponse({ job: null, expired: true });
      } else {
        sendResponse({ job: result.pendingJob || null });
      }
    });
    return true;
  }

  if (request.action === 'clearStoredJob') {
    // Clear stored job data
    chrome.storage.local.remove(['pendingJob', 'timestamp'], () => {
      sendResponse({ success: true });
    });
    return true;
  }

  return false;
});

/**
 * Handle job data extraction request
 */
function handleJobExtraction(request, sender, sendResponse) {
  const tabId = sender.tab?.id;

  if (!tabId) {
    sendResponse({ error: 'No active tab' });
    return;
  }

  // Execute content script to extract job data
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: extractJobDataFromPage
  }, (results) => {
    if (chrome.runtime.lastError) {
      sendResponse({ error: chrome.runtime.lastError.message });
      return;
    }

    if (results && results[0] && results[0].result) {
      sendResponse({ jobData: results[0].result });
    } else {
      sendResponse({ error: 'Could not extract job data' });
    }
  });
}

/**
 * Function that runs in the page context to extract job data
 */
function extractJobDataFromPage() {
  const url = window.location.href;
  let source = 'unknown';

  if (url.includes('linkedin.com')) {
    source = 'linkedin';
  } else if (url.includes('indeed.com')) {
    source = 'indeed';
  }

  return {
    url: url,
    source: source,
    title: document.title,
    timestamp: Date.now()
  };
}

// Listen for tab updates (user navigates to a job page)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const url = tab.url;

    // Check if user is on a supported job page
    if (url.includes('linkedin.com/jobs/view') || url.includes('indeed.com/viewjob')) {
      console.log('[Talor] User navigated to job page:', url);

      // Badge notification (optional - shows extension is active)
      chrome.action.setBadgeText({ tabId: tabId, text: '' });
      chrome.action.setBadgeBackgroundColor({ tabId: tabId, color: '#3b82f6' });
    }
  }
});

// Keep service worker alive (Chrome kills inactive service workers)
chrome.runtime.onConnect.addListener((port) => {
  console.log('[Talor] Port connected:', port.name);
});

// Analytics (optional - track extension usage)
chrome.storage.local.get(['usageStats'], (result) => {
  const stats = result.usageStats || {
    tailorsInitiated: 0,
    pagesVisited: 0,
    lastUsed: null
  };

  // Initialize stats
  chrome.storage.local.set({ usageStats: stats });
});
