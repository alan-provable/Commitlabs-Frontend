import { describe, expect, it, beforeEach, vi } from "vitest";

import { BackendError } from "@/lib/backend/errors";
import { getCommitmentFromChain } from "@/lib/backend/services/contracts";

import { createMockRequest } from "./helpers";
import { GET } from "../../src/app/api/commitments/[id]/route";

vi.mock("@/lib/backend/services/contracts", () => ({
  getCommitmentFromChain: vi.fn(),
}));

vi.mock("@/utils/soroban", () => ({
  contractAddresses: {
    commitmentNFT: "CNFTCONTRACT",
  },
}));

const mockedGetCommitmentFromChain = vi.mocked(getCommitmentFromChain);

function makeRequest(commitmentId: string) {
  return createMockRequest(`http://localhost:3000/api/commitments/${commitmentId}`, {
    headers: {
      "x-correlation-id": "corr-detail",
    },
  });
}

function makeContext(commitmentId: string) {
  return {
    params: {
      id: commitmentId,
    },
  };
}

const futureExpiresAt = new Date(
  Date.now() + 14 * 24 * 60 * 60 * 1000,
).toISOString();

const chainCommitment = {
  id: "commitment-123",
  ownerAddress: "GOWNER123",
  rules: {
    maxLossPercent: 18,
    reviewWindowDays: 7,
  },
  amount: 125000000n,
  asset: "USDC",
  createdAt: "2026-01-15T12:00:00.000Z",
  expiresAt: futureExpiresAt,
  currentValue: 119000000n,
  status: "ACTIVE",
  drawdownPercent: 4.8,
  tokenId: "nft-123",
  contractVersion: "v2",
};

describe("GET /api/commitments/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the canonical commitment detail DTO for a known id", async () => {
    mockedGetCommitmentFromChain.mockResolvedValue(chainCommitment);

    const response = await GET(makeRequest("commitment-123"), makeContext("commitment-123"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toMatchObject({
      commitmentId: "commitment-123",
      owner: "GOWNER123",
      rules: {
        maxLossPercent: 18,
        reviewWindowDays: 7,
      },
      amount: "125000000",
      asset: "USDC",
      createdAt: "2026-01-15T12:00:00.000Z",
      expiresAt: futureExpiresAt,
      currentValue: "119000000",
      status: "ACTIVE",
      drawdownPercent: 4.8,
      maxLossPercent: 18,
      tokenId: "nft-123",
      nftMetadataLink: "CNFTCONTRACT/metadata/commitment-123",
      contractVersion: "v2",
    });
    expect(body.data.daysRemaining).toBeGreaterThan(0);
    expect(body.meta.correlationId).toBe("corr-detail");
    expect(mockedGetCommitmentFromChain).toHaveBeenCalledWith("commitment-123", {
      requestId: "corr-detail",
    });
  });

  it("uses commitmentId and owner fallbacks when chain data omits id aliases", async () => {
    mockedGetCommitmentFromChain.mockResolvedValue({
      commitmentId: "commitment-fallback",
      owner: "GFALLBACK",
      amount: "500",
      asset: "XLM",
      createdAt: "2026-02-01T00:00:00.000Z",
      expiresAt: undefined,
      currentValue: "500",
      status: "PENDING",
      rules: undefined,
      contractVersion: "v1",
    });

    const response = await GET(
      makeRequest("commitment-fallback"),
      makeContext("commitment-fallback"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toMatchObject({
      commitmentId: "commitment-fallback",
      owner: "GFALLBACK",
      rules: null,
      amount: "500",
      asset: "XLM",
      currentValue: "500",
      status: "PENDING",
      daysRemaining: null,
      drawdownPercent: null,
      maxLossPercent: null,
      tokenId: null,
      nftMetadataLink: "CNFTCONTRACT/metadata/commitment-fallback",
      contractVersion: "v1",
    });
    expect(body.data).not.toHaveProperty("expiresAt");
  });

  it("returns the standard not-found envelope when the chain read reports NOT_FOUND", async () => {
    mockedGetCommitmentFromChain.mockRejectedValue(
      new BackendError({
        code: "NOT_FOUND",
        message: "Missing commitment",
        status: 404,
      }),
    );

    const response = await GET(makeRequest("missing-id"), makeContext("missing-id"));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toMatchObject({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Commitment not found.",
        details: {
          commitmentId: "missing-id",
        },
        correlationId: "corr-detail",
      },
    });
  });

  it("returns 404 when the chain read resolves without commitment identity", async () => {
    mockedGetCommitmentFromChain.mockResolvedValue({
      ownerAddress: "GOWNER123",
      amount: "100",
      asset: "USDC",
    });

    const response = await GET(makeRequest("empty-id"), makeContext("empty-id"));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toMatchObject({
      code: "NOT_FOUND",
      details: {
        commitmentId: "empty-id",
      },
    });
  });

  it("maps malformed id read failures to validation errors", async () => {
    mockedGetCommitmentFromChain.mockRejectedValue(new Error("malformed commitment id"));

    const response = await GET(makeRequest("bad-id"), makeContext("bad-id"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        message: "The transaction was rejected due to invalid parameters or state.",
        details: {
          commitmentId: "bad-id",
          retryable: false,
        },
      },
    });
  });

  it("maps upstream read failures to a 502 blockchain failure response", async () => {
    mockedGetCommitmentFromChain.mockRejectedValue(new Error("rpc exploded"));

    const response = await GET(makeRequest("commitment-123"), makeContext("commitment-123"));
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body).toMatchObject({
      error: {
        code: "BLOCKCHAIN_CALL_FAILED",
        message: "Unable to fetch commitment from chain.",
        details: {
          commitmentId: "commitment-123",
          retryable: false,
        },
      },
    });
  });
});
