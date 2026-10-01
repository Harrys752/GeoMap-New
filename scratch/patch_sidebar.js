const fs = require('fs').

// 1. Update js/i18n/uiStrings.js
let uiCode = fs.readFileSync('js/i18n/uiStrings.js', 'utf8').

const oldEnEv = '    // Geological Evidence Type Filter\n    evidence_filter_label: "Geological Evidence Type",\n    evidence_select_aria: "Filter dataset by geological evidence type",\n    evidence_all_option: "All Evidence Categories ({count})"','.
const newEnEv = '    // Geological Evidence Type Filter\n    evidence_filter_label: "Geological Evidence Type",\n    evidence_select_aria: "Filter dataset by geological evidence type",\n    evidence_all_option: "All Evidence Categories ({count})",\n    evidence_cat_rock: "Rock & Lithology",\n    evidence_cat_fossil: "Fossil & Paleontology",\n    evidence_cat_landform: "Landform & Geomorphology",
    evidence_cat_geological_structure: "Geological Structure",\n    evidence_cat_historical_record: "Historical Record",\n    evidence_cat_uncategorized: "Uncategorized Evidence"','.

const oldIdEv = '    // Jenis Bukti Geologi Filter\n    evidence_filter_label: "Jenis Bukti Geologi",\n    evidence_select_aria: "Filter dataset berdasarkan jenis bukti geologi",\n    evidence_all_option: "Semua Kategori Bukti ({count})"','.
const newIdEv = '    // Jenis Bukti Geologi Filter\n    evidence_filter_label: "Jenis Bukti Geologi",\n    evidence_select_aria: "Filter dataset berdasarkan jenis bukti geologi",\n    evidence_all_option: "Semua Kategori Bukti ({count})",\n    evidence_cat_rock: "Batuan & Litologi",\n    evidence_cat_fossil: "Fosil & Paleontologi",\n    evidence_cat_landform: "Bentang Alam & Geomorfologi",\n    evidence_cat_geological_structure: "Struktur Geologi",\n    evidence_cat_historical_record: "Catatan Historis",\n    evidence_cat_uncategorized: "Bukti Belum Dikategorikan",'.

const oldEnPeriod = '    period_Historical: "Historical Hazards",'.
const newEnPeriod = '    period_Historical: "Historical Hazards",\n    period_triassic: "Triassic",\n    period_cretaceous: "Cretaceous",\n    period_neogene: "Neogene",\n    period_quaternary: "Quaternary",\n    period_historical: "Historical Hazards"','.

const oldIdPeriod = '    period_Historical: "Bahaya Geologi Historis"','.
const newIdPeriod = '    period_Historical: "Bahaya Geologi Historis",\n    period_triassic: "Trias",\n    period_cretaceous: "Kapur",\n    period_neogene: "Neogen",\n    period_quaternary: "Kuarter",\n    period_historical: "Bahaya Geologi Historis"','.


uiCode = uiCode.replace(oldEnEv, newEnEv)
               .replace(oldIdEv, newIdEv)
               .replace(oldEnPeriod, newEnPeriod)
               .replace(oldIdPeriod, newIdPeriod).

fs.writeFileSync('js/i18n/uiStrings.js', uiCode, 'utf8').
console.log('1. uiStrings.js updated').

