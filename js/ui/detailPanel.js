/**
 * Shared Domain-Aware Detail Panel Drawer Component
 * Phase 1 Structured Educational View Layout with strict conditional rendering.
 */

import { adaptGeologyFeature } from "../data/adapters/geologyAdapter.js";
import { adaptHazardFeature } from "../data/adapters/hazardAdapter.js";
import { EVIDENCE_EDUCATIONAL_GUIDE } from "../data/evidenceGuideData.js";

/**
 * Initializes the detail panel drawer.
 * @param {string} panelId - DOM ID for detail panel drawer
 * @param {string} closeBtnId - DOM ID for panel close button
 */
export function initDetailPanel(panelId = "detail-panel", closeBtnId = "detail-close-btn") {
  const panelEl = document.getElementById(panelId);
  const closeBtn = document.getElementById(closeBtnId);
  const contentEl = document.getElementById("detail-panel-content");

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      closeDetailPanel();
    });
  }

  function closeDetailPanel() {
    if (panelEl) {
      panelEl.classList.remove("open");
      panelEl.setAttribute("aria-hidden", "true");
    }
  }

  /**
   * Opens detail panel and populates content based on feature domain.
   * @param {object} feature - GeoJSON feature object
   */
  function openDetailPanel(feature) {
    if (!panelEl || !contentEl || !feature) return;

    const domain = feature.properties.domain;
    let data = null;

    if (domain === "geology") {
      data = adaptGeologyFeature(feature);
    } else if (domain === "hazard") {
      data = adaptHazardFeature(feature);
    } else {
      console.warn(`[Detail Panel] Unknown domain '${domain}'`);
      return;
    }

    contentEl.innerHTML = renderDetailContent(data);
    panelEl.classList.add("open");
    panelEl.setAttribute("aria-hidden", "false");
    panelEl.scrollTop = 0;
  }

  return {
    openDetailPanel,
    closeDetailPanel
  };
}

/**
 * Builds HTML string for detail panel content adhering to Section 6.1 specification.
 * @param {object} data - Normalized adapter data object
 * @returns {string} HTML markup
 */
