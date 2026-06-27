// @vitest-environment happy-dom

import type { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MarketplaceResultsLayout } from "@/components/MarketplaceResultsLayout";

function renderLayout(
  props: Partial<ComponentProps<typeof MarketplaceResultsLayout>> = {},
) {
  const onViewModeChange = vi.fn();
  const onPageChange = vi.fn();

  render(
    <MarketplaceResultsLayout
      totalCount={42}
      viewMode="grid"
      onViewModeChange={onViewModeChange}
      currentPage={2}
      totalPages={4}
      onPageChange={onPageChange}
      {...props}
    >
      {props.children ?? <div data-testid="marketplace-results">Listings</div>}
    </MarketplaceResultsLayout>,
  );

  return { onPageChange, onViewModeChange };
}

describe("MarketplaceResultsLayout", () => {
  it("renders the result count, active view mode, and children", () => {
    renderLayout({
      totalCount: 0,
      viewMode: "list",
      children: <article>Empty result state</article>,
    });

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("commitments found")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Grid view" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "List view" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("Empty result state")).toBeInTheDocument();
  });

  it("calls the view mode change handler with the selected mode", () => {
    const { onViewModeChange } = renderLayout({ viewMode: "grid" });

    fireEvent.click(screen.getByRole("button", { name: "List view" }));
    fireEvent.click(screen.getByRole("button", { name: "Grid view" }));

    expect(onViewModeChange).toHaveBeenNthCalledWith(1, "list");
    expect(onViewModeChange).toHaveBeenNthCalledWith(2, "grid");
  });

  it("calls the page change handler for previous, next, and direct page clicks", () => {
    const { onPageChange } = renderLayout({
      currentPage: 2,
      totalPages: 4,
    });

    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    fireEvent.click(screen.getByRole("button", { name: "Page 3" }));
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
    expect(onPageChange).toHaveBeenNthCalledWith(3, 3);
  });

  it("disables previous on the first page and next on the last page", () => {
    const { rerender } = render(
      <MarketplaceResultsLayout
        totalCount={12}
        viewMode="grid"
        onViewModeChange={vi.fn()}
        currentPage={1}
        totalPages={3}
        onPageChange={vi.fn()}
      >
        <div>First page</div>
      </MarketplaceResultsLayout>,
    );

    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    rerender(
      <MarketplaceResultsLayout
        totalCount={12}
        viewMode="grid"
        onViewModeChange={vi.fn()}
        currentPage={3}
        totalPages={3}
        onPageChange={vi.fn()}
      >
        <div>Last page</div>
      </MarketplaceResultsLayout>,
    );

    expect(screen.getByRole("button", { name: "Previous page" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Page 3" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("disables both pagination controls when there is only one page", () => {
    renderLayout({
      currentPage: 1,
      totalPages: 1,
    });

    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