// 2. Update js/i18n/i18n.js
let i18nCode = fs.readFileSync('js/i18n/i18n.js', 'utf8');
const oldGetCard = 'export function getLocalizedProcessCard(processKey, baseCardOrLang, lang = currentLang) {\n  let baseCard = {};\n  let targetLang = currentLang;\n\n  if (typeof baseCardOrLang === \"string\") {\n    targetLang = baseCardOrLang;\n  } else if (typeof baseCardOrLang === \"object\" && baseCardOrLang !== null) {\n    baseCard = baseCard;\n    if (lang && typeof lang === \"string\") {\n      targetLang = lang;\n    }\n  }\n\n  if (targetLang !== \"id\" || !PROCESS_CARDS_ID[processKey]) {\n    return baseCard && Object.keys(baseCard).length > 0 ? baseCard : (PROCESS_CARDS_ID[processKey] || baseCard);\n  }\n\n  return {\n    ...baseCard,\n    ...PROCESS_CARDS_ID[processKey]\n  };\n}';
const newGetCard = 'export function getLocalizedProcessCard(processKey, baseCardOrLang, lang = currentLang) {\n  let baseCard = null;\n  let targetLang = currentLang;\n\n  if (typeof baseCardOrLang === \"string\") {\n    targetLang = baseCardOrLang;\n  } else if (typeof baseCardOrLang === \"object\" && baseCardOrLang !== null) {\n    baseCard = baseCard;\n    if (lang && typeof lang === \"string\") {\n      targetLang = lang;\n    }\n  }\n\n  if (targetLang !== \"id\" || !PROCESS_CARDS_ID[processKey]) {\n    return (baseCard && Object.keys(baseCard).length > 0) ? baseCard : (PROCESS_CARDS_ID[processKey] || null);\n  }\n\n  const idCard = PROCESS_CARDS_ID[processKey];\n  return {\n    ...(baseCard || {}),\n    ...idCard,\n    name: idCard.name || idCard.title || (baseCard ? baseCard.name : processKey),\n    whatIsIt: idCard.whatIsIt || idCard.what_is_it || (baseCard ? baseCard.whatIsIt : \"\"),\n    howItWorks: idCard.howItWorks || idCard.mechanism || (baseCard ? baseCard.howItWorks : \"\"),\n    indonesianExamples: Array.isArray(idCard.indonesianExamples)\n      ? idCard.indonesianExamples\n      : (idCard.indonesian_examples ? [idCard.indonesian_examples] : (baseCard ? baseCard.indonesianExamples : [])),\n    whatCanWeLearn: idCard.whatCanWeLearn || idCard.what_can_we_learn || (baseCard ? baseCard.whatCanWeLearn : \"\")\n  };\n}';

i18nCode = i18nCode.replace(oldGetCard, newGetCard);
fs.writeFileSync('js/i18n/i18n.js', i18nCode, 'utf8');
console.log('2. i18n.js updated');

// 3. Update js/ui/filterPanel.js
let filterCode = fs.readFileSync('js/ui/filterPanel.js', 'utf8');

const targetProcSection = '        const localizedCard = getLocalizedProcessCard(proc, PROCESS_CARDS[proc], currentLang);\n        const displayName = localizedCard ? localizedCard.name : proc;';
const replaceProcSection = '        const localizedCard = getLocalizedProcessCard(proc, PROCESS_CARDS[proc], currentLang);\n        let displayName = (localizedCard && (localizedCard.name || localizedCard.title)) ? (localizedCard.name || localizedCard.title) : proc;\n        if (displayName && displayName.length > 55) {\n          displayName = displayName.substring(0, 52) + \"...\";\n        }';

const targetPeriodSection = '        const periodKey = `period_${p.toLowerCase()}`;\n        const label = t(periodKey, {}, currentLang) || p;';
const replacePeriodSection = '        const periodKey = `period_${p}`;\n        let label = t(periodKey, {}, currentLang);\n        if (!label || label === periodKey) {\n          const lowerKey = `period_${p.toLowerCase()}`;\n          label = t(lowerKey, {}, currentLang);\n        }\n        if (!label || label.startsWith(\"period_\")) {\n          label = p;\n        }';

const targetEvSection = '        const catKey = `evidence_cat_${cat.toLowerCase().replace(/\\s+/g, \"_\")}`;\n        const label = t(catKey, {}, currentLang) || cat;';
const replaceEvSection = '        const catKey = `evidence_cat_${cat.toLowerCase().replace(/\\s+/g, \"_\")}`;\n        let label = t(catKey, {}, currentLang);\n        if (!label || label === catKey || label.startsWith(\"evidence_cat_\")) {\n          label = cat;\n        }';

filterCode = filterCode.replace(targetProcSection, replaceProcSection)
                      .replace(targetPeriodSection, replacePeriodSection)
                      .replace(targetEvSection, replaceEvSection);

fs.writeFileSync('js/ui/filterPanel.js', filterCode, 'utf8');
console.log('3. filterPanel.js updated');

