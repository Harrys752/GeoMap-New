/**
 * GeoMap Indonesia 2.0 — Data Confidence & Transparency Presentation Helper
 * 
 * Provides centralized, fail-safe mapping from raw source_verification_status strings
 * to visual badge classes, icons, human-readable labels, plain-language explanations,
 * and non-official disclaimers.
 * 
 * Bilingual UI Support (English & Bahasa Indonesia):
 * Single source of truth for confidence presentation metadata.
 * 
 * Guardrail Enforcement:
 * - Fail-safe status resolution: ONLY exact "verified" resolves to Verified Source.
 *   Null, undefined, empty string, whitespace, or unknown status strings map to "needs_review" / "unknown".
 * - Non-certification guardrail: Labels and explanations explain internal GeoMap dataset status
 *   and explicitly state that status is NOT an official external certification by UNESCO, ESDM, or USGS.
 */

import { getLanguage } from "../i18n/i18n.js";

export const NON_OFFICIAL_DISCLAIMER = "GeoMap internal dataset verification status — not an official external certification by UNESCO, ESDM, PVMBG, or USGS.";
export const NON_OFFICIAL_DISCLAIMER_ID = "Status verifikasi dataset internal GeoMap — bukan sertifikasi resmi eksternal oleh UNESCO, ESDM, PVMBG, atau USGS.";

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

export const CONFIDENCE_METADATA_MAP_ID = {
  verified: {
    statusKey: "verified",
    label: "Sumber Terverifikasi",
    badgeClass: "badge-confidence-verified",
    icon: "✓",
    symbol: "[Terverifikasi]",
    explanation: "Konten sumber secara langsung mendukung klaim lokasi, peristiwa, dan geologi yang ditampilkan."
  },
  partially_verified: {
    statusKey: "partially_verified",
    label: "Terverifikasi Sebagian",
    badgeClass: "badge-confidence-partially-verified",
    icon: "◐",
    symbol: "[Sebagian]",
    explanation: "Lokasi utama dan proses didukung oleh sumber; rincian sekunder atau verifikasi ilmiah penuh masih berlangsung."
  },
  needs_review: {
    statusKey: "needs_review",
    label: "Perlu Ditinjau",
    badgeClass: "badge-confidence-needs-review",
    icon: "⚠",
    symbol: "[Perlu Ditinjau]",
    explanation: "URL sumber mengarah ke portal umum, beranda, atau tautan yang memerlukan peninjauan lebih lanjut."
  },
  invalid: {
    statusKey: "invalid",
    label: "Sumber Tidak Valid",
    badgeClass: "badge-confidence-invalid",
    icon: "✖",
    symbol: "[Tidak Valid]",
    explanation: "URL sumber mati atau belum terkonfirmasi; rekaman disimpan untuk audit tanpa verifikasi."
  },
  missing: {
    statusKey: "missing",
    label: "Sumber Belum Lengkap",
    badgeClass: "badge-confidence-missing",
    icon: "?",
    symbol: "[Belum Lengkap]",
    explanation: "Rekaman saat ini belum memiliki URL sumber dalam dataset."
  },
  unknown: {
    statusKey: "unknown",
    label: "Status Tidak Diketahui",
    badgeClass: "badge-confidence-unknown",
    icon: "?",
    symbol: "[Tidak Diketahui]",
    explanation: "Status verifikasi tidak dikenali atau belum terklasifikasi; diperlakukan secara fail-safe untuk peninjauan."
  }
};

/**
 * Resolves a raw status string to fail-safe presentation metadata with bilingual support.
 * @param {string} rawStatus - Raw source_verification_status property value from feature
 * @param {string} [lang=null] - Language code ('en' | 'id'). If omitted or null, uses active language or defaults to English.
 * @returns {object} Confidence metadata object
 */
export function getConfidenceMetadata(rawStatus, lang = null) {
  const activeLang = lang || (typeof getLanguage === "function" ? getLanguage() : "en");
  const isId = activeLang === "id";
  const metaMap = isId ? CONFIDENCE_METADATA_MAP_ID : CONFIDENCE_METADATA_MAP;
  const disclaimer = isId ? NON_OFFICIAL_DISCLAIMER_ID : NON_OFFICIAL_DISCLAIMER;

  if (!rawStatus || typeof rawStatus !== "string") {
    return { ...metaMap.needs_review, disclaimer };
  }

  const normalized = rawStatus.trim().toLowerCase();

  switch (normalized) {
    case "verified":
      return { ...metaMap.verified, disclaimer };
    case "partially_verified":
      return { ...metaMap.partially_verified, disclaimer };
    case "needs_review":
      return { ...metaMap.needs_review, disclaimer };
    case "invalid":
      return { ...metaMap.invalid, disclaimer };
    case "missing":
      return { ...metaMap.missing, disclaimer };
    default:
      return { ...metaMap.unknown, disclaimer };
  }
}
