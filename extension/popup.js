/**
 * Talor Extension Popup Script
 *
 * Displays extension stats and recent jobs
 */

document.addEventListener('DOMContentLoaded', async () => {
  await loadStats();
  await loadRecentJobs();
});

/**
 * Load and display extension stats
 */
async function loadStats() {
  try {
    const storage = await chrome.storage.local.get(['totalClicks', 'clicksBySource', 'recentJobs', 'installDate']);

    // Total clicks
    const totalClicks = storage.totalClicks || 0;
    document.getElementById('total-clicks').textContent = totalClicks;

    // Calculate this week's clicks
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentJobs = storage.recentJobs || [];
    const weekClicks = recentJobs.filter(job => {
      const jobDate = new Date(job.timestamp);
      return jobDate >= weekAgo;
    }).length;

    document.getElementById('week-clicks').textContent = weekClicks;

  } catch (error) {
    console.error('[Talor] Error loading stats:', error);
  }
}

/**
 * Load and display recent jobs
 */
async function loadRecentJobs() {
  try {
    const storage = await chrome.storage.local.get(['recentJobs']);
    const recentJobs = storage.recentJobs || [];

    const container = document.getElementById('jobs-container');

    if (recentJobs.length === 0) {
      // Empty state already shown in HTML
      return;
    }

    // Clear empty state
    container.innerHTML = '';

    // Show first 5 recent jobs
    const displayJobs = recentJobs.slice(0, 5);

    displayJobs.forEach(job => {
      const jobElement = createJobElement(job);
      container.appendChild(jobElement);
    });

  } catch (error) {
    console.error('[Talor] Error loading recent jobs:', error);
  }
}

/**
 * Create job list item element
 */
function createJobElement(job) {
  const div = document.createElement('div');
  div.className = 'job-item';
  div.onclick = () => openJob(job.tabUrl);

  const company = document.createElement('div');
  company.className = 'job-company';
  company.textContent = job.company;

  const title = document.createElement('div');
  title.className = 'job-title';
  title.textContent = job.title;

  const meta = document.createElement('div');
  meta.className = 'job-meta';

  const source = document.createElement('span');
  source.textContent = formatSource(job.source);

  const time = document.createElement('span');
  time.textContent = formatTimeAgo(job.timestamp);

  meta.appendChild(source);
  meta.appendChild(document.createTextNode('•'));
  meta.appendChild(time);

  div.appendChild(company);
  div.appendChild(title);
  div.appendChild(meta);

  return div;
}

/**
 * Open job in new tab
 */
function openJob(url) {
  if (url) {
    chrome.tabs.create({ url });
  }
}

/**
 * Format source name for display
 */
function formatSource(source) {
  const sourceMap = {
    linkedin: 'LinkedIn',
    indeed: 'Indeed',
    glassdoor: 'Glassdoor',
    dice: 'Dice',
    monster: 'Monster',
    ziprecruiter: 'ZipRecruiter',
    simplyhired: 'SimplyHired',
    careerbuilder: 'CareerBuilder'
  };

  return sourceMap[source] || source;
}

/**
 * Format timestamp as relative time
 */
function formatTimeAgo(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Handle footer link clicks
 */
document.querySelectorAll('.footer-links a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: e.target.href });
  });
});
