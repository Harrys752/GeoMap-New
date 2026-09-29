/**
 * Shared Domain-Aware Detail Panel Drawer Component
 * Phase 1 Structured Educational View Layout with strict conditional rendering.
 * Supports full bilingual display (English & Bahasa Indonesia).
 */

import { adaptGeologyFeature } from "../data/adapters/geologyAdapter.js";
import { adaptHazardFeature } from "../data/adapters/hazardAdapter.js";
import { EVIDENCE_EDUCATIONAL_GUIDE } from "../data/evidenceGuideData.js";
import { getConfidenceMetadata } from "./confidenceLabels.js";
import { getLanguage, t } from "../i18n/i18n.js";

/**
 * Initializes the detail panel drawer.
 * @param {string} panelId - DOM ID for detail panel drawer
 * @param {string} closeBtnId - DOM ID for panel close button
 */
export function initDetailPanel(panelId = "detail-panel", closeBtnId = "detail-close-btn") {
  const panelEl = document.getElementById(panelId);
  const closeBtn = document.getElementById(closeBtnId);
  const contentEl = document.getElementById("detail-panel-content");

  let currentFeature = null;

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      closeDetailPanel();
    });
  }

  function closeDetailPanel() {
    currentFeature = null;
    if (panelEl) {
      panelEl.classList.remove("open");
      panelEl.setAttribute("aria-hidden", "true");
    }
    const layerSwitcher = document.querySelector(".ol-control-layers");
    if (layerSwitcher) {
      layerSwitcher.classList.remove("detail-panel-active-hide");
    }
  }

  /**
   * Opens detail panel and populates content based on feature domain.
   * @param {object} feature - GeoJSON feature object
   * @param {string} [lang=null] - Target language code
   */
  function openDetailPanel(feature, lang = null) {
    if (!panelEl || !contentEl || !feature) return;
    currentFeature = feature;

    const activeLang = lang || getLanguage();

    const layerSwitcher = document.querySelector(".ol-control-layers");
    if (layerSwitcher) {
      layerSwitcher.classList.add("detail-panel-active-hide");
      const switcherPanel = layerSwitcher.querySelector(".ol-layers-panel");
      if (switcherPanel) switcherPanel.classList.add("hidden");
    }

    const domain = feature.properties ? feature.properties.domain : null;
    let data = null;

    if (domain === "geology") {
      data = adaptGeologyFeature(feature, activeLang);
    } else if (domain === "hazard") {
      data = adaptHazardFeature(feature, activeLang);
    } else {
      console.warn(`[Detail Panel] Unknown domain '${domain}'`);
      return;
    }

    contentEl.innerHTML = renderDetailContent(data, activeLang);
    panelEl.classList.add("open");
    panelEl.setAttribute("aria-hidden", "false");
    panelEl.scrollTop = 0;
  }

  /**
   * Refreshes the currently displayed feature with a new language if panel is currently open.
   * @param {string} lang - Target language code
   */
  function updateLanguage(lang) {
    if (panelEl && panelEl.classList.contains("open") && currentFeature) {
      openDetailPanel(currentFeature, lang);
    }
  }

  function getCurrentFeature() {
    return currentFeature;
  }

  function isOpen() {
    return panelEl ? panelEl.classList.contains("open") : false;
  }

  return {
    openDetailPanel,
    closeDetailPanel,
    updateLanguage,
    getCurrentFeature,
    isOpen
  };
}

/**
 * Builds HTML string for detail panel content adhering to Section 6.1 specification.
 * @param {object} data - Normalized adapter data object
 * @param {string} [lang=null] - Target language code
 * @returns {string} HTML markup
 */
