/**
 * Talor Extension Background Service Worker
 *
 * Handles extension lifecycle, message passing, and analytics tracking
 */

// Track extension install/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[Talor] Extension installed');

    // Open welcome page
    chrome.tabs.create({
      url: 'https://www.talorme.com/extension-welcome'
    });

    // Initialize storage
    chrome.storage.local.set({
      installDate: new Date().toISOString(),
      totalClicks: 0,
      clicksBySource: {
        linkedin: 0,
        indeed: 0,
        glassdoor: 0,
        dice: 0,
        monster: 0,
        ziprecruiter: 0,
        simplyhired: 0,
        careerbuilder: 0
      }
    });
  } else if (details.reason === 'update') {
    console.log('[Talor] Extension updated to version', chrome.runtime.getManifest().version);
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'track_tailor_click') {
    handleTailorClick(message.data, sender.tab);
  }

  // Return true to indicate async response
  return true;
});

/**
 * Handle tailor button click tracking
 */
async function handleTailorClick(data, tab) {
  try {
    // Get current stats
    const storage = await chrome.storage.local.get(['totalClicks', 'clicksBySource', 'recentJobs']);

    const totalClicks = (storage.totalClicks || 0) + 1;
    const clicksBySource = storage.clicksBySource || {};
    const recentJobs = storage.recentJobs || [];

    // Increment source counter
    if (data.source && clicksBySource[data.source] !== undefined) {
      clicksBySource[data.source]++;
    }

    // Add to recent jobs (keep last 20)
    recentJobs.unshift({
      company: data.company,
      title: data.title,
      source: data.source,
      timestamp: new Date().toISOString(),
      tabUrl: tab?.url
    });

    const trimmedJobs = recentJobs.slice(0, 20);

    // Save updated stats
    await chrome.storage.local.set({
      totalClicks,
      clicksBySource,
      recentJobs: trimmedJobs,
      lastClickDate: new Date().toISOString()
    });

    console.log('[Talor] Tracked click:', {
      company: data.company,
      title: data.title,
      source: data.source,
      totalClicks
    });

    // Send analytics to PostHog (optional - only if user is logged in)
    sendAnalytics('extension_tailor_click', {
      company: data.company,
      title: data.title,
      source: data.source,
      totalClicks
    });

  } catch (error) {
    console.error('[Talor] Error tracking click:', error);
  }
}

/**
 * Send analytics event (optional - requires PostHog setup)
 */
async function sendAnalytics(eventName, properties) {
  try {
    // Get user ID from Talor web app (if logged in)
    const storage = await chrome.storage.local.get(['userId']);

    if (!storage.userId) {
      // User hasn't logged in via extension yet
      return;
    }

    // Send to PostHog
    // Note: This would require PostHog API key in production
    // For now, just log locally
    console.log('[Talor] Analytics event:', eventName, properties);

  } catch (error) {
    console.error('[Talor] Error sending analytics:', error);
  }
}

/**
 * Handle extension action (toolbar icon) click
 */
chrome.action.onClicked.addListener((tab) => {
  // Open popup or Talor web app
  chrome.tabs.create({
    url: 'https://www.talorme.com'
  });
});

/**
 * Context menu integration (right-click on job links)
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'tailor-with-talor',
    title: 'Tailor Resume with Talor',
    contexts: ['link', 'page'],
    documentUrlPatterns: [
      '*://*.linkedin.com/jobs/*',
      '*://*.indeed.com/viewjob*',
      '*://*.glassdoor.com/job-listing/*',
      '*://*.dice.com/jobs/*',
      '*://*.monster.com/jobs/*',
      '*://*.ziprecruiter.com/c/*',
      '*://*.simplyhired.com/job/*',
      '*://*.careerbuilder.com/job/*'
    ]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'tailor-with-talor') {
    const jobUrl = info.linkUrl || info.pageUrl;
    const tailorUrl = `https://www.talorme.com/tailor?jobUrl=${encodeURIComponent(jobUrl)}&source=chrome-extension-context`;

    chrome.tabs.create({ url: tailorUrl });

    // Track context menu usage
    chrome.storage.local.get(['contextMenuClicks'], (storage) => {
      const count = (storage.contextMenuClicks || 0) + 1;
      chrome.storage.local.set({ contextMenuClicks: count });
    });
  }
});

console.log('[Talor] Background service worker initialized');
