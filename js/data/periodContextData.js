/**
 * Educational Geological Period Context Repository
 * General period educational information separated from location-specific dataset evidence.
 */

export const PERIOD_CONTEXT_DATA = {
  "Triassic": {
    period: "Triassic Period",
    era: "Mesozoic Era",
    timeRange: "~252 – 201 Million Years Ago",
    generalInfo: "The Triassic Period marked the recovery of life after the End-Permian mass extinction and the assembly of the Pangaea supercontinent. In Southeast Asia, plutonic magma intrusions cooled deep beneath the crust of the ancient Sundaland continent.",
    datasetEvidence: [
      { id: "geo_belitung_granite", name: "Belitung Granitic Boulders", age: "Early Triassic (~213 Ma)", detail: "Tanjung Pandan Granite" }
    ]
  },
  "Cretaceous": {
    period: "Cretaceous Period",
    era: "Mesozoic Era",
    timeRange: "~145 – 66 Million Years Ago",
    generalInfo: "The Cretaceous Period was characterized by high sea levels, warm global climates, and major plate tectonic reorganization. In West Java, subduction accretion squeezed seafloor sediments, ophiolites, and oceanic crust against the Sundaland margin.",
    datasetEvidence: [
      { id: "geo_ciletuh", name: "Ciletuh Geopark Metamorphic Complex", age: "Cretaceous (~135 - 65 Ma)", detail: "Schist, Peridotite & Ophiolites" },
      { id: "geo_karangsambung", name: "Karangsambung Melange Complex", age: "Cretaceous (~120 - 65 Ma)", detail: "Glaucophane Schist & Chert" },
      { id: "geo_kalimantan_diamond", name: "Martapura Diamond Alluvium", age: "Cretaceous (~110 - 70 Ma)", detail: "Meratus Ultramafic Pipe Gravels" }
    ]
  },
  "Neogene": {
    period: "Neogene Period",
    era: "Cenozoic Era",
    timeRange: "~23 – 2.58 Million Years Ago",
    generalInfo: "The Neogene Period featured major tectonic collision between the Indo-Australian, Eurasian, and Pacific plates, uplifting extensive coral reefs in Sulawesi and forming deep sea basins in the Banda Arc.",
    datasetEvidence: [
      { id: "geo_maros_karst", name: "Maros-Pangkep Tower Karst Complex", age: "Eocene - Miocene (~40 - 15 Ma)", detail: "Tonasa Limestone Uplift" },
      { id: "geo_weber_deep", name: "Banda Arc & Weber Deep Basin", age: "Neogene (~15 Ma)", detail: "Oceanic Detachment Basin" },
      { id: "geo_komodo_volcanic", name: "Komodo Volcanic Arc Basement", age: "Neogene (~15 - 5 Ma)", detail: "Neogene Volcanic Breccia & Terraces" }
    ]
  },
  "Quaternary": {
    period: "Quaternary Period",
    era: "Cenozoic Era",
    timeRange: "~2.58 Million Years Ago – Present",
    generalInfo: "The Quaternary Period encompasses glacial-interglacial climate cycles, major Sunda Arc super-eruptions, river terrace sedimentation, and the evolution and island dispersal of hominins across Indonesia.",
    datasetEvidence: [
      { id: "geo_toba_caldera", name: "Toba Caldera", age: "Late Pleistocene (~74,000 BP)", detail: "Ignimbrite Supereruption" },
      { id: "geo_sangiran", name: "Sangiran Early Man Site", age: "Pleistocene (~1.5 - 0.9 Ma)", detail: "Homo erectus Fossils" },
      { id: "geo_merapi", name: "Mount Merapi", age: "Holocene (~10,000 BP - Present)", detail: "Active Stratovolcano" },
      { id: "geo_trinil", name: "Trinil Paleontology Locality", age: "Middle Pleistocene (~0.9 - 0.7 Ma)", detail: "Java Man Site" },
      { id: "geo_rinjani", name: "Mount Rinjani & Segara Anak", age: "Holocene (1257 CE eruption)", detail: "Samalas Caldera Collapse" },
      { id: "geo_bromo", name: "Mount Bromo & Tengger Caldera", age: "Late Pleistocene - Holocene (~45,000 BP)", detail: "Nested Sand Sea Caldera" },
      { id: "geo_semangko_sianok", name: "Great Sumatran Fault at Ngarai Sianok", age: "Quaternary", detail: "Strike-Slip Fault Canyon" },
      { id: "geo_liang_bua", name: "Flores Liang Bua Paleontology Cave", age: "Late Pleistocene (~190,000 - 50,000 BP)", detail: "Homo floresiensis" },
      { id: "geo_tambora", name: "Mount Tambora & 1815 Caldera", age: "Holocene (1815 CE)", detail: "7km Summit Caldera Wall" },
      { id: "geo_anak_krakatau", name: "Anak Krakatau Scoria Cone", age: "Holocene (1927 - Present)", detail: "Post-Caldera Scoria Cone" },
      { id: "geo_raung", name: "Mount Raung Flank Amphitheater", age: "Quaternary", detail: "Debris Avalanche Amphitheater" },
      { id: "geo_illustrative_example", name: "Bali Coastal Karst", age: "Quaternary", detail: "Illustrative Reef Uplift" }
    ]
  },
  "Historical": {
    period: "Modern Historical Geohazard Record",
    era: "Human History",
    timeRange: "1815 – 2021 CE (Modern Instrument & Historical Record)",
    generalInfo: "Historical geohazard events represent documented natural disasters occurring within modern human memory. Unlike deep geological periods spanning millions of years, these events record specific subduction ruptures, volcanic caldera collapses, and fault slips.",
    datasetEvidence: [
      { id: "haz_tambora_1815", name: "1815 Tambora Paroxysmal Eruption", age: "1815-04-10", detail: "VEI-7 Volcanic Eruption" },
      { id: "haz_krakatau_1883", name: "1883 Krakatau Volcanic Eruption & Tsunami", age: "1883-08-27", detail: "Volcanic Caldera Collapse" },
      { id: "haz_flores_1992", name: "1992 Flores Earthquake & Tsunami", age: "1992-12-12", detail: "Back-Arc Thrust Rupture" },
      { id: "haz_banda_aceh_2004", name: "2004 Indian Ocean Earthquake & Tsunami", age: "2004-12-26", detail: "Megathrust Subduction Rupture" },
      { id: "haz_sumatra_2005", name: "2005 Nias-Simeulue Megathrust Earthquake", age: "2005-03-28", detail: "Megathrust Rupture Slip" },
      { id: "haz_jogja_2006", name: "2006 Yogyakarta Earthquake", age: "2006-05-27", detail: "Opak Fault Strike-Slip" },
      { id: "haz_sinabung_2010", name: "2010-2021 Mount Sinabung Eruptive Phase", age: "2010 – 2021", detail: "Multi-Year Dome Collapse" },
      { id: "haz_bali_1963", name: "1963 Mount Agung Volcanic Eruption", age: "1963-03-17", detail: "Pyroclastic Flow & Lahar" },
      { id: "haz_palu_2018", name: "2018 Palu Earthquake, Liquefaction & Tsunami", age: "2018-09-28", detail: "Liquefaction & Bay Tsunami" },
      { id: "haz_anak_krakatau_2018", name: "2018 Anak Krakatau Flank Collapse & Tsunami", age: "2018-12-22", detail: "Volcanic Landslide Tsunami" },
      { id: "haz_semeru_2021", name: "2021 Mount Semeru PDC & Lahar", age: "2021-12-04", detail: "Lava Dome PDC & Lahar" }
    ]
  }
};
