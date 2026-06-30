'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useMemo } from 'react'

const STATIC_SEGMENT_LABELS: Record<string, string> = {
  commitments: 'Commitments',
  create: 'Create',
  marketplace: 'Marketplace',
  overview: 'Overview',
  settings: 'Settings',
}

interface BreadcrumbItem {
  href: string
  label: string
  current: boolean
}

export interface AppBreadcrumbsProps {
  labelsBySegment?: Record<string, string>
  className?: string
}

function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

function titleCaseSegment(segment: string): string {
  return segment
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getSegmentLabel(
  segment: string,
  parentSegment: string | undefined,
  labelsBySegment: Record<string, string>
): string {
  const decoded = decodeSegment(segment)
  const parent = parentSegment ? decodeSegment(parentSegment) : undefined

  if (labelsBySegment[decoded]) return labelsBySegment[decoded]
  if (labelsBySegment[segment]) return labelsBySegment[segment]
  if (STATIC_SEGMENT_LABELS[decoded]) return STATIC_SEGMENT_LABELS[decoded]

  if (parent === 'commitments') {
    return `Commitment #${decoded}`
  }

  return titleCaseSegment(decoded)
}

export function buildBreadcrumbItems(
  pathname: string,
  labelsBySegment: Record<string, string> = {}
): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length <= 1) return []

  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`

    return {
      href,
      label: getSegmentLabel(segment, segments[index - 1], labelsBySegment),
      current: index === segments.length - 1,
    }
  })
}

export const AppBreadcrumbs: React.FC<AppBreadcrumbsProps> = ({
  labelsBySegment = {},
  className = '',
}) => {
  const pathname = usePathname()
  const items = useMemo(
    () => buildBreadcrumbItems(pathname, labelsBySegment),
    [labelsBySegment, pathname]
  )

  if (items.length === 0) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className={`px-4 pt-5 sm:px-8 lg:px-12 ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-2 text-sm text-white/60">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center gap-2">
            {item.current ? (
              <span
                aria-current="page"
                className="max-w-[16rem] truncate font-medium text-white"
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="rounded-sm transition-colors hover:text-[#0FF0FC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0FF0FC]"
              >
                {item.label}
              </Link>
            )}
            {index < items.length - 1 && (
              <span aria-hidden="true" className="text-white/30">
                /
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