function renderDetailContent(data) {
  const domainClass = data.domain === "geology" ? "domain-geology" : "domain-hazard";
  const statusBadgeClass = `badge-status badge-${data.dataStatus}`;
  const isIllustrative = data.sourceType === "illustrative" || data.dataStatus === "illustrative";

  // Determine Source Claim Label
  let sourceClaimLabel = "Source-Supported Claim";
  if (data.sourceType === "educational_interpretation") {
    sourceClaimLabel = "Educational Interpretation Based on Source";
  } else if (isIllustrative) {
    sourceClaimLabel = "Illustrative Interpretation";
  }

  // 1. Quick Facts Section (Conditional)
  let quickFactsBlock = "";
  if (data.quickFacts && Object.keys(data.quickFacts).length > 0) {
    quickFactsBlock = `
      <section class="detail-section section-quick-facts">
        <h3 class="section-title">Quick Facts</h3>
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
        <h3 class="section-title">Geological Context</h3>
        <p class="section-paragraph">${escapeHtml(data.geologicalContext)}</p>
      </section>
    `;
  }

  // 3. Paleontological Record Section (feature_type: paleontology_site Only)
  let paleontologyBlock = "";
  if (data.featureType === "paleontology_site" && data.paleontologicalRecord) {
    paleontologyBlock = `
      <section class="detail-section section-paleo">
        <h3 class="section-title">Paleontological Record</h3>
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
        <h3 class="section-title">Geohazard Context</h3>
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
    const generalClaimHtml = generalClaimText ? `
      <div class="evidence-subclaim general-claim">
        <strong>1. General Educational Claim (${escapeHtml(data.evidenceType)} Evidence):</strong>
        <p>${escapeHtml(generalClaimText)}</p>
      </div>
    ` : "";

    evidenceBlock = `
      <section class="detail-section section-evidence">
        <h3 class="section-title">Geological Evidence & Data Credibility</h3>
        <div class="evidence-card">
          ${generalClaimHtml}
          <div class="evidence-subclaim location-claim">
            <strong>2. Location-Specific Empirical Evidence:</strong>
            <div class="evidence-badge-row">
              <span class="evidence-type-badge">${escapeHtml(data.evidenceType)}</span>
            </div>
            <p>${escapeHtml(data.evidenceDescription)}</p>
          </div>
          <div class="evidence-subclaim source-claim">
            <strong>3. ${escapeHtml(sourceClaimLabel)}:</strong>
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
        <h3 class="section-title">Why It Matters</h3>
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
      <dt>Primary Source Link</dt>
      <dd>
        <a href="${escapeHtml(data.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="source-link">
          Open Source Publication / Catalog Entry &rarr;
        </a>
      </dd>
    </div>
  ` : "";

  const sourceTypeBadge = data.sourceType ? `
    <div class="field-item">
      <dt>Source Category</dt>
      <dd><span class="badge-source-type">${escapeHtml(formatSourceTypeLabel(data.sourceType))}</span></dd>
    </div>
  ` : "";

  const verifStatusClass = `badge-status badge-${data.sourceVerificationStatus || 'needs_review'}`;
  const verifStatusBadge = `
    <div class="field-item">
      <dt>Verification Status</dt>
      <dd><span class="${verifStatusClass}">${escapeHtml(formatVerificationStatusLabel(data.sourceVerificationStatus))}</span></dd>
    </div>
  `;

  // Distinct Date Display
  let datesBlock = "";
  if (data.featureType === "historical_event" || data.eventDate) {
    let eventDateText = data.eventDate || "Unspecified Event Date";
    if (data.eventEndDate) {
      eventDateText += ` – ${data.eventEndDate}`;
      if (data.eventDatePrecision === "multi_year_range") {
        eventDateText += " (Multi-Year Eruptive Range)";
      }
    }
    datesBlock = `
      <div class="field-item">
        <dt>Event Occurrence Date</dt>
        <dd><strong>${escapeHtml(eventDateText)}</strong></dd>
      </div>
      <div class="field-item">
        <dt>Record Compilation Date</dt>
        <dd>${escapeHtml(data.recordCompilationDate || data.lastUpdated)}</dd>
      </div>
    `;
  } else {
    datesBlock = `
      <div class="field-item">
        <dt>Record Compilation Date</dt>
        <dd>${escapeHtml(data.recordCompilationDate || data.lastUpdated)}</dd>
      </div>
    `;
  }

  const illustrativeBadgeHtml = isIllustrative ? `
    <span class="badge-status badge-illustrative">ILLUSTRATIVE / DEMO DATA</span>
  ` : "";

  const geometryNoteHtml = data.geometryNote ? `
    <div class="geometry-note-banner">
      <span class="note-icon">&#9432;</span>
      <span class="note-text">${escapeHtml(data.geometryNote)}</span>
    </div>
  ` : "";

  return `
    <header class="detail-header ${domainClass}">
      <div class="header-badges">
        <span class="badge-domain">${escapeHtml(data.domainLabel)}</span>
        <span class="${statusBadgeClass}">${escapeHtml(data.dataStatus.toUpperCase())}</span>
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
        <h3 class="section-title">Source & Data Status</h3>
        <dl class="field-list">
          <div class="field-item">
            <dt>Attribution Source</dt>
            <dd>${escapeHtml(data.source || "Unspecified Source")}</dd>
          </div>
          ${sourceTypeBadge}
          ${verifStatusBadge}
          <div class="field-item">
            <dt>Data Status</dt>
            <dd><span class="${statusBadgeClass}">${escapeHtml(data.dataStatus.toUpperCase())}</span></dd>
          </div>
          ${datesBlock}
          ${sourceUrlHtml}
        </dl>
      </section>
    </div>
  `;
}

function formatSourceTypeLabel(type) {
  switch (type) {
    case "peer-reviewed_publication": return "Peer-Reviewed Publication";
    case "government_survey": return "Government Survey";
    case "institutional_record": return "Institutional Record";
    case "educational_interpretation": return "Educational Interpretation";
    case "illustrative": return "Illustrative / Demo Data";
    default: return type || "Unspecified";
  }
}

function formatVerificationStatusLabel(status) {
  switch (status) {
    case "verified": return "VERIFIED SOURCE";
    case "partially_verified": return "PARTIALLY VERIFIED";
    case "needs_review": return "NEEDS REVIEW";
    case "invalid": return "INVALID SOURCE";
    case "missing": return "MISSING SOURCE";
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
