/**
 * HTML Sanitization Utility using DOMPurify
 *
 * Prevents XSS attacks by sanitizing user-generated or API-returned HTML content.
 * This is a LOW-RISK security enhancement for the frontend.
 */

import DOMPurify from 'dompurify';

/**
 * Configuration for different sanitization levels
 */
const SANITIZE_CONFIGS = {
  // Strict: No HTML tags allowed, only text
  strict: {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  },

  // Basic: Allow simple formatting only
  basic: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p'],
    ALLOWED_ATTR: [],
  },

  // Rich: Allow common rich text elements
  rich: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOWED_URI_REGEXP: /^https?:\/\//,  // Only allow http/https links
  },

  // Resume: Allow resume-specific formatting
  resume: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p', 'ul', 'ol', 'li', 'h2', 'h3', 'span', 'div'],
    ALLOWED_ATTR: ['class'],
  },
};

export type SanitizeLevel = keyof typeof SANITIZE_CONFIGS;

/**
 * Sanitize HTML string to prevent XSS attacks
 *
 * @param dirty - Untrusted HTML string
 * @param level - Sanitization level ('strict', 'basic', 'rich', or 'resume')
 * @returns Sanitized HTML string safe to render
 *
 * @example
 * ```typescript
 * // Strict mode (strip all HTML)
 * const clean = sanitizeHTML('<script>alert("XSS")</script>Hello', 'strict');
 * // Returns: "Hello"
 *
 * // Basic mode (allow simple formatting)
 * const clean = sanitizeHTML('<b>Bold</b> <script>alert("XSS")</script>', 'basic');
 * // Returns: "<b>Bold</b> "
 *
 * // Rich mode (allow common HTML)
 * const clean = sanitizeHTML('<a href="http://example.com">Link</a>', 'rich');
 * // Returns: "<a href="http://example.com">Link</a>"
 * ```
 */
export function sanitizeHTML(
  dirty: string,
  level: SanitizeLevel = 'basic'
): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  const config = SANITIZE_CONFIGS[level];

  // Sanitize with DOMPurify
  const clean = DOMPurify.sanitize(dirty, config);

  return clean;
}

/**
 * Sanitize and render resume summary (preserves line breaks)
 *
 * @param summary - Resume summary text
 * @returns Sanitized HTML string with preserved line breaks
 */
export function sanitizeResumeSummary(summary: string): string {
  if (!summary) return '';

  // Convert line breaks to <br> tags before sanitizing
  const withBreaks = summary.replace(/\n/g, '<br>');

  return sanitizeHTML(withBreaks, 'resume');
}

/**
 * Sanitize resume experience bullets
 *
 * @param bullets - Array of bullet point strings
 * @returns Array of sanitized bullet points
 */
export function sanitizeResumeBullets(bullets: string[]): string[] {
  if (!Array.isArray(bullets)) return [];

  return bullets.map(bullet => sanitizeHTML(bullet, 'resume'));
}

/**
 * Sanitize job description (may contain rich formatting from job boards)
 *
 * @param description - Job description HTML
 * @returns Sanitized HTML string
 */
export function sanitizeJobDescription(description: string): string {
  if (!description) return '';

  return sanitizeHTML(description, 'rich');
}

/**
 * Sanitize user input (strict mode - no HTML allowed)
 *
 * @param input - User input string
 * @returns Plain text with all HTML stripped
 */
export function sanitizeUserInput(input: string): string {
  if (!input) return '';

  return sanitizeHTML(input, 'strict');
}

/**
 * React hook for sanitizing HTML content
 *
 * @param html - HTML string to sanitize
 * @param level - Sanitization level
 * @returns Object with sanitized HTML and function to render it
 *
 * @example
 * ```tsx
 * function Component({ content }) {
 *   const { sanitized, renderSanitized } = useSanitizedHTML(content, 'basic');
 *
 *   return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
 *   // Or use the helper:
 *   return renderSanitized();
 * }
 * ```
 */
export function useSanitizedHTML(html: string, level: SanitizeLevel = 'basic') {
  const sanitized = sanitizeHTML(html, level);

  const renderSanitized = () => ({
    __html: sanitized,
  });

  return { sanitized, renderSanitized };
}

/**
 * Sanitize object with HTML values (recursively sanitizes all string values)
 *
 * @param obj - Object containing HTML strings
 * @param level - Sanitization level
 * @returns New object with all HTML values sanitized
 *
 * @example
 * ```typescript
 * const dirty = {
 *   name: '<script>alert("XSS")</script>John',
 *   bio: '<b>Developer</b> <script>evil()</script>'
 * };
 *
 * const clean = sanitizeObject(dirty, 'basic');
 * // Returns: { name: 'John', bio: '<b>Developer</b> ' }
 * ```
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  level: SanitizeLevel = 'basic'
): T {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = { ...obj };

  for (const key in sanitized) {
    const value = sanitized[key];

    if (typeof value === 'string') {
      sanitized[key] = sanitizeHTML(value, level) as any;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string' ? sanitizeHTML(item, level) : item
      ) as any;
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, level);
    }
  }

  return sanitized;
}

/**
 * Configure DOMPurify hooks for additional security
 *
 * This runs once when the module is imported.
 */
(function configureDOMPurify() {
  // Add hook to add rel="noopener noreferrer" to external links
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    // Set all elements owning target to target=_blank
    if ('target' in node) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }

    // Set non-HTML/MathML links to xlink:show=new
    if (
      !node.hasAttribute('target') &&
      (node.hasAttribute('xlink:href') || node.hasAttribute('href'))
    ) {
      node.setAttribute('xlink:show', 'new');
    }
  });
})();

/**
 * Security Best Practices:
 *
 * 1. ALWAYS sanitize user-generated content before rendering
 * 2. ALWAYS sanitize API responses that may contain HTML
 * 3. Use 'strict' mode for user inputs (forms, text fields)
 * 4. Use 'basic' or 'resume' mode for resume content
 * 5. Use 'rich' mode only for trusted content sources
 * 6. Never use dangerouslySetInnerHTML without sanitization
 * 7. Prefer React component rendering over innerHTML when possible
 *
 * Example usage in components:
 *
 * ```tsx
 * import { sanitizeHTML, sanitizeResumeSummary } from '@/lib/sanitizer';
 *
 * // For resume content
 * function ResumeSummary({ summary }: { summary: string }) {
 *   const cleanSummary = sanitizeResumeSummary(summary);
 *   return <div dangerouslySetInnerHTML={{ __html: cleanSummary }} />;
 * }
 *
 * // For user input (strip all HTML)
 * function UserComment({ comment }: { comment: string }) {
 *   const cleanComment = sanitizeHTML(comment, 'strict');
 *   return <p>{cleanComment}</p>;  // Render as text, not HTML
 * }
 * ```
 */
