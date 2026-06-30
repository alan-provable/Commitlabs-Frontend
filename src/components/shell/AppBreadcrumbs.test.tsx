import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { AppBreadcrumbs, buildBreadcrumbItems } from './AppBreadcrumbs'
import { AppShellLayout } from './AppShellLayout'

const navigation = vi.hoisted(() => ({ pathname: '/' }))

vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
}))

vi.mock('./AppSidebar', () => ({
  AppSidebar: () => <aside aria-label="Main navigation" />,
}))

describe('AppBreadcrumbs', () => {
  beforeEach(() => {
    navigation.pathname = '/'
  })

  afterEach(() => {
    cleanup()
  })

  it('does not render on top-level routes', () => {
    navigation.pathname = '/commitments'

    render(<AppBreadcrumbs />)

    expect(screen.queryByRole('navigation', { name: /breadcrumb/i })).not.toBeInTheDocument()
  })

  it('derives accessible breadcrumbs from nested route segments', () => {
    navigation.pathname = '/commitments/overview'

    render(<AppBreadcrumbs />)

    const nav = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(nav).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Commitments' })).toHaveAttribute('href', '/commitments')
    expect(screen.getByText('Overview')).toHaveAttribute('aria-current', 'page')
  })

  it('uses provided labels for commitment detail ids', () => {
    navigation.pathname = '/commitments/CMT-ABC123'

    render(<AppBreadcrumbs labelsBySegment={{ 'CMT-ABC123': 'Balanced Commitment #CMT-ABC123' }} />)

    expect(screen.getByRole('link', { name: 'Commitments' })).toHaveAttribute('href', '/commitments')
    expect(screen.getByText('Balanced Commitment #CMT-ABC123')).toHaveAttribute('aria-current', 'page')
  })

  it('falls back to a commitment id label when no friendly label is available', () => {
    const items = buildBreadcrumbItems('/commitments/unknown-xyz')

    expect(items).toEqual([
      { href: '/commitments', label: 'Commitments', current: false },
      { href: '/commitments/unknown-xyz', label: 'Commitment #unknown-xyz', current: true },
    ])
  })

  it('title-cases unknown nested segments outside commitment details', () => {
    const items = buildBreadcrumbItems('/marketplace/reward_settings')

    expect(items).toEqual([
      { href: '/marketplace', label: 'Marketplace', current: false },
      { href: '/marketplace/reward_settings', label: 'Reward Settings', current: true },
    ])
  })

  it('keeps malformed encoded segments readable instead of throwing', () => {
    const items = buildBreadcrumbItems('/commitments/%E0%A4%A')

    expect(items).toEqual([
      { href: '/commitments', label: 'Commitments', current: false },
      { href: '/commitments/%E0%A4%A', label: 'Commitment #%E0%A4%A', current: true },
    ])
  })

  it('renders through AppShellLayout so nested pages get breadcrumbs automatically', () => {
    navigation.pathname = '/commitments/42'

    render(
      <AppShellLayout breadcrumbLabels={{ 42: 'Commitment #42' }}>
        <section>Detail content</section>
      </AppShellLayout>
    )

    expect(screen.getByRole('complementary', { name: /main navigation/i })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument()
    expect(screen.getByText('Commitment #42')).toHaveAttribute('aria-current', 'page')
    expect(screen.getByText('Detail content')).toBeInTheDocument()
  })
})
