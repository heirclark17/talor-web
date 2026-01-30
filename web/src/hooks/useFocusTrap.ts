import { useEffect, useRef, RefObject } from 'react'

/**
 * Custom hook for implementing accessible focus trapping in modals/dialogs.
 * WCAG 2.1 AA compliance: Focus should be trapped within modal when open.
 *
 * @param isActive - Whether the focus trap is active (modal is open)
 * @param options - Configuration options
 * @returns A ref to attach to the container element
 */
interface UseFocusTrapOptions {
  /** Whether to restore focus to the previously focused element when trap is deactivated */
  restoreFocus?: boolean
  /** Initial element to focus when trap activates (selector or ref) */
  initialFocus?: string | RefObject<HTMLElement>
}

const FOCUSABLE_SELECTORS = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
].join(', ')

export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  isActive: boolean,
  options: UseFocusTrapOptions = {}
): RefObject<T> {
  const { restoreFocus = true, initialFocus } = options
  const containerRef = useRef<T>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    // Store the currently focused element to restore later
    if (restoreFocus) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement
    }

    const container = containerRef.current

    // Get all focusable elements within the container
    const getFocusableElements = (): HTMLElement[] => {
      return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS))
        .filter(el => el.offsetParent !== null) // Filter out hidden elements
    }

    // Set initial focus
    const setInitialFocus = () => {
      let elementToFocus: HTMLElement | null = null

      if (typeof initialFocus === 'string') {
        elementToFocus = container.querySelector(initialFocus)
      } else if (initialFocus?.current) {
        elementToFocus = initialFocus.current
      }

      if (!elementToFocus) {
        const focusableElements = getFocusableElements()
        elementToFocus = focusableElements[0] || container
      }

      elementToFocus?.focus()
    }

    // Handle tab key to trap focus
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      // If shift+tab on first element, move to last
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
        return
      }

      // If tab on last element, move to first
      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
        return
      }

      // If focus is somehow outside the container, bring it back
      if (!container.contains(document.activeElement)) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    // Set initial focus after a brief delay to ensure DOM is ready
    requestAnimationFrame(setInitialFocus)

    // Add event listener
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown)

      // Restore focus to previously focused element
      if (restoreFocus && previouslyFocusedRef.current) {
        previouslyFocusedRef.current.focus()
      }
    }
  }, [isActive, initialFocus, restoreFocus])

  return containerRef as RefObject<T>
}

export default useFocusTrap
