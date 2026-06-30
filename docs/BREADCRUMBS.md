# App Shell Breadcrumbs

## Overview

`AppBreadcrumbs` adds route-aware breadcrumbs for nested app-shell routes. It is mounted by `AppShellLayout`, derives items from the current `usePathname()` segments, and hides itself on top-level routes where a crumb trail would repeat the page location.

## Behavior

- Top-level routes such as `/commitments` and `/settings` do not render breadcrumbs.
- Nested routes such as `/commitments/overview` render a breadcrumb trail in a semantic `nav` with `aria-label="Breadcrumb"`.
- Parent crumbs are links. The final crumb is plain text with `aria-current="page"`.
- Static route segments use readable labels such as `Commitments`, `Overview`, and `Marketplace`.
- Commitment detail ids fall back to `Commitment #<id>` when no friendlier label is available.

## Friendly Labels

Pages or layouts can provide friendly labels through `AppShellLayout`:

```tsx
<AppShellLayout breadcrumbLabels={{ [params.id]: `Commitment #${params.id}` }}>
  {children}
</AppShellLayout>
```

This keeps the breadcrumb independent from page headings while still letting nested pages resolve dynamic route segments to readable labels.

## Accessibility

The breadcrumb trail uses semantic navigation and ordered-list markup. Parent crumbs are keyboard-focusable links with a visible focus outline. The current page crumb uses `aria-current="page"` and is not rendered as a link, which avoids a redundant self-link.
