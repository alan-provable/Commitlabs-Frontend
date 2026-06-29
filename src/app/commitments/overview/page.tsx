"use client";

import React, { useEffect, useState } from "react";
import { apiGet } from "@/lib/apiClient";
import { CommitmentDetailOverview } from "@/components/CommitmentDetailOverview";
import { AtRiskCommitments } from "@/components/dashboard/AtRiskCommitments";
import { OverviewWidgetGrid } from "@/components/dashboard/OverviewWidgetGrid";
import { useWidgetLayout } from "@/hooks/useWidgetLayout";
import { Commitment } from "@/lib/types/domain";
import OverviewTimeRangeSelector from "@/components/overview/OverviewTimeRangeSelector";
import { useOverviewTimeRange } from "@/hooks/useOverviewTimeRange";

export default function CommitmentOverviewPage() {
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);

  const { selectedRange, setRange, filterByRange } = useOverviewTimeRange();

  useEffect(() => {
    if (!atRiskVisible) return;
    async function loadCommitments() {
      setLoading(true);
      try {
        const data = await apiGet<{ data: Commitment[] }>("/api/commitments");
        if (data && Array.isArray(data.data)) {
          setCommitments(data.data);
        } else if (Array.isArray(data)) {
          setCommitments(data as unknown as Commitment[]);
        }
      } catch (err) {
        console.error("Failed to load commitments", err);
      } finally {
        setLoading(false);
      }
    }
    loadCommitments();
  }, [atRiskVisible]);

  const renderWidget = (id: string) => {
    switch (id) {
      case "at-risk":
        return <AtRiskCommitments commitments={commitments} />;
      case "commitment-detail":
        return (
          <CommitmentDetailOverview
            commitmentTypeLabel="Safe Commitment"
            currentValue="52,600"
            currentValueAsset="XLM"
            gainLossLabel="+5.20% (+2,600 XLM)"
            gainLossVariant="positive"
            initialAmount="50,000"
            initialAmountAsset="XLM"
            createdDate="Jan 10, 2026"
            expiresDate="Feb 9, 2026"
            daysRemaining={12}
            durationPercentComplete={87}
            complianceScore={95}
            complianceScoreLabel="Excellent compliance with commitment rules"
            maxLossThreshold="2%"
            currentDrawdown="0.8%"
            feesGenerated="$126"
          />
        );
      default:
        return null;
    }
  };

  const filteredCommitments = filterByRange(
    commitments,
    (c) => (c as Commitment & { createdAt?: string }).createdAt ?? new Date(0).toISOString()
  );

  return (
    <main className="min-h-screen w-full bg-[#0a0a0a] px-6 py-10 text-white">
      <div className="mx-auto w-full max-w-[1200px] flex flex-col gap-6">
        {/* Page header with time-range filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-white">Commitments Overview</h1>
          <OverviewTimeRangeSelector
            selected={selectedRange}
            onChange={setRange}
            aria-label="Filter overview by time range"
          />
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div
            className="animate-pulse h-24 bg-zinc-900 rounded-xl"
            role="status"
            aria-label="Loading commitments"
          />
        )}

        {/* Empty state per range */}
        {!loading && filteredCommitments.length === 0 && commitments.length > 0 && (
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center"
            role="status"
            aria-live="polite"
            data-testid="overview-empty-range-state"
          >
            <p className="text-zinc-400 text-sm">
              No commitments found for the selected time range. Try a wider range.
            </p>
          </div>
        )}

        {!loading && (
          <>
            <div className="w-full">
              <AtRiskCommitments commitments={filteredCommitments} />
            </div>
            <CommitmentDetailOverview
              commitmentTypeLabel="Safe Commitment"
              currentValue="52,600"
              currentValueAsset="XLM"
              gainLossLabel="+5.20% (+2,600 XLM)"
              gainLossVariant="positive"
              initialAmount="50,000"
              initialAmountAsset="XLM"
              createdDate="Jan 10, 2026"
              expiresDate="Feb 9, 2026"
              daysRemaining={12}
              durationPercentComplete={87}
              complianceScore={95}
              complianceScoreLabel="Excellent compliance with commitment rules"
              maxLossThreshold="2%"
              currentDrawdown="0.8%"
              feesGenerated="$126"
            />
          </>
        )}
      </div>
    </main>
  );
}
