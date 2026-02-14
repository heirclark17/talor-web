import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import {
  Skeleton,
  SkeletonCard,
  SkeletonListItem,
  SkeletonTableRow,
  SkeletonResumeComparison,
  SkeletonInterviewPrep,
  SkeletonCareerPath,
} from './SkeletonLoader'

describe('Skeleton Component', () => {
  describe('Default Behavior', () => {
    it('should render with default props', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.firstChild as HTMLElement

      expect(skeleton).toBeInTheDocument()
      expect(skeleton).toHaveClass('bg-theme-glass-10')
      expect(skeleton).toHaveClass('rounded') // text variant default
      expect(skeleton).toHaveClass('h-4')
      expect(skeleton).toHaveClass('animate-pulse') // pulse animation default
      expect(skeleton).toHaveAttribute('role', 'status')
      expect(skeleton).toHaveAttribute('aria-label', 'Loading...')
    })
  })

  describe('Variant Prop', () => {
    it('should apply text variant classes', () => {
      const { container } = render(<Skeleton variant="text" />)
      const skeleton = container.firstChild as HTMLElement

      expect(skeleton).toHaveClass('rounded')
      expect(skeleton).toHaveClass('h-4')
    })

    it('should apply circular variant classes', () => {
      const { container } = render(<Skeleton variant="circular" />)
      const skeleton = container.firstChild as HTMLElement

      expect(skeleton).toHaveClass('rounded-full')
    })

    it('should apply rectangular variant classes', () => {
      const { container } = render(<Skeleton variant="rectangular" />)
      const skeleton = container.firstChild as HTMLElement

      expect(skeleton).toHaveClass('bg-theme-glass-10')
      // Rectangular has no additional variant classes
    })

    it('should apply rounded variant classes', () => {
      const { container } = render(<Skeleton variant="rounded" />)
      const skeleton = container.firstChild as HTMLElement

      expect(skeleton).toHaveClass('rounded-lg')
    })
  })

  describe('Animation Prop', () => {
    it('should apply pulse animation by default', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.firstChild as HTMLElement

      expect(skeleton).toHaveClass('animate-pulse')
    })

    it('should apply wave animation when specified', () => {
      const { container } = render(<Skeleton animation="wave" />)
      const skeleton = container.firstChild as HTMLElement

      expect(skeleton).toHaveClass('animate-shimmer')
    })

    it('should apply no animation when none specified', () => {
      const { container } = render(<Skeleton animation="none" />)
      const skeleton = container.firstChild as HTMLElement

      expect(skeleton).not.toHaveClass('animate-pulse')
      expect(skeleton).not.toHaveClass('animate-shimmer')
    })
  })

  describe('Width and Height Props', () => {
    it('should apply width as number in pixels', () => {
      const { container } = render(<Skeleton width={200} />)
      const skeleton = container.firstChild as HTMLElement

      expect(skeleton).toHaveStyle({ width: '200px' })
    })

    it('should apply width as string', () => {
      const { container } = render(<Skeleton width="50%" />)
      const skeleton = container.firstChild as HTMLElement

      expect(skeleton).toHaveStyle({ width: '50%' })
    })

    it('should apply height as number in pixels', () => {
      const { container } = render(<Skeleton height={100} />)
      const skeleton = container.firstChild as HTMLElement

      expect(skeleton).toHaveStyle({ height: '100px' })
    })

    it('should apply height as string', () => {
      const { container } = render(<Skeleton height="10rem" />)
      const skeleton = container.firstChild as HTMLElement

      expect(skeleton).toHaveStyle({ height: '10rem' })
    })

    it('should apply both width and height', () => {
      const { container } = render(<Skeleton width={150} height={50} />)
      const skeleton = container.firstChild as HTMLElement

      expect(skeleton).toHaveStyle({ width: '150px', height: '50px' })
    })
  })

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const { container } = render(<Skeleton className="custom-class" />)
      const skeleton = container.firstChild as HTMLElement

      expect(skeleton).toHaveClass('custom-class')
      expect(skeleton).toHaveClass('bg-theme-glass-10') // Base class still applied
    })
  })

  describe('Combined Props', () => {
    it('should handle all props together', () => {
      const { container } = render(
        <Skeleton
          variant="circular"
          width={64}
          height={64}
          animation="wave"
          className="test-class"
        />
      )
      const skeleton = container.firstChild as HTMLElement

      expect(skeleton).toHaveClass('rounded-full')
      expect(skeleton).toHaveClass('animate-shimmer')
      expect(skeleton).toHaveClass('test-class')
      expect(skeleton).toHaveStyle({ width: '64px', height: '64px' })
    })
  })
})

describe('SkeletonCard Component', () => {
  it('should render card structure', () => {
    const { container } = render(<SkeletonCard />)

    expect(container.querySelector('.glass')).toBeInTheDocument()
    expect(container.querySelector('.rounded-xl')).toBeInTheDocument()
  })

  it('should render circular avatar skeleton', () => {
    const { container } = render(<SkeletonCard />)

    const circular = container.querySelector('.rounded-full')
    expect(circular).toBeInTheDocument()
  })

  it('should render multiple text skeletons', () => {
    const { container } = render(<SkeletonCard />)

    const textSkeletons = container.querySelectorAll('.rounded.h-4')
    expect(textSkeletons.length).toBeGreaterThan(0)
  })

  it('should apply custom className', () => {
    const { container } = render(<SkeletonCard className="custom-card" />)

    expect(container.firstChild).toHaveClass('custom-card')
  })
})