export function renderDetailContent(data, lang = null) {
  const activeLang = lang || data.activeLang || getLanguage();
  const domainClass = data.domain === "geology" ? "domain-geology" : "domain-hazard";
  const statusBadgeClass = `badge-status badge-${data.dataStatus}`;
  const isIllustrative = data.sourceType === "illustrative" || data.dataStatus === "illustrative";

  // Determine Source Claim Label
  let sourceClaimLabel = t("source_claim_direct", {}, activeLang);
  if (data.sourceType === "educational_interpretation") {
    sourceClaimLabel = t("source_claim_interpretation", {}, activeLang);
  } else if (isIllustrative) {
    sourceClaimLabel = t("source_claim_illustrative", {}, activeLang);
  }

  // 1. Quick Facts Section (Conditional)
  let quickFactsBlock = "";
  if (data.quickFacts && Object.keys(data.quickFacts).length > 0) {
    quickFactsBlock = `
      <section class="detail-section section-quick-facts">
        <h3 class="section-title">${escapeHtml(t("detail_quick_facts_title", {}, activeLang))}</h3>
        <dl class="quick-facts-grid">
          ${Object.entries(data.quickFacts).map(([label, val]) => `
            <div class="quick-fact-item">
              <dt>${escapeHtml(label)}</dt>
              <dd>${escapeHtml(val)}</dd>
            </div>
          `).join("")}
        </dl>
      </section>
    `;
  }

  // 2. Geological Context Section (Geology Domain Only)
  let geologicalContextBlock = "";
  if (data.domain === "geology" && data.geologicalContext) {
    geologicalContextBlock = `
      <section class="detail-section section-geo-context">
        <h3 class="section-title">${escapeHtml(t("detail_geo_context_title", {}, activeLang))}</h3>
        <p class="section-paragraph">${escapeHtml(data.geologicalContext)}</p>
      </section>
    `;
  }

  // 3. Paleontological Record Section (feature_type: paleontology_site Only)
  let paleontologyBlock = "";
  if (data.featureType === "paleontology_site" && data.paleontologicalRecord) {
    paleontologyBlock = `
      <section class="detail-section section-paleo">
        <h3 class="section-title">${escapeHtml(t("detail_paleo_title", {}, activeLang))}</h3>
        <dl class="field-list">
          ${Object.entries(data.paleontologicalRecord).map(([label, val]) => `
            <div class="field-item">
              <dt>${escapeHtml(label)}</dt>
              <dd>${escapeHtml(val)}</dd>
            </div>
          `).join("")}
        </dl>
      </section>
    `;
  }

  // 4. Geohazard Context Section (Hazard Domain Only)
  let geohazardContextBlock = "";
  if (data.domain === "hazard" && data.geohazardContext) {
    geohazardContextBlock = `
      <section class="detail-section section-hazard">
        <h3 class="section-title">${escapeHtml(t("detail_hazard_context_title", {}, activeLang))}</h3>
        <p class="section-paragraph">${escapeHtml(data.geohazardContext)}</p>
      </section>
    `;
  }

  // 5. Geological Evidence Section (Phase 4 — Conditional)
  let evidenceBlock = "";
  const hasEvidence = data.evidenceType && data.evidenceDescription && data.evidenceSignificance;

  if (hasEvidence) {
    const guideEntry = EVIDENCE_EDUCATIONAL_GUIDE[data.evidenceType];
    const generalClaimText = guideEntry ? guideEntry.generalClaim : null;
    const claim1Title = t("evidence_claim_1_title", { evidenceType: data.evidenceType }, activeLang);
    const claim2Title = t("evidence_claim_2_title", {}, activeLang);
    const claim3Title = t("evidence_claim_3_title", { sourceClaimLabel }, activeLang);

    const generalClaimHtml = generalClaimText ? `
      <div class="evidence-subclaim general-claim">
        <strong>${escapeHtml(claim1Title)}</strong>
        <p>${escapeHtml(generalClaimText)}</p>
      </div>
    ` : "";

    evidenceBlock = `
      <section class="detail-section section-evidence">
        <h3 class="section-title">${escapeHtml(t("detail_evidence_title", {}, activeLang))}</h3>
        <div class="evidence-card">
          ${generalClaimHtml}
          <div class="evidence-subclaim location-claim">
            <strong>${escapeHtml(claim2Title)}</strong>
            <div class="evidence-badge-row">
              <span class="evidence-type-badge">${escapeHtml(data.evidenceType)}</span>
            </div>
            <p>${escapeHtml(data.evidenceDescription)}</p>
          </div>
          <div class="evidence-subclaim source-claim">
            <strong>${escapeHtml(claim3Title)}</strong>
            <p>${escapeHtml(data.evidenceSignificance)}</p>
          </div>
        </div>
      </section>
    `;
  }

  // 6. Why It Matters Section (Conditional)
  let whyItMattersBlock = "";
  if (data.whyItMatters) {
    whyItMattersBlock = `
      <section class="detail-section section-why-matters">
        <h3 class="section-title">${escapeHtml(t("detail_why_matters_title", {}, activeLang))}</h3>
        <div class="why-matters-card">
          <span class="why-icon">&#128161;</span>
          <p class="why-text">${escapeHtml(data.whyItMatters)}</p>
        </div>
      </section>
    `;
  }

  // 7. Source & Data Status Section
  const isValidUrl = data.sourceUrl && (data.sourceUrl.startsWith("http://") || data.sourceUrl.startsWith("https://"));
  const sourceUrlHtml = isValidUrl ? `
    <div class="field-item field-full">
      <dt>${escapeHtml(t("meta_primary_source_link", {}, activeLang))}</dt>
      <dd>
        <a href="${escapeHtml(data.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="source-link">
          ${t("meta_open_source_publication", {}, activeLang)}
        </a>
      </dd>
    </div>
  ` : "";

  const sourceTypeLabel = formatSourceTypeLabel(data.sourceType, activeLang);
  const sourceTypeBadge = `
    <div class="field-item">
      <dt>${escapeHtml(t("meta_source_classification", {}, activeLang))}</dt>
      <dd>${escapeHtml(sourceTypeLabel)}</dd>
    </div>
  `;

  const confidenceMeta = getConfidenceMetadata(data.sourceVerificationStatus, activeLang);
  const verifStatusBadge = `
    <div class="field-item field-full confidence-card-wrap">
      <dt>${escapeHtml(t("meta_data_confidence_status", {}, activeLang))}</dt>
      <dd>
        <div class="confidence-badge-box ${escapeHtml(confidenceMeta.badgeClass)}">
          <span class="confidence-badge-icon" aria-hidden="true">${escapeHtml(confidenceMeta.icon)}</span>
          <span class="confidence-badge-label">${escapeHtml(confidenceMeta.label)}</span>
        </div>
        <p class="confidence-explanation">${escapeHtml(confidenceMeta.explanation)}</p>
        <p class="confidence-disclaimer">${escapeHtml(confidenceMeta.disclaimer)}</p>
        <div class="confidence-audit-link-wrap">
          <a href="docs/phase6-record-level-source-audit.md" target="_blank" rel="noopener noreferrer" class="confidence-audit-link">
            ${t("meta_view_audit_document", {}, activeLang)}
          </a>
        </div>
      </dd>
    </div>
  `;

  // Distinct Date Display
  let datesBlock = "";
  if (data.featureType === "historical_event" || data.eventDate) {
    let eventDateText = data.eventDate || "Unspecified Event Date";
    if (data.eventEndDate) {
      eventDateText += ` – ${data.eventEndDate}`;
      if (data.eventDatePrecision === "multi_year_range") {
        eventDateText += ` ${t("meta_multi_year_range", {}, activeLang)}`;
      }
    }
    datesBlock = `
      <div class="field-item">
        <dt>${escapeHtml(t("meta_event_date", {}, activeLang))}</dt>
        <dd><strong>${escapeHtml(eventDateText)}</strong></dd>
      </div>
      <div class="field-item">
        <dt>${escapeHtml(t("meta_record_compilation_date", {}, activeLang))}</dt>
        <dd>${escapeHtml(data.recordCompilationDate || data.lastUpdated)}</dd>
      </div>
    `;
  } else {
    datesBlock = `
      <div class="field-item">
        <dt>${escapeHtml(t("meta_record_compilation_date", {}, activeLang))}</dt>
        <dd>${escapeHtml(data.recordCompilationDate || data.lastUpdated)}</dd>
      </div>
    `;
  }

  const illustrativeBadgeHtml = isIllustrative ? `
    <span class="badge-status badge-illustrative">${escapeHtml(t("status_illustrative", {}, activeLang))}</span>
  ` : "";

  let geomStatusBadge = "";
  if (data.geometryStatus) {
    const geomLabel = data.geometryStatus === "verified"
      ? t("geom_status_verified", {}, activeLang)
      : (data.geometryStatus === "partially_verified" ? t("geom_status_partially_verified", {}, activeLang) : t("geom_status_needs_review", {}, activeLang));
    const geomBadgeClass = data.geometryStatus === "verified"
      ? "badge-confidence-verified"
      : (data.geometryStatus === "partially_verified" ? "badge-confidence-partially-verified" : "badge-confidence-needs-review");

    geomStatusBadge = `
      <div class="field-item">
        <dt>${escapeHtml(t("meta_spatial_trace_status", {}, activeLang))}</dt>
        <dd>
          <span class="badge-confidence ${geomBadgeClass}">${escapeHtml(geomLabel)}</span>
          <span style="display:block; font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem;">
            ${escapeHtml(t("meta_spatial_disclaimer", {}, activeLang))}
          </span>
        </dd>
      </div>
    `;
  }

  const geometryNoteHtml = data.geometryNote ? `
    <div class="geometry-note-banner">
      <span class="note-icon">&#9432;</span>
      <span class="note-text">${escapeHtml(data.geometryNote)}</span>
    </div>
  ` : "";

  const dataStatusLabel = t("status_" + data.dataStatus, {}, activeLang) || (data.dataStatus ? data.dataStatus.toUpperCase() : "");

  return `
    <header class="detail-header ${domainClass}">
      <div class="header-badges">
        <span class="badge-domain">${escapeHtml(data.domainLabel)}</span>
        <span class="${statusBadgeClass}">${escapeHtml(dataStatusLabel)}</span>
        ${illustrativeBadgeHtml}
      </div>
      <h2 class="detail-title">${escapeHtml(data.name)}</h2>
      <p class="detail-description">${escapeHtml(data.description)}</p>
    </header>

    <div class="detail-body">
      ${geometryNoteHtml}
      ${quickFactsBlock}
      ${geologicalContextBlock}
      ${paleontologyBlock}
      ${geohazardContextBlock}
      ${evidenceBlock}
      ${whyItMattersBlock}

      <section class="detail-section section-metadata">
        <h3 class="section-title">${escapeHtml(t("detail_source_metadata_title", {}, activeLang))}</h3>
        <dl class="field-list">
          <div class="field-item">
            <dt>${escapeHtml(t("meta_attribution_source", {}, activeLang))}</dt>
            <dd>${escapeHtml(data.source || "Unspecified Source")}</dd>
          </div>
          ${sourceTypeBadge}
          ${verifStatusBadge}
          ${geomStatusBadge}
          <div class="field-item">
            <dt>${escapeHtml(t("meta_data_status", {}, activeLang))}</dt>
            <dd><span class="${statusBadgeClass}">${escapeHtml(dataStatusLabel)}</span></dd>
          </div>
          ${datesBlock}
          ${sourceUrlHtml}
        </dl>
      </section>
    </div>
  `;
}

export function formatSourceTypeLabel(type, lang = "en") {
  switch (type) {
    case "peer-reviewed_publication": return t("source_type_peer_reviewed", {}, lang);
    case "government_survey": return t("source_type_government_survey", {}, lang);
    case "institutional_record": return t("source_type_institutional", {}, lang);
    case "educational_interpretation": return t("source_type_educational", {}, lang);
    case "illustrative": return t("source_type_illustrative", {}, lang);
    default: return type || t("source_type_unspecified", {}, lang);
  }
}

export function formatVerificationStatusLabel(status, lang = "en") {
  switch (status) {
    case "verified": return t("status_verified", {}, lang);
    case "partially_verified": return t("status_partially_verified", {}, lang);
    case "needs_review": return t("status_needs_review", {}, lang);
    case "invalid": return t("status_invalid", {}, lang);
    case "missing": return t("status_missing", {}, lang);
    default: return (status || "NEEDS REVIEW").toUpperCase();
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
