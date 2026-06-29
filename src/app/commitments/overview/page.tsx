"use client";

import React, { useEffect, useState } from "react";
import { apiGet } from '@/lib/apiClient';
import { CommitmentDetailOverview } from "@/components/CommitmentDetailOverview";
import { AtRiskCommitments } from "@/components/dashboard/AtRiskCommitments";
import { OverviewWidgetGrid } from "@/components/dashboard/OverviewWidgetGrid";
import { useWidgetLayout } from "@/hooks/useWidgetLayout";
import { Commitment } from "@/lib/types/domain";

export default function CommitmentOverviewPage() {
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const { widgets, reorder, toggleVisibility, reset } = useWidgetLayout();

  const atRiskVisible = widgets.find((w) => w.id === "at-risk")?.visible ?? true;

  useEffect(() => {
    if (!atRiskVisible) return;
    async function loadCommitments() {
      try {
        const data = await apiGet<{ data: Commitment[] }>('/api/commitments');
        if (data && Array.isArray(data.data)) {
          setCommitments(data.data);
        } else if (Array.isArray(data)) {
          setCommitments(data as unknown as Commitment[]);
        }
      } catch (err) {
        console.error("Failed to load commitments", err);
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

  return (
    <main className="min-h-screen w-full bg-[#0a0a0a] px-6 py-10 text-white">
      <div className="mx-auto w-full max-w-[1200px]">
        <OverviewWidgetGrid
          widgets={widgets}
          onReorder={reorder}
          onToggleVisibility={toggleVisibility}
          onReset={reset}
        >
          {renderWidget}
        </OverviewWidgetGrid>
      </div>
    </main>
  );
}