describe('SkeletonListItem Component', () => {
  it('should render list item structure', () => {
    const { container } = render(<SkeletonListItem />)

    expect(container.querySelector('.glass')).toBeInTheDocument()
    expect(container.querySelector('.rounded-xl')).toBeInTheDocument()
  })

  it('should render rounded image skeleton', () => {
    const { container } = render(<SkeletonListItem />)

    const rounded = container.querySelector('.rounded-lg')
    expect(rounded).toBeInTheDocument()
  })

  it('should render circular action skeleton', () => {
    const { container } = render(<SkeletonListItem />)

    const circular = container.querySelector('.rounded-full')
    expect(circular).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(<SkeletonListItem className="custom-list-item" />)

    expect(container.firstChild).toHaveClass('custom-list-item')
  })
})

describe('SkeletonTableRow Component', () => {
  it('should render table row with default 4 columns', () => {
    const { container } = render(
      <table>
        <tbody>
          <SkeletonTableRow />
        </tbody>
      </table>
    )

    const cells = container.querySelectorAll('td')
    expect(cells).toHaveLength(4)
  })

  it('should render table row with custom column count', () => {
    const { container } = render(
      <table>
        <tbody>
          <SkeletonTableRow columns={6} />
        </tbody>
      </table>
    )

    const cells = container.querySelectorAll('td')
    expect(cells).toHaveLength(6)
  })

  it('should apply border styling', () => {
    const { container } = render(
      <table>
        <tbody>
          <SkeletonTableRow />
        </tbody>
      </table>
    )

    const row = container.querySelector('tr')
    expect(row).toHaveClass('border-b')
    expect(row).toHaveClass('border-theme-subtle')
  })

  it('should render skeleton in each cell', () => {
    const { container } = render(
      <table>
        <tbody>
          <SkeletonTableRow columns={3} />
        </tbody>
      </table>
    )

    const cells = container.querySelectorAll('td')
    cells.forEach(cell => {
      expect(cell.querySelector('.rounded.h-4')).toBeInTheDocument()
    })
  })
})

describe('SkeletonResumeComparison Component', () => {
  it('should render grid layout', () => {
    const { container } = render(<SkeletonResumeComparison />)

    const grid = container.querySelector('.grid')
    expect(grid).toBeInTheDocument()
    expect(grid).toHaveClass('grid-cols-1')
    expect(grid).toHaveClass('lg:grid-cols-2')
  })

  it('should render two resume panels', () => {
    const { container } = render(<SkeletonResumeComparison />)

    const panels = container.querySelectorAll('.glass.rounded-xl')
    expect(panels).toHaveLength(2)
  })

  it('should render multiple experience sections per panel', () => {
    const { container } = render(<SkeletonResumeComparison />)

    // Each panel has 3 experience sections
    const textSkeletons = container.querySelectorAll('.rounded.h-4')
    expect(textSkeletons.length).toBeGreaterThan(6) // At least 6 sections total
  })
})

describe('SkeletonInterviewPrep Component', () => {
  it('should render header with circular avatar', () => {
    const { container } = render(<SkeletonInterviewPrep />)

    const circular = container.querySelector('.rounded-full')
    expect(circular).toBeInTheDocument()
  })

  it('should render grid of cards', () => {
    const { container } = render(<SkeletonInterviewPrep />)

    const grid = container.querySelector('.grid')
    expect(grid).toBeInTheDocument()
    expect(grid).toHaveClass('grid-cols-1')
    expect(grid).toHaveClass('sm:grid-cols-2')
    expect(grid).toHaveClass('lg:grid-cols-3')
  })

  it('should render 6 skeleton cards', () => {
    const { container } = render(<SkeletonInterviewPrep />)

    const cards = container.querySelectorAll('.glass.rounded-xl.p-6')
    expect(cards.length).toBeGreaterThanOrEqual(6)
  })
})

describe('SkeletonCareerPath Component', () => {
  it('should render progress bar with circles', () => {
    const { container } = render(<SkeletonCareerPath />)

    const circles = container.querySelectorAll('.rounded-full')
    expect(circles).toHaveLength(5) // 5 step indicators
  })

  it('should render connecting lines between steps', () => {
    const { container } = render(<SkeletonCareerPath />)

    // 4 connecting lines between 5 circles
    const lines = Array.from(container.querySelectorAll('.rounded.h-4')).filter(el => {
      return el.classList.contains('flex-1')
    })
    expect(lines.length).toBeGreaterThanOrEqual(4)
  })

  it('should render form fields section', () => {
    const { container } = render(<SkeletonCareerPath />)

    const formSection = container.querySelector('.glass.rounded-xl')
    expect(formSection).toBeInTheDocument()
  })

  it('should render grid of form fields', () => {
    const { container } = render(<SkeletonCareerPath />)

    const grid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2')
    expect(grid).toBeInTheDocument()
  })

  it('should render 4 form field skeletons', () => {
    const { container } = render(<SkeletonCareerPath />)

    const roundedSkeletons = container.querySelectorAll('.rounded-lg')
    // At least 4 rounded skeletons for form fields
    expect(roundedSkeletons.length).toBeGreaterThanOrEqual(4)
  })
})
