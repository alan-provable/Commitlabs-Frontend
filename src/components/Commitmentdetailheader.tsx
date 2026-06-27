'use client';

import React from 'react';
import { ArrowLeft, Share2 } from 'lucide-react';
import { useShareLink } from '@/hooks/useShareLink';

interface CommitmentDetailHeaderProps {
    commitmentId: string;
    statusLabel: string;
    statusVariant: 'active' | 'settled' | 'violated' | 'early_exit' | string;
    onBack: () => void;
    onShare?: () => void;
}

const statusConfig = {
    active: {
        color: 'text-[#0ff0fc]',
        bg: 'bg-[#0ff0fc]/10',
        border: 'border-[#0ff0fc]/20',
        dotColor: 'bg-[#0ff0fc]',
    },
    settled: {
        color: 'text-[#4ade80]',
        bg: 'bg-[#4ade80]/10',
        border: 'border-[#4ade80]/20',
        dotColor: 'bg-[#4ade80]',
    },
    violated: {
        color: 'text-[#ef4444]',
        bg: 'bg-[#ef4444]/10',
        border: 'border-[#ef4444]/20',
        dotColor: 'bg-[#ef4444]',
    },
    early_exit: {
        color: 'text-[#f59e0b]',
        bg: 'bg-[#f59e0b]/10',
        border: 'border-[#f59e0b]/20',
        dotColor: 'bg-[#f59e0b]',
    },
} as const;

export default function CommitmentDetailHeader({
    commitmentId,
    statusLabel,
    statusVariant,
    onBack,
    onShare,
}: CommitmentDetailHeaderProps) {
    const config = statusConfig[statusVariant as keyof typeof statusConfig] || statusConfig.active;
    const shareCommitment = useShareLink({
        commitmentId,
        title: `CommitLabs commitment ${commitmentId}`,
        text: 'View this CommitLabs commitment.',
    });
    const handleShare = onShare ?? shareCommitment;

    return (
        <header className="w-full space-y-4 sm:space-y-6">
            {/* Back Navigation */}
            <button
                onClick={onBack}
                className="group flex items-center gap-2 text-sm text-[#666] hover:text-[#0ff0fc] transition-all duration-200 focus:outline-none focus:text-[#0ff0fc] focus:drop-shadow-[0_0_8px_rgba(15,240,252,0.4)]"
                aria-label="Go back to My Commitments"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="group-hover:underline">Back to My Commitments</span>
            </button>

            {/* Main Header Content */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                {/* Left Section: ID and Status */}
                <div className="flex flex-col gap-3">
                    {/* Commitment ID */}
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-mono uppercase tracking-tight text-[#f5f5f7]">
                        {commitmentId}
                    </h1>

                    {/* Status Pill */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit ${config.bg} ${config.border} border`}>
                        <span className={`w-2 h-2 rounded-full ${config.dotColor} animate-pulse`} aria-hidden="true" />
                        <span className={`text-sm font-medium ${config.color}`}>
                            {statusLabel}
                        </span>
                    </div>
                </div>

                {/* Right Section: Share Button */}
                <button
                    onClick={handleShare}
                    className="group flex items-center gap-2 px-4 py-2.5 bg-[#0a0a0a] border border-[#222] rounded-full text-[#f5f5f7] text-sm font-medium hover:border-[#0ff0fc]/40 hover:bg-[#0ff0fc]/5 hover:shadow-[0_0_20px_rgba(15,240,252,0.15)] hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:border-[#0ff0fc]/60 focus:shadow-[0_0_24px_rgba(15,240,252,0.25)] focus-visible:ring-2 focus-visible:ring-[#0ff0fc] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] w-full sm:w-auto justify-center sm:justify-start"
                    aria-label="Share commitment"
                >
                    <Share2 className="w-4 h-4 group-hover:rotate-6 transition-transform" />
                    <span>Share</span>
                </button>
            </div>
        </header>
    );
}
'use client';

import React from 'react';
import { ArrowLeft, Share2 } from 'lucide-react';

interface CommitmentDetailHeaderProps {
    commitmentId: string;
    statusLabel: string;
    statusVariant: 'active' | 'settled' | 'violated' | 'early_exit' | string;
    onBack: () => void;
    onShare: () => void;
}

const statusConfig = {
    active: {
        color: 'text-[#0ff0fc]',
        bg: 'bg-[#0ff0fc]/10',
        border: 'border-[#0ff0fc]/20',
        dotColor: 'bg-[#0ff0fc]',
    },
    settled: {
        color: 'text-[#4ade80]',
        bg: 'bg-[#4ade80]/10',
        border: 'border-[#4ade80]/20',
        dotColor: 'bg-[#4ade80]',
    },
    violated: {
        color: 'text-[#ef4444]',
        bg: 'bg-[#ef4444]/10',
        border: 'border-[#ef4444]/20',
        dotColor: 'bg-[#ef4444]',
    },
    early_exit: {
        color: 'text-[#f59e0b]',
        bg: 'bg-[#f59e0b]/10',
        border: 'border-[#f59e0b]/20',
        dotColor: 'bg-[#f59e0b]',
    },
} as const;

export default function CommitmentDetailHeader({
    commitmentId,
    statusLabel,
    statusVariant,
    onBack,
    onShare,
}: CommitmentDetailHeaderProps) {
    const config = statusConfig[statusVariant as keyof typeof statusConfig] || statusConfig.active;

    return (
        <header className="w-full space-y-4 sm:space-y-6">
            {/* Back Navigation */}
            <button
                onClick={onBack}
                className="group flex items-center gap-2 text-sm text-[#666] hover:text-[#0ff0fc] transition-all duration-200 focus:outline-none focus:text-[#0ff0fc] focus:drop-shadow-[0_0_8px_rgba(15,240,252,0.4)]"
                aria-label="Go back to My Commitments"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="group-hover:underline">Back to My Commitments</span>
            </button>

            {/* Main Header Content */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                {/* Left Section: ID and Status */}
                <div className="flex flex-col gap-3">
                    {/* Commitment ID */}
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-mono uppercase tracking-tight text-[#f5f5f7]">
                        {commitmentId}
                    </h1>

                    {/* Status Pill */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit ${config.bg} ${config.border} border`}>
                        <span className={`w-2 h-2 rounded-full ${config.dotColor} animate-pulse`} aria-hidden="true" />
                        <span className={`text-sm font-medium ${config.color}`}>
                            {statusLabel}
                        </span>
                    </div>
                </div>

                {/* Right Section: Share Button */}
                <button
                    onClick={onShare}
                    className="group flex items-center gap-2 px-4 py-2.5 bg-[#0a0a0a] border border-[#222] rounded-full text-[#f5f5f7] text-sm font-medium hover:border-[#0ff0fc]/40 hover:bg-[#0ff0fc]/5 hover:shadow-[0_0_20px_rgba(15,240,252,0.15)] hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:border-[#0ff0fc]/60 focus:shadow-[0_0_24px_rgba(15,240,252,0.25)] w-full sm:w-auto justify-center sm:justify-start"
                    aria-label="Share commitment"
                >
                    <Share2 className="w-4 h-4 group-hover:rotate-6 transition-transform" />
                    <span>Share</span>
                </button>
            </div>
        </header>
    );
}
