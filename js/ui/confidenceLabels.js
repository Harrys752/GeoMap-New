/**
 * GeoMap Indonesia 2.0 — Data Confidence & Transparency Presentation Helper
 * 
 * Provides centralized, fail-safe mapping from raw source_verification_status strings
 * to visual badge classes, icons, human-readable labels, plain-language explanations,
 * and non-official disclaimers.
 * 
 * Guardrail Enforcement:
 * - Fail-safe status resolution: ONLY exact "verified" resolves to Verified Source.
 *   Null, undefined, empty string, whitespace, or unknown status strings map to "needs_review" / "unknown".
 * - Non-certification guardrail: Labels and explanations explain internal GeoMap dataset status
 *   and explicitly state that status is NOT an official external certification by UNESCO, ESDM, or USGS.
 */

export const NON_OFFICIAL_DISCLAIMER = "GeoMap internal dataset verification status — not an official external certification by UNESCO, ESDM, PVMBG, or USGS.";

export const CONFIDENCE_METADATA_MAP = {
  verified: {
    statusKey: "verified",
    label: "Verified Source",
    badgeClass: "badge-confidence-verified",
    icon: "✓",
    symbol: "[Verified]",
    explanation: "Source content directly supports displayed location, event, and geological claims."
  },
  partially_verified: {
    statusKey: "partially_verified",
    label: "Partially Verified",
    badgeClass: "badge-confidence-partially-verified",
    icon: "◐",
    symbol: "[Partial]",
    explanation: "Core location and process are supported; secondary details or full scientific verification remain in progress."
  },
  needs_review: {
    statusKey: "needs_review",
    label: "Needs Review",
    badgeClass: "badge-confidence-needs-review",
    icon: "⚠",
    symbol: "[Needs Review]",
    explanation: "Source URL points to a generic portal, homepage, or deep link requiring further review."
  },
  invalid: {
    statusKey: "invalid",
    label: "Invalid Source",
    badgeClass: "badge-confidence-invalid",
    icon: "✖",
    symbol: "[Invalid]",
    explanation: "Source URL is dead or unconfirmed; record preserved for audit without verification."
  },
  missing: {
    statusKey: "missing",
    label: "Missing Source",
    badgeClass: "badge-confidence-missing",
    icon: "?",
    symbol: "[Missing]",
    explanation: "Record currently lacks a source URL in the dataset."
  },
  unknown: {
    statusKey: "unknown",
    label: "Unknown Status",
    badgeClass: "badge-confidence-unknown",
    icon: "?",
    symbol: "[Unknown]",
    explanation: "Unrecognized or unclassified verification status; treated fail-safe for review."
  }
};

/**
 * Resolves a raw status string to fail-safe presentation metadata.
 * @param {string} rawStatus - Raw source_verification_status property value from feature
 * @returns {object} Confidence metadata object
 */
export function getConfidenceMetadata(rawStatus) {
  if (!rawStatus || typeof rawStatus !== "string") {
    return { ...CONFIDENCE_METADATA_MAP.needs_review, disclaimer: NON_OFFICIAL_DISCLAIMER };
  }

  const normalized = rawStatus.trim().toLowerCase();

  switch (normalized) {
    case "verified":
      return { ...CONFIDENCE_METADATA_MAP.verified, disclaimer: NON_OFFICIAL_DISCLAIMER };
    case "partially_verified":
      return { ...CONFIDENCE_METADATA_MAP.partially_verified, disclaimer: NON_OFFICIAL_DISCLAIMER };
    case "needs_review":
      return { ...CONFIDENCE_METADATA_MAP.needs_review, disclaimer: NON_OFFICIAL_DISCLAIMER };
    case "invalid":
      return { ...CONFIDENCE_METADATA_MAP.invalid, disclaimer: NON_OFFICIAL_DISCLAIMER };
    case "missing":
      return { ...CONFIDENCE_METADATA_MAP.missing, disclaimer: NON_OFFICIAL_DISCLAIMER };
    default:
      return { ...CONFIDENCE_METADATA_MAP.unknown, disclaimer: NON_OFFICIAL_DISCLAIMER };
  }
}
