/**
 * Talor Extension - Popup Script
 *
 * Handles popup UI interactions
 */

const TALOR_WEB_URL = 'https://www.talorme.com';

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  setupEventListeners();
  displayVersion();
});

/**
 * Load usage statistics
 */
function loadStats() {
  chrome.storage.local.get(['usageStats'], (result) => {
    const stats = result.usageStats || {
      tailorsInitiated: 0,
      pagesVisited: 0,
      lastUsed: null
    };

    // Update tailor count display
    const tailorCountEl = document.getElementById('tailorCount');
    if (tailorCountEl) {
      tailorCountEl.textContent = stats.tailorsInitiated || 0;
    }
  });
}

/**
 * Display extension version
 */
function displayVersion() {
  const version = chrome.runtime.getManifest().version;
  const versionEl = document.getElementById('version');
  if (versionEl) {
    versionEl.textContent = version;
  }
}

/**
 * Setup event listeners for buttons
 */
function setupEventListeners() {
  // Open Dashboard button
  const dashboardBtn = document.getElementById('openDashboard');
  if (dashboardBtn) {
    dashboardBtn.addEventListener('click', () => {
      chrome.tabs.create({
        url: `${TALOR_WEB_URL}/resumes?source=extension-popup`
      });
    });
  }

  // View Templates button
  const templatesBtn = document.getElementById('viewTemplates');
  if (templatesBtn) {
    templatesBtn.addEventListener('click', () => {
      chrome.tabs.create({
        url: `${TALOR_WEB_URL}/templates?source=extension-popup`
      });
    });
  }
}

/**
 * Increment tailor count (called when user uses the extension)
 */
function incrementTailorCount() {
  chrome.storage.local.get(['usageStats'], (result) => {
    const stats = result.usageStats || {
      tailorsInitiated: 0,
      pagesVisited: 0,
      lastUsed: null
    };

    stats.tailorsInitiated = (stats.tailorsInitiated || 0) + 1;
    stats.lastUsed = Date.now();

    chrome.storage.local.set({ usageStats: stats }, () => {
      loadStats(); // Refresh display
    });
  });
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'tailorInitiated') {
    incrementTailorCount();
  }

  if (request.action === 'updateStats') {
    loadStats();
  }
});