// 4. Update PROCESS_CARDS_ID in js/i18n/datasetContentId.js
let proseCode = fs.readFileSync('js/i18n/datasetContentId.js', 'utf8');
const pMap = {
  ["Caldera Volcanism"]: {
    "title": "Vulkanisme Kaldera & Supervulkan",
    "name": "Vulkanisme Kaldera & Supervulkan",
    "tag": "Vulkanisme Kataklismik",
    "what_is_it": "Proses ketika letusan gunung api masif mengosongkan dapur magma di bawahnya, menyebabkan runtuhnya permukaan tanah di atasnya menjadi depresi mangkuk raksasa.",
    "whatIsIt": "Proses ketika letusan gunung api masif mengosongkan dapur magma di bawahnya, menyebabkan runtuhnya permukaan tanah di atasnya menjadi depresi mangkuk raksasa.",
    "mechanism": "Ketika volume besar magma kaya silika meletus cepat sebagai abu dan batu apung, atap dapur magma yang kosong runtuh ke bawah di sejanjang patahan melingkar.",
    "howItWorks": "Ketika volume besar magma kaya silika meletus cepat sebagai abu dan batu apung, atap dapur magma yang kosong runtuh ke bawah di sejanjang patahan melingkar.",
    "summary": "Kaldera adalah monumen sisa letusan gunung api terdahsyat yang pernah terjadi di bumi.",
    "indonesian_examples": "Kaldera Danau Toba, Gunung Rinjani & Segara Anak, Gunung Bromo & Kaldera Tengger, Letusan Krakatau 1883",
    "indonesianExamples": ["Kaldera Danau Toba", "Gunung Rinjani & Segara Anak", "Gunung Bromo & Kaldera Tengger", "Letusan Krakatau 1883"],
    "what_can_we_learn": "Letusan kaldera super memperlihatkan pelepasan energi vulkanik ekstrem, pembentukan batuan ignimbrit, dan dampak aerosol belerang pada iklim global.",
    "whatCanWeLearn": "Letusan kaldera super memperlihatkan pelepasan energi vulkanik ekstrem, pembentukan batuan ignimbrit, dan dampak aerosol belerang pada iklim global."
  },
  ["Subduction Arc Volcanism"]: {
    "title": "Vulkanisme Busur Subduksi",
    "name": "Vulkanisme Busur Subduksi",
    "tag": "Morfologi Vulkanik",
    "what_is_it": "Gunung api yang terbentuk di sejanjang batas lempeng tektonik tempat lempeng samudra menunjam ke bawah lempeng lain ke dalam mantel bumi.",
    "whatIsIt": "Gunung api yang terbentuk di sejanjang batas lempeng tektonik tempat lempeng samudra menunjam ke bawah lempeng lain ke dalam mantel bumi.",
    "mechanism": "Ketika lempeng samudra Indo-Australia menunjam ke bawah palung Sunda, pelepasan air menurunkan titik leleh batuan mantel, mimicu magma naik membentuk deretan stratovulkan.",
    "howItWorks": "Ketika lempeng samudra Indo-Australia menujam ke bawah palung Sunda, pelepasan air menurunkan titik leleh batuan mantel, mimicu magma naik membentuk deretan stratovulkan.",
    "summary": "Vulkanisme busur subduksi membangun jajaran pegunungan vulkanik Indonesia.",
    "indonesian_examples": "Gunung Merapi, Letusan Krakatau 1883, Gunung Sinabung, Gunung Semeru",
    "indonesianExamples": ["Gunung Merapi", "Letusan Krakatau 1883", "Gunung Sinabung", "Gunung Semeru"],
    "what_can_we_learn": "Vulkanisme busur subduksi menghasilkan magma andesitik yang rentan erupsi eksplosif dan aliran piroklastik.",
    "whatCanWeLearn": "Vulkanisme busur subduksi menghasilkan magma andesitik yang rentan erupsi eksplosif dan aliran piroklastik."
  },
  ["Plutonic Magmatism & Weathering"]: {
    "title": "Magmatisme Plutonik & Pelapukan",
    "name": "Magmatisme Plutonik & Pelapukan",
    "tag": "Petrologi Beku Dalam",
    "what_is_it": "Pendinginan magma jauh di dalam kerak bumi menjadi granit padat, diikuti pengangkatan tektonik dan pelapukan kimia tropis menjadi lanskap batuan tor membulat.",
    "whatIsIt": "Pendinginan magma jauh di dalam kerak bumi menjadi granit padat, diikuti pengangkatan tektonik dan pelapukan kimia tropis menjadi lanskap batuan tor membulat.",
    "mechanism": "Magma membeku perlahan di kedalaman selama jutaan tahun menjadi granit berbutir kasar. Erosi kemudian menyingkap batuan ke permukaan tropis yang melapukkannya.",
    "howItWorks": "Magma membeku perlahan di kedalaman selama jutaan tahun menjadi granit berbutir kasar. Erosi kemudian menyingkap batuan ke permukaan tropis yang melapukkannya.",
    "summary": "Batuan plutonik merekam evolusi kerak benua purba.",
    "indonesian_examples": "Batu Granit Belitung",
    "indonesianExamples": ["Batu Granit Belitung"],
    "what_can_we_learn": "Menunjukkan bahawa pelapukan kimia tropis mengubah batuan dasar menjadi bentang alam pesisir.",
    "whatCanWeLearn": "Menunjukkan bahawa pelapukan kimia tropis mengubah batuan dasar menjadi bentang alam pesisir."
  },
  ["Fluvial & Terrace Sedimentation"]: {
    "title": "Sedimentasi Fluvial & Teras Sungai",
    "name": "Sedimentasi Fluvial & Teras Sungai",
    "tag": "Sedimentologi Darat",
    "what_is_it": "Pengendapan lumpur, pasir, dan kerikil oleh sistem sungai di sejanjang dataran banjir dan teras sungai purba yang terangkat.",
    "whatIsIt": "Pengendapan lumpur, pasir, dan kerikil oleh sistem sungai di sejanjang dataran banjir dan teras sungai purba yang terangkat.",
    "mechanism": "Sungai mengangkut sedimen dari dataran tinggi vulkanik. Saat banjir, sedimen mengendap di bantaran dan danau, memerangkap sisa-sisa organik dan mengawetkannya sebagai fosil.",
    "howItWorks": "Sungai mengangkut sedimen dari dataran tinggi vulkanik. Saat banjir, sedimen mengendap di bantaran dan danau, memerangkap sisa-sisa organik dan mengawetkannya sebagai fosil.",
    "summary": "Endapan teras sungai berfungsi sebagai kapsul waktu alami pengendapan fosil.",
    "indonesian_examples": "Situs Manusia Purba Sangiran, Lokasi Paleontologi Trinil",
    "indonesianExamples": ["Situs Manusia Purba Sangiran", "Lokasi Paleontologi Trinil"],
    "what_can_we_learn": "Memerangkap lapisan abu vulkanik untuk penanggalan isotop dan fosil hominin purba.",
    "whatCanWeLearn": "Memerangkap lapisan abu vulkanik untuk penanggalan isotop dan fosil hominin purba."
  },
  ["Subduction Accretion & Metamorphism"]: {
    "title": "Akresi Subduksi & Metamorfisme",
    "name": "Akresi Subduksi & Metamorfisme",
    "tag": "Petrologi Metamorf",
    "what_is_it": "Pengikisan, penghancuran, dan metamorfisme tekanan tinggi batuan di zona tumbukan lempeng samudra.",
    "whatIsIt": "Pengikisan, penghancuran, dan metamorfisme tekanan tinggi batuan di zona tumbukan lempeng samudra.",
    "mechanism": "Sedimen dasar laut dan kerak samudra (ofiolit) terkisis dari lempeng penunjam, tertekan hebat, terhablur ulang menjadi sekis metamorf sebelum terangkat ke daratan.",
    "howItWorks": "Sedimen dasar laut dan kerak samudra (ofiolit) terkisis dari lempeng penunjam, tertekan hebat, terhablur ulang menjadi sekis metamorf sebelum terangkat ke daratan.",
    "summary": "Kompleks melange metamorf menyajikan bukti visual langsung kondisi kedalaman palung purba.",
    "indonesian_examples": "Kompleks Batuan Metamorf Geopark Ciletuh, Busur Banda & Palung Weber",
    "indonesianExamples": ["Kompleks Batuan Metamorf Geopark Ciletuh", "Busur Banda & Palung Weber"],
    "what_can_we_learn": "Menyajikan bukti rekonstruksi batas lautan purba yang telah lenyap di masa ratusan juta tahun silam.",
    "whatCanWeLearn": "Menyajikan bukti rekonstruksi batas lautan purba yang telah lenyap di masa ratusan juta tahun silam."
  },
  ["Carbonate Karst & Uplift"]: {
    "title": "Karst Karbonat & Pengangkatan Tektonik",
    "name": "Karst Karbonat & Pengangkatan Tektonik",
    "tag": "Geomorfologi Karst",
    "what_is_it": "Bentang alam yang terbentuk akibat pelarutan kimiawi batu gamping terumbu karang yang terangkat oleh air hujan asam, membentuk gua dan menara karst.",
    "whatIsIt": "Bentang alam yang terbentuk akibat pelarutan kimiawi batu gamping terumbu karang yang terangkat oleh air hujan asam, membentuk gua dan menara karst.",
    "mechanism": "Terumbu karang purba terangkat secara tektonik ke atas muka laut. Air hujan asam melarutkan kalsium karbonat membentuk jaringan gua bawah tanah dan menara karst.",
    "howItWorks": "Terumbu karang purba terangkat secara tektonik ke atas muka laut. Air hujan asam melarutkan kalsium karbonat membentuk jaringan gua bawah tanah dan menara karst.",
    "summary": "Kawasan karst memperlihatkan siklus karbon dalam skala waktu geologi.",
    "indonesian_examples": "Karst Menara Maros-Pangkep, Gua Paleontologi Liang Bua Flores, Karst Pesisir Bali",
    "indonesianExamples": ["Karst Menara Maros-Pangkep", "Gua Paleontologi Liang Bua Flores", "Karst Pesisir Bali"],
    "what_can_we_learn": "Membuat lingkungan terlindung untuk preservasi fosil serta arkeologi purba.",
    "whatCanWeLearn": "Membuat lingkungan terlindung untuk preservasi fosil serta arkeologi purba."
  },
  ["Paleontological Fossilization"]: {
    "title": "Fosilisasi & Preservasi Paleontologi",
    "name": "Fosilisasi & Preservasi Paleontologi",
    "tag": "Tafonomi & Paleontologi",
    "what_is_it": "Pengawetan biologis tulang, gigi, dan cangkang di dalam sedimen atau endapan gua melalui penggantian mineral (mineralisasi).",
    "whatIsIt": "Pengawetan biologis tulang, gigi, dan cangkang di dalam sedimen atau endapan gua melalui penggantian mineral (mineralisasi).",
    "mechanism": "Sisa kerangka yang tertimbun abu vulkanik atau endapan gua mengalami peresapan air tanah kaya mineral yang menggantikan materi organik dengan batuan padat.",
    "howItWorks": "Sisa kerangka yang tertimbun abu vulkanik atau endapan gua mengalami peresapan air tanah kaya mineral yang menggantikan materi organik dengan batuan padat.",
    "summary": "Rekaman fosil memberikan bukti empiris evolusi dan kepunuhan.",
    "indonesian_examples": "Gua Paleontologi Liang Bua Flores, Situs Manusia Purba Sangiran, Lokasi Paleontologi Trinil",
    "indonesianExamples": ["Gua Paleontologi Liang Bua Flores", "Situs Manusia Purba Sangiran", "Lokasi Paleontologi Trinil"],
    "what_can_we_learn": "Memberikan bukti empiris evolusi manusia, adaptasi lingkungan, dan persebaran fauna purba.",
    "whatCanWeLearn": "Memberikan bukti empiris evolusi manusia, adaptasi lingkungan, dan persebaran fauna purba."
  },
  ["Megathrust Seismicity & Tsunami"]: {
    "title": "Seismisitas Megathrust & Tsunami",
    "name": "Seismisitas Megathrust & Tsunami",
    "tag": "Geodinamika Seismik",
    "what_is_it": "Patahan zona subduksi raksasa yang merobek lantai samudera, melepaskan energi seismik dahsyat dan memicu gelombangs tsunami.",
    "whatIsIt": "Patahan zona subduksi raksasa yang merobek lantai samudera, melepaskan energi seismik dahsyat dan memicu gelombangs tsunami.",
    "mechanism": "Lempeng tektonik terkunci di palung subduksi selama berabad-abad mengumpulkan regangan. Saat patah mendadak, lantai samudera terangkat mcuat mendorong massa air laut.",
    "howItWorks": "Lempeng tektonik terkunci di palung subduksi selama berabad-abad mengumpulkan regangan. Saat patah mendadak, lantai samudera terangkat mcuat mendorong massa air laut.",
    "summary": "Peristiwa megathrust adalah ancaman geodinamika terbesar di pesisir samudra.",
    "indonesian_examples": "Gempa & Tsunami Samudra Hindia 2004, Gempa & Tsunami Flores 1992",
    "indonesianExamples": ["Gempa & Tsunami Samudra Hindia 2004", "Gempa & Tsunami Flores 1992"],
    "what_can_we_learn": "Menjelaskan siklus akumulasi regangan subduksi dan fisika perambatan gelombangs tsunami lintas samudra.",
    "whatCanWeLearn": "Menjelaskan siklus akumulasi regangan subduksi dan fisika perambatan gelombangs tsunami lintas samudra."
  },
  ["Intraplate Fault Seismicity"]: {
    "title": "Seismisitas Sesar Kerak Dangkal",
    ������耉M��͵�ͥх́M�ͅȁ-�Ʌ����������(�����х��耉M�͵�ѕ�ѽ����-�Ʌ���(�����ݡ��}��}�Ј耉������յ��兹��ѕɩ�������͕������������ȁ͕ͅȁ��͕ȁ�хԁ��х�����������������Ʌх�������������Մ���(�����ݡ��%�%Ј耉������յ��兹��ѕɩ�������͕������������ȁ͕ͅȁ��͕ȁ�хԁ��х�����������������Ʌх�������������Մ���(������������ʹ�耉	�������Յ����Ʌ��ͅ�������ɝ�͕������͕��������������ɝ�Ʌ�������������х́����ѥ́ѕɱ����դ�����������ͭ������������͕́�͵����ɕ�Օ�ͤ�ѥ���������Ё��ɵխ������(��������%�]�ɭ̈耉	�������Յ����Ʌ��ͅ�������ɝ�͕������͕��������������ɝ�Ʌ�������������х́����ѥ́ѕɱ����դ�����������ͭ�������������͕�͵����ɕ�Օ�ͤ�ѥ���������Ё��ɵխ������(������յ����耉M�ͅȁ��Ʌ����������������ձ��������儁͕�͵���������兹����ѕ�̸��(�����������ͥ��}�ᅵ���̈耉�����e��六��ф����ذ��������1��ե���ͤ�A��Ԁ���ఁM�ͅȁ	�ͅȁMյ��Ʉ����9��Ʌ��M�������(�����������ͥ��ᅵ���̈�l������e��六��ф����؈����������1��ե���ͤ�A��Ԁ��������M�ͅȁ	�ͅȁMյ��Ʉ����9��Ʌ��M������t�(�����ݡ��}���}ݕ}���ɸ�耉5������ͭ���������������ɕ́���Ʌ���є��������լ����������х������������Ё�����ԁ���ե���ͤ�х�������٥����չ�����(�����ݡ����]�1��ɸ�耉5������ͭ���������������ɕ́���Ʌ���є��������լ����������х������������Ё�����ԁ���ե���ͤ�х�������٥����չ����(���)��()����Ё�ɽ�%�͕��̀�=����й���ɥ�̡�5���������m����t������(��ɕ��ɸ��������)M=8���ɥ����䡬�����耜���)M=8���ɥ�����ذ��ձ���Ф�ɕ������q������q������������)��.join('\n');

proseCode = proseCode.replace('export const PROCESS_CARDS_ID = {', 'export const PROCESS_CARDS_ID = {\n' + procInserts);
fs.writeFileSync('js/i18n/datasetContentId.js', proseCode, 'utf8');
console.log('4. datasetContentId.js updated');
