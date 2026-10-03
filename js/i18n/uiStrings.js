/**
 * GeoMap Indonesia 2.0 — Centralized UI Chrome Bilingual Dictionary
 * English (EN) & Bahasa Indonesia (ID)
 */

export const UI_STRINGS = {
  en: {
    // Header & Brand
    app_brand_title: "GeoMap Indonesia 2.0",
    app_tagline: "Educational Geological & Geohazard Explorer",
    lang_toggle_btn_label: "Bahasa Indonesia",
    lang_toggle_btn_short: "ID",
    lang_toggle_aria: "Switch language to Bahasa Indonesia",

    // Educational Scope Disclosure Banner
    scope_banner_header: "EDUCATIONAL SCOPE DISCLOSURE:",
    scope_banner_body: "This platform is an independent educational tool. It does <strong>NOT</strong> provide live monitoring, emergency alerts, or official warnings. Refer to official government channels (PVMBG / BMKG / BNPB) for disaster response.",
    scope_toggle_more: "Full Info &#9662;",
    scope_toggle_less: "Less &#9650;",
    scope_toggle_aria: "Toggle full disclaimer",

    // Search Section
    search_label: "Search Locations & Categories",
    search_placeholder: "Search by name, category, or rock type...",
    search_input_aria: "Search dataset by name or category",
    search_clear_aria: "Clear search query",
    search_no_suggestions: "No matching features found",

    // Domain Explorer
    domain_label: "Domain Explorer",
    domain_all: "All Domains ({count})",
    domain_geology: "Geology ({count})",
    domain_hazard: "Geohazards ({count})",

    // Feature Type Filter Section
    feature_type_label: "Feature Type Filters",
    count_badge_singular: "{count} entry visible",
    count_badge_plural: "{count} entries visible",
    candidate_toggle_title: "Show Candidate Layer (Tectonic Structures & Geomorphology)",
    candidate_toggle_hint: "Renders active fault lines, subduction trenches, mountain ranges, sedimentary basins, karst systems, & geological complexes.",

    // Geological Timeline (Phase 3)
    timeline_title: "Geological Time & Earth History",
    timeline_disclaimer: "Note: Timeline reflects selected educational dataset evidence in GeoMap 2.0, not the exhaustive geological history of Indonesia.",
    timeline_period_significance: "General Period Significance:",
    timeline_dataset_evidence: "Dataset Evidence ({count} entries):",
    timeline_chip_tooltip: "Click to view on map",

    // Geological Process Explorer
    process_filter_label: "Geological Process Explorer",
    process_select_aria: "Filter dataset by geological process",
    process_all_option: "All Geological Processes ({count})",
    process_card_tag: "Process Insight",
    process_card_what_is_it: "What is it?",
    process_card_how_it_works: "How does it work?",
    process_card_indonesian_examples: "Indonesian Examples in Dataset:",
    process_card_what_can_we_learn: "What can we learn?",

    // Geological Time Period Filter
    period_filter_label: "Geological Time Period",
    period_select_aria: "Filter dataset by geological period",
    period_all_option: "All Geological Periods ({count})",
    period_Triassic: "Triassic",
    period_Cretaceous: "Cretaceous",
    period_Neogene: "Neogene",
    period_Quaternary: "Quaternary",
    period_Historical: "Historical Hazards",
    period_Paleogene: "Paleogene",
    period_triassic: "Triassic",
    period_cretaceous: "Cretaceous",
    period_paleogene: "Paleogene",
    period_neogene: "Neogene",
    period_quaternary: "Quaternary",
    period_historical: "Historical Hazards",

    // Geological Evidence Type Filter
    evidence_filter_label: "Geological Evidence Type",
    evidence_select_aria: "Filter dataset by geological evidence type",
    evidence_all_option: "All Evidence Categories ({count})",
    evidence_cat_rock: "Rock",
    evidence_cat_fossil: "Fossil",
    evidence_cat_landform: "Landform",
    evidence_cat_geological_structure: "Geological Structure",
    evidence_cat_historical_record: "Historical Record",
    evidence_cat_uncategorized: "Uncategorized",

    // Data Confidence Level Filter
    confidence_filter_label: "Data Confidence Level",
    confidence_select_aria: "Filter dataset by source verification confidence status",
    confidence_all_option: "All Confidence Levels ({count})",

    // Map Symbol Legend
    legend_title: "Map Symbol Legend",
    legend_volcano: "Volcano / Volcanic Complex",
    legend_paleo: "Paleontology Locality",
    legend_site: "Geological Site / Formation",
    legend_hazard: "Historical Geohazard Event",

    // Sidebar Footer
    btn_about_mission: "About & Educational Mission",
    footer_disclaimer: "Independent Educational Platform. Not affiliated with MAGMA Indonesia, PVMBG, ESDM, BMKG, or BNPB.",

    // Map Layer Switcher
    layers_title_base: "Base Layers",
    layer_satellite: "Satellite",
    layer_street_map: "Street Map",
    layer_terrain: "Terrain",
    layers_title_overlays: "Overlays",
    layer_place_labels: "Place Labels",
    layer_candidate_structures: "Candidate Structures",
    layers_toggle_aria: "Toggle basemap layer switcher",

    // Empty State
    empty_state_title: "No Results Found",
    empty_state_message: "No geological sites or hazard events match your active search and filter criteria.",
    empty_state_reset_btn: "Reset All Filters",

    // Loading State
    loading_text: "Loading Geological & Hazard Datasets...",

    // Detail Panel Common
    detail_close_aria: "Close details panel",
    detail_quick_facts_title: "Quick Facts",
    detail_geo_context_title: "Geological Context",
    detail_paleo_title: "Paleontological Record",
    detail_hazard_context_title: "Geohazard Context",
    detail_evidence_title: "Geological Evidence & Data Credibility",
    detail_why_matters_title: "Why It Matters",
    detail_source_metadata_title: "Source & Data Status",

    // Detail Quick Fact Labels
    fact_feature_type: "Feature Type",
    fact_structure_type: "Structure Type",
    fact_geological_age: "Geological Age",
    fact_rock_type: "Rock Type / Lithology",
    fact_location: "Location",
    fact_event_start_date: "Event Start Date",
    fact_event_end_date: "Event End Date",
    fact_hazard_category: "Hazard Category",
    fact_taxon_name: "Taxon Name",
    fact_discovery_locality: "Discovery Locality",
    fact_fossil_material: "Fossil Material",
    fact_paleoenvironment: "Paleoenvironment",

    // Detail Evidence Claims
    evidence_claim_1_title: "1. General Educational Claim ({evidenceType} Evidence):",
    evidence_claim_2_title: "2. Location-Specific Empirical Evidence:",
    evidence_claim_3_title: "3. {sourceClaimLabel}:",
    source_claim_direct: "Source-Supported Claim",
    source_claim_interpretation: "Educational Interpretation Based on Source",
    source_claim_illustrative: "Illustrative Interpretation",

    // Detail Source Metadata Field Labels
    meta_attribution_source: "Attribution Source",
    meta_source_classification: "Source Classification",
    meta_data_confidence_status: "Data Confidence Status",
    meta_spatial_trace_status: "Spatial Trace Status",
    meta_data_status: "Data Status",
    meta_event_date: "Event Occurrence Date",
    meta_record_compilation_date: "Record Compilation Date",
    meta_primary_source_link: "Primary Source Link",
    meta_verified_source_links: "Verified Scientific Source Publications",
    meta_open_source_publication: "Open Source Publication / Catalog Entry &rarr;",
    meta_view_audit_document: "View Record-Level Source Audit Document &rarr;",
    meta_spatial_disclaimer: "Interface visual representation — not official cartographic trace.",
    meta_multi_year_range: "(Multi-Year Eruptive Range)",

    // Source Classifications
    source_type_peer_reviewed: "Peer-Reviewed Publication",
    source_type_government_survey: "Government Survey",
    source_type_institutional: "Institutional Record",
    source_type_educational: "Educational Interpretation",
    source_type_illustrative: "Illustrative / Demo Data",
    source_type_unspecified: "Unspecified",

    // Domain Labels in Detail Header
    domain_label_geology: "Geological Explorer",
    domain_label_hazard: "Geohazard Information",

    // Feature Type Display Names
    ft_volcano: "Volcano / Volcanic Complex",
    ft_paleontology_site: "Paleontological Site",
    ft_site: "Geological Site / Formation",
    ft_historical_event: "Historical Geohazard Event",
    ft_tectonic_structure: "Tectonic Structure",
    ft_geological_complex: "Geological Complex",
    ft_volcanic_complex: "Volcanic Complex",
    ft_mountain_system: "Mountain System / Range",
    ft_basin: "Sedimentary & Tectonic Basin",
    ft_regional_karst: "Regional Karst System",
    ft_volcanic_arc: "Volcanic Arc System",

    // Structure Type Display Names
    st_active_fault: "Active Fault Line",
    st_subduction_trench: "Subduction Trench Axis",
    st_melange: "Subduction Mélange Complex",
    st_fold_thrust_belt: "Fold & Thrust Belt",
    st_mountain_range: "Mountain Range",
    st_physiographic_zone: "Physiographic Zone",
    st_intermontane_basin: "Intermontane Volcano-Tectonic Basin",
    st_sedimentary_basin: "Sedimentary Basin",
    st_tropical_kegelkarst: "Tropical Kegelkarst System",
    st_volcanic_arc_axis: "Volcanic Front Axis (Representative)",
    st_arc_arc_collision_zone: "Double Subduction Arc-Arc Collision Zone",
    st_microcontinent: "Rifted Continental Fragment / Microcontinent",
    st_obducted_ophiolite_complex: "Obducted Supra-Subduction Ophiolite Complex",

    // Hazard Type Display Names
    ht_volcanic: "Volcanic Event",
    ht_seismic: "Seismic / Earthquake Event",
    ht_tsunami: "Tsunami Event",
    ht_landslide: "Landslide Event",

    // Status Badges & Geometry Status
    status_verified: "VERIFIED",
    status_partially_verified: "PARTIALLY VERIFIED",
    status_needs_review: "NEEDS REVIEW",
    status_invalid: "INVALID",
    status_missing: "MISSING",
    status_prod: "PROD",
    status_demo: "DEMO",
    status_illustrative: "ILLUSTRATIVE / DEMO DATA",
    geom_status_verified: "VERIFIED GEOMETRY TRACE",
    geom_status_partially_verified: "PARTIALLY VERIFIED GEOMETRY",
    geom_status_needs_review: "GEOMETRY NEEDS REVIEW",

    // About / Mission Modal Content
    about_modal_title: "About GeoMap Indonesia 2.0",
    about_modal_close_aria: "Close modal",
    about_mission_title: "Mission",
    about_mission_body: "GeoMap Indonesia 2.0 is an educational platform for exploring Indonesia's geological history, geological processes, paleontological heritage, and historical geohazards through an interactive map.",
    about_vision_title: "Vision",
    about_vision_body: "Making Indonesia's geological and paleontological heritage more accessible, understandable, and connected to spatial and environmental context.",
    about_goals_title: "Educational Goals",
    about_goals_item_1: "Introduce the diversity of Indonesia's geology.",
    about_goals_item_2: "Connect locations to the processes that formed them.",
    about_goals_item_3: "Introduce Indonesia's paleontological heritage.",
    about_goals_item_4: "Build basic understanding of geohazards.",
    about_goals_item_5: "Encourage map- and data-based geoscience literacy.",
    about_transparency_title: "Data Confidence & Transparency Summary",
    about_transparency_lead: "Scientific source verification for GeoMap dataset entries is an active, transparent process. Statuses reflect internal audit verification stages rather than third-party agency certifications.",
    about_transparency_total_badge: "Canonical Dataset Total: {total} records",
    about_scope_limitations_title: "Project Scope & Methodological Limitations",
    about_limitations_item_1: "<strong>No Live Feeds:</strong> Not a live seismic or volcanic monitoring system.",
    about_limitations_item_2: "<strong>No Warning Alerts:</strong> Not a disaster warning system or emergency dispatch tool.",
    about_limitations_item_3: "<strong>Non-Official:</strong> Not a replacement for official government channels (PVMBG / BMKG / BNPB).",
    about_limitations_item_4: "<strong>Data Status:</strong> Data entries are historical, illustrative, or demo compilations.",
    about_limitations_item_5: "<strong>Coverage:</strong> Data coverage is actively growing under structured scientific audit.",

    // Toasts & Notifications
    toast_basemap_fallback: 'Basemap "{provider}" unavailable. Switched to Street Map fallback.',
    toast_overlay_fallback: 'Overlay "{overlay}" unavailable. Place labels disabled.'
  },

  id: {
    // Header & Brand (Brand name remains GeoMap Indonesia 2.0)
    app_brand_title: "GeoMap Indonesia 2.0",
    app_tagline: "Penjelajah Edukasi Geologi & Bahaya Geologi",
    lang_toggle_btn_label: "English",
    lang_toggle_btn_short: "EN",
    lang_toggle_aria: "Ganti bahasa ke Bahasa Inggris",

    // Educational Scope Disclosure Banner
    scope_banner_header: "PEMBERITAHUAN RUANG LINGKUP EDUKASI:",
    scope_banner_body: "Platform ini merupakan media edukasi independen. Platform ini <strong>TIDAK</strong> menyediakan pemantauan langsung (live monitoring), peringatan darurat, ataupun peringatan dini resmi. Rujuk saluran resmi pemerintah (PVMBG / BMKG / BNPB) untuk tanggap bencana.",
    scope_toggle_more: "Info Lengkap &#9662;",
    scope_toggle_less: "Ringkas &#9650;",
    scope_toggle_aria: "Buka/tutup informasi lengkap disclaimer",

    // Search Section
    search_label: "Cari Lokasi & Kategori",
    search_placeholder: "Cari berdasarkan nama, kategori, atau jenis batuan...",
    search_input_aria: "Cari dataset berdasarkan nama atau kategori",
    search_clear_aria: "Hapus pencarian",
    search_no_suggestions: "Tidak ada fitur yang cocok ditemukan",

    // Domain Explorer
    domain_label: "Penjelajah Domain",
    domain_all: "Semua Domain ({count})",
    domain_geology: "Geologi ({count})",
    domain_hazard: "Bahaya Geologi ({count})",

    // Feature Type Filter Section
    feature_type_label: "Filter Jenis Fitur",
    count_badge_singular: "{count} entri terlihat",
    count_badge_plural: "{count} entri terlihat",
    candidate_toggle_title: "Tampilkan Struktur Tektonik & Geomorfologi (Lapisan Kandidat)",
    candidate_toggle_hint: "Menampilkan jalur sesar aktif, palung subduksi, pegunungan, cekungan sedimen, kawasan karst, & kompleks geologi.",

    // Geological Timeline (Phase 3)
    timeline_title: "Waktu Geologi & Sejarah Bumi",
    timeline_disclaimer: "Catatan: Garis waktu mencerminkan bukti dataset edukasi terpilih di GeoMap 2.0, bukan keseluruhan sejarah geologi Indonesia yang lengkap.",
    timeline_period_significance: "Signifikansi Periode Secara Umum:",
    timeline_dataset_evidence: "Bukti Dataset ({count} entri):",
    timeline_chip_tooltip: "Klik untuk melihat di peta",

    // Geological Process Explorer
    process_filter_label: "Penjelajah Proses Geologi",
    process_select_aria: "Filter dataset berdasarkan proses geologi",
    process_all_option: "Semua Proses Geologi ({count})",
    process_card_tag: "Wawasan Proses",
    process_card_what_is_it: "Apa itu?",
    process_card_how_it_works: "Bagaimana proses kerjanya?",
    process_card_indonesian_examples: "Contoh Indonesia dalam Dataset:",
    process_card_what_can_we_learn: "Apa yang dapat dipelajari?",

    // Geological Time Period Filter
    period_filter_label: "Periode Waktu Geologi",
    period_select_aria: "Filter dataset berdasarkan periode geologi",
    period_all_option: "Semua Periode Geologi ({count})",
    period_Triassic: "Trias",
    period_Cretaceous: "Kapur",
    period_Neogene: "Neogen",
    period_Quaternary: "Kuarter",
    period_Historical: "Bahaya Geologi Historis",
    period_Paleogene: "Paleogen",
    period_triassic: "Trias",
    period_cretaceous: "Kapur",
    period_paleogene: "Paleogen",
    period_neogene: "Neogen",
    period_quaternary: "Kuarter",
    period_historical: "Bahaya Geologi Historis",

    // Geological Evidence Type Filter
    evidence_filter_label: "Jenis Bukti Geologi",
    evidence_select_aria: "Filter dataset berdasarkan jenis bukti geologi",
    evidence_all_option: "Semua Kategori Bukti ({count})",
    evidence_cat_rock: "Batuan",
    evidence_cat_fossil: "Fosil",
    evidence_cat_landform: "Bentang Alam",
    evidence_cat_geological_structure: "Struktur Geologi",
    evidence_cat_historical_record: "Catatan Historis",
    evidence_cat_uncategorized: "Tidak Terkategori",

    // Data Confidence Level Filter
    confidence_filter_label: "Tingkat Keyakinan Data",
    confidence_select_aria: "Filter dataset berdasarkan status verifikasi sumber data",
    confidence_all_option: "Semua Tingkat Keyakinan ({count})",

    // Map Symbol Legend
    legend_title: "Legenda Simbol Peta",
    legend_volcano: "Gunung Api / Kompleks Vulkanik",
    legend_paleo: "Situs Paleontologi",
    legend_site: "Situs / Formasi Geologi",
    legend_hazard: "Peristiwa Bahaya Geologi Historis",

    // Sidebar Footer
    btn_about_mission: "Tentang & Misi Edukasi",
    footer_disclaimer: "Platform Edukasi Independen. Tidak berafiliasi dengan MAGMA Indonesia, PVMBG, ESDM, BMKG, atau BNPB.",

    // Map Layer Switcher
    layers_title_base: "Lapisan Peta Dasar",
    layer_satellite: "Satelit",
    layer_street_map: "Peta Jalan",
    layer_terrain: "Topografi / Medan",
    layers_title_overlays: "Lapisan Tambahan",
    layer_place_labels: "Label Tempat",
    layer_candidate_structures: "Struktur Kandidat",
    layers_toggle_aria: "Buka/tutup pengatur lapisan peta",

    // Empty State
    empty_state_title: "Hasil Tidak Ditemukan",
    empty_state_message: "Tidak ada situs geologi atau peristiwa bahaya geologi yang sesuai dengan kriteria pencarian dan filter aktif Anda.",
    empty_state_reset_btn: "Reset Semua Filter",

    // Loading State
    loading_text: "Memuat Dataset Geologi & Bahaya Geologi...",

    // Detail Panel Common
    detail_close_aria: "Tutup panel detail",
    detail_quick_facts_title: "Fakta Singkat",
    detail_geo_context_title: "Konteks Geologi",
    detail_paleo_title: "Catatan Paleontologi",
    detail_hazard_context_title: "Konteks Bahaya Geologi",
    detail_evidence_title: "Bukti Geologi & Kredibilitas Data",
    detail_why_matters_title: "Mengapa Ini Penting",
    detail_source_metadata_title: "Sumber & Status Data",

    // Detail Quick Fact Labels
    fact_feature_type: "Jenis Fitur",
    fact_structure_type: "Jenis Struktur",
    fact_geological_age: "Umur Geologi",
    fact_rock_type: "Jenis Batuan / Litologi",
    fact_location: "Lokasi",
    fact_event_start_date: "Tanggal Mulai Peristiwa",
    fact_event_end_date: "Tanggal Selesai Peristiwa",
    fact_hazard_category: "Kategori Bahaya",
    fact_taxon_name: "Nama Takson",
    fact_discovery_locality: "Lokasi Penemuan",
    fact_fossil_material: "Material Fosil",
    fact_paleoenvironment: "Paleolingkungan",

    // Detail Evidence Claims
    evidence_claim_1_title: "1. Klaim Edukasi Umum (Bukti {evidenceType}):",
    evidence_claim_2_title: "2. Bukti Empiris Spesifik Lokasi:",
    evidence_claim_3_title: "3. {sourceClaimLabel}:",
    source_claim_direct: "Klaim Berdasarkan Sumber",
    source_claim_interpretation: "Interpretasi Edukasi Berdasarkan Sumber",
    source_claim_illustrative: "Interpretasi Ilustratif",

    // Detail Source Metadata Field Labels
    meta_attribution_source: "Sumber Atribusi",
    meta_source_classification: "Klasifikasi Sumber",
    meta_data_confidence_status: "Status Keyakinan Data",
    meta_spatial_trace_status: "Status Jejak Spasial",
    meta_data_status: "Status Data",
    meta_event_date: "Tanggal Terjadinya Peristiwa",
    meta_record_compilation_date: "Tanggal Kompilasi Data",
    meta_primary_source_link: "Tautan Sumber Utama",
    meta_verified_source_links: "Tautan Publikasi Sumber Ilmiah Terverifikasi",
    meta_open_source_publication: "Buka Publikasi Sumber / Entri Katalog &rarr;",
    meta_view_audit_document: "Lihat Dokumen Audit Sumber Tingkat Rekaman &rarr;",
    meta_spatial_disclaimer: "Representasi visual antarmuka — bukan jejak kartografi resmi.",
    meta_multi_year_range: "(Rentang Letusan Bertahun-tahun)",

    // Source Classifications
    source_type_peer_reviewed: "Publikasi Mitra Bestari (Peer-Reviewed)",
    source_type_government_survey: "Survei / Laporan Pemerintah",
    source_type_institutional: "Catatan Institusi",
    source_type_educational: "Interpretasi Edukasi",
    source_type_illustrative: "Data Ilustratif / Demo",
    source_type_unspecified: "Tidak Ditentukan",

    // Domain Labels in Detail Header
    domain_label_geology: "Penjelajah Geologi",
    domain_label_hazard: "Informasi Bahaya Geologi",

    // Feature Type Display Names
    ft_volcano: "Gunung Api / Kompleks Vulkanik",
    ft_paleontology_site: "Situs Paleontologi",
    ft_site: "Situs / Formasi Geologi",
    ft_historical_event: "Peristiwa Bahaya Geologi Historis",
    ft_tectonic_structure: "Struktur Tektonik",
    ft_geological_complex: "Kompleks Geologi",
    ft_volcanic_complex: "Kompleks Vulkanik",
    ft_mountain_system: "Sistem / Pegunungan",
    ft_basin: "Cekungan Sedimen & Tektonik",
    ft_regional_karst: "Sistem Karst Regional",
    ft_volcanic_arc: "Sistem Busur Vulkanik",

    // Structure Type Display Names
    st_active_fault: "Jalur Sesar Aktif",
    st_subduction_trench: "Sumbu Palung Subduksi",
    st_melange: "Kompleks Melange Subduksi",
    st_fold_thrust_belt: "Jalur Lipatan & Sesar Naik (Fold & Thrust Belt)",
    st_mountain_range: "Pegunungan",
    st_physiographic_zone: "Zona Fisiografi",
    st_intermontane_basin: "Cekungan Antarmontana Vulkano-Tektonik",
    st_sedimentary_basin: "Cekungan Sedimen",
    st_tropical_kegelkarst: "Sistem Karst Tropis (Kegelkarst)",
    st_volcanic_arc_axis: "Sumbu Depan Vulkanik (Representatif)",
    st_arc_arc_collision_zone: "Zona Tabrakan Busur-Busur Subduksi Ganda",
    st_microcontinent: "Fragmen Kontinen / Mikrokontinen Rifting",
    st_obducted_ophiolite_complex: "Kompleks Ofiolit Obduksi Supra-Subduksi",

    // Hazard Type Display Names
    ht_volcanic: "Peristiwa Vulkanik",
    ht_seismic: "Peristiwa Seismik / Gempa Bumi",
    ht_tsunami: "Peristiwa Tsunami",
    ht_landslide: "Peristiwa Longsor",

    // Status Badges & Geometry Status
    status_verified: "TERVERIFIKASI",
    status_partially_verified: "TERVERIFIKASI SEBAGIAN",
    status_needs_review: "PERLU DITINJAU",
    status_invalid: "TIDAK VALID",
    status_missing: "DATA BELUM LENGKAP",
    status_prod: "PRODUKSI",
    status_demo: "DEMO",
    status_illustrative: "DATA ILUSTRATIF / DEMO",
    geom_status_verified: "JEJAK GEOMETRI TERVERIFIKASI",
    geom_status_partially_verified: "GEOMETRI TERVERIFIKASI SEBAGIAN",
    geom_status_needs_review: "GEOMETRI PERLU DITINJAU",

    // About / Mission Modal Content
    about_modal_title: "Tentang GeoMap Indonesia 2.0",
    about_modal_close_aria: "Tutup modal",
    about_mission_title: "Misi",
    about_mission_body: "GeoMap Indonesia 2.0 adalah platform edukasi untuk menjelajahi sejarah geologi, proses geologi, warisan paleontologi, dan bahaya geologi historis Indonesia melalui peta interaktif.",
    about_vision_title: "Visi",
    about_vision_body: "Menjadikan warisan geologi dan paleontologi Indonesia lebih mudah diakses, dipahami, serta terhubung dengan konteks spasial dan lingkungan.",
    about_goals_title: "Tujuan Edukasi",
    about_goals_item_1: "Memperkenalkan keanekaragaman geologi Indonesia.",
    about_goals_item_2: "Menghubungkan lokasi dengan proses pembentukannya.",
    about_goals_item_3: "Memperkenalkan warisan paleontologi Indonesia.",
    about_goals_item_4: "Membangun pemahaman dasar mengenai bahaya geologi.",
    about_goals_item_5: "Mendorong literasi kebumian berbasis peta dan data.",
    about_transparency_title: "Ringkasan Keyakinan Data & Transparansi",
    about_transparency_lead: "Verifikasi sumber ilmiah untuk entri dataset GeoMap adalah proses aktif dan transparan. Status mencerminkan tahapan verifikasi audit internal, bukan sertifikasi lembaga pihak ketiga.",
    about_transparency_total_badge: "Total Dataset Kanonikal: {total} rekaman",
    about_scope_limitations_title: "Ruang Lingkup Proyek & Batasan Metodologi",
    about_limitations_item_1: "<strong>Bukan Pemantauan Langsung:</strong> Bukan sistem pemantauan seismik atau aktivitas vulkanik langsung.",
    about_limitations_item_2: "<strong>Bukan Peringatan Dini:</strong> Bukan sistem peringatan bencana atau sarana tanggap darurat.",
    about_limitations_item_3: "<strong>Bukan Rujukan Resmi:</strong> Bukan pengganti saluran resmi pemerintah (PVMBG / BMKG / BNPB).",
    about_limitations_item_4: "<strong>Status Data:</strong> Entri data merupakan kompilasi historis, ilustratif, atau percontohan (demo).",
    about_limitations_item_5: "<strong>Cakupan Data:</strong> Cakupan data terus bertambah secara aktif melalui audit ilmiah terstruktur.",

    // Toasts & Notifications
    toast_basemap_fallback: 'Peta dasar "{provider}" tidak tersedia. Beralih ke cadangan Peta Jalan.',
    toast_overlay_fallback: 'Lapisan tambahan "{overlay}" tidak tersedia. Label tempat dinonaktifkan.'
  }
};
