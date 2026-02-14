import { describe, it, expect } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { render, screen } from '@testing-library/react'

describe('Routing Integration', () => {
  it('should support basic routing', () => {
    render(
      <MemoryRouter initialEntries={['/test']}>
        <Routes>
          <Route path="/test" element={<div>Test Route</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Test Route')).toBeInTheDocument()
  })

  it('should support nested routes', () => {
    render(
      <MemoryRouter initialEntries={['/parent/child']}>
        <Routes>
          <Route path="/parent">
            <Route path="child" element={<div>Child Route</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Child Route')).toBeInTheDocument()
  })

  it('should support route parameters', () => {
    const TestComponent = () => <div>Param Route</div>

    render(
      <MemoryRouter initialEntries={['/item/123']}>
        <Routes>
          <Route path="/item/:id" element={<TestComponent />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Param Route')).toBeInTheDocument()
  })
})
