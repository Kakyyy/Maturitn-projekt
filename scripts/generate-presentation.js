// Jazyk: JavaScript (JS)
// Popis: Zdrojovy soubor projektu.

/* eslint-disable @typescript-eslint/no-var-requires */

// Script: generuje PowerPoint prezentaci projektu PowerGainz.

// Generates a PowerPoint presentation for the fitness app maturity project.
// Output: ./PowerGainz-prezentace.pptx

const path = require('path');
const fs = require('fs');
const pptxgen = require('pptxgenjs');

const ROOT = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'presentation.config.json');

const DEFAULT_CONFIG = {
  outputFile: 'PowerGainz-prezentace.pptx',
  title: 'Fitness aplikace',
  subtitle: 'maturitní projekt • mobilní fitness aplikace',
  footer: 'Autor: [Jméno a příjmení]  |  [Škola]  |  [Třída]  |  [Datum]',
  pptxAuthor: 'Fitness aplikace',
  images: {},
};

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return { ...DEFAULT_CONFIG };
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`Warning: Failed to read ${CONFIG_PATH}. Using defaults.`);
    return { ...DEFAULT_CONFIG };
  }
}

function parseArgs(argv) {
  const args = { overwrite: false, out: null };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--overwrite') args.overwrite = true;
    if (a === '--out') {
      args.out = argv[i + 1] || null;
      i += 1;
    }
  }
  return args;
}

function resolveOutPath(config, cliArgs) {
  const outFile = cliArgs.out || config.outputFile;
  const requested = path.isAbsolute(outFile) ? outFile : path.join(ROOT, outFile);

  if (fs.existsSync(requested) && !cliArgs.overwrite) {
    const p = path.parse(requested);
    const base = path.join(p.dir, `${p.name}.generated`);
    let safe = `${base}${p.ext}`;
    let n = 2;
    while (fs.existsSync(safe)) {
      safe = `${base}-${n}${p.ext}`;
      n += 1;
    }
    // eslint-disable-next-line no-console
    console.warn(`Output already exists: ${requested}`);
    // eslint-disable-next-line no-console
    console.warn(`Writing to: ${safe} (use --overwrite to replace)`);
    return safe;
  }

  return requested;
}

const COLORS = {
  bg: 'FFFFFF',
  primary: 'D32F2F',
  text: '111111',
  text2: '444444',
  placeholderBorder: 'D0D0D0',
  placeholderFill: 'F7F7F7',
};

const FONT = {
  face: 'Calibri',
  title: 44,
  subtitle: 24,
  body: 26,
  small: 18,
};

function addSoftShadow(pptx, slide, { x, y, w, h, radius = 12 }) {
  // PptxGenJS shadow support depends on the renderer; use a simple offset shape.
  slide.addShape(pptx.ShapeType.roundRect, {
    x: x + 0.06,
    y: y + 0.06,
    w,
    h,
    fill: { color: '000000', transparency: 90 },
    line: { color: '000000', transparency: 100 },
    radius,
  });
}

function safeImagePath(relPath) {
  const p = path.join(ROOT, relPath);
  return fs.existsSync(p) ? p : null;
}

function resolveImagePath(p) {
  if (!p || typeof p !== 'string') return null;
  const abs = path.isAbsolute(p) ? p : path.join(ROOT, p);
  return fs.existsSync(abs) ? abs : null;
}

const LAYOUT = {
  slideW: 13.333,
  slideH: 7.5,
  topBarH: 1.35,
  contentY: 1.95,
  bottomMargin: 0.48,
  bottomBandH: 0.66,
};

function addBlob(pptx, slide, { x, y, w, h, color, transparency }) {
  // Shadow (slightly offset, very transparent) + main blob + subtle highlight.
  slide.addShape(pptx.ShapeType.ellipse, {
    x: x + 0.08,
    y: y + 0.08,
    w,
    h,
    fill: { color: '000000', transparency: 92 },
    line: { color: '000000', transparency: 100 },
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x,
    y,
    w,
    h,
    fill: { color, transparency },
    line: { color, transparency: 100 },
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: x + w * 0.12,
    y: y + h * 0.1,
    w: w * 0.42,
    h: h * 0.42,
    fill: { color: 'FFFFFF', transparency: 88 },
    line: { color: 'FFFFFF', transparency: 100 },
  });
}

function addBottomBand(pptx, slide) {
  // Bottom motif so the slide doesn't feel top-heavy on projectors.
  const y = LAYOUT.slideH - LAYOUT.bottomBandH;
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y,
    w: LAYOUT.slideW,
    h: LAYOUT.bottomBandH,
    fill: { color: COLORS.primary, transparency: 92 },
    line: { color: COLORS.primary, transparency: 100 },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y,
    w: LAYOUT.slideW,
    h: 0.06,
    fill: { color: COLORS.primary, transparency: 84 },
    line: { color: COLORS.primary, transparency: 100 },
  });
  // Keep the bottom motif minimal (avoid a busy look).
}

function addDecorations(pptx, slide) {
  // Cleaner: fewer blobs, still visible on projectors.
  addBlob(pptx, slide, {
    x: 9.9,
    y: 4.85,
    w: 4.05,
    h: 4.05,
    color: COLORS.primary,
    transparency: 89,
  });
  addBlob(pptx, slide, {
    x: 11.15,
    y: -1.05,
    w: 2.55,
    h: 2.55,
    color: 'FFFFFF',
    transparency: 85,
  });
}

function addSlideNumber(slide, slideNumber) {
  slide.addText(String(slideNumber), {
    x: 12.45,
    y: 7.15,
    w: 0.8,
    h: 0.25,
    fontFace: FONT.face,
    fontSize: 14,
    color: COLORS.text2,
    align: 'right',
    valign: 'mid',
  });
}

function addTopBar(pptx, slide, title) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: LAYOUT.slideW,
    h: LAYOUT.topBarH,
    fill: { color: COLORS.primary },
    line: { color: COLORS.primary },
  });

  // Subtle bottom highlight to make the bar feel larger/cleaner.
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: LAYOUT.topBarH - 0.08,
    w: LAYOUT.slideW,
    h: 0.08,
    fill: { color: 'FFFFFF', transparency: 82 },
    line: { color: 'FFFFFF', transparency: 100 },
  });

  // Subtle decorative element on the right.
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 12.2,
    y: -0.2,
    w: 1.65,
    h: 1.65,
    fill: { color: 'FFFFFF', transparency: 80 },
    line: { color: 'FFFFFF', transparency: 100 },
  });

  slide.addText(title, {
    x: 0.6,
    y: 0.32,
    w: 12.2,
    h: 0.9,
    fontFace: FONT.face,
    fontSize: FONT.title,
    bold: true,
    color: 'FFFFFF',
  });
}

function addBullets(slide, bullets) {
  const text = bullets.map((b) => b.trim()).filter(Boolean).join('\n');

  const y = LAYOUT.contentY;
  const h = LAYOUT.slideH - y - LAYOUT.bottomMargin;

  slide.addText(text, {
    x: 0.9,
    y,
    w: 7.4,
    h,
    fontFace: FONT.face,
    fontSize: FONT.body,
    color: COLORS.text,
    valign: 'mid',
    bullet: { indent: 18 },
    paraSpaceAfter: 10,
    lineSpacingMultiple: 1.1,
  });
}

function addScreenshotPlaceholder(pptx, slide, label, config, slideTitle) {
  // Right side box reserved for screenshots.
  const x = 8.55;
  const y = LAYOUT.contentY;
  const w = 4.2;
  const h = LAYOUT.slideH - y - LAYOUT.bottomMargin;

  const imageKey = (config && config.images && (config.images[slideTitle] || config.images[label])) || null;
  const imagePath = resolveImagePath(imageKey);

  addSoftShadow(pptx, slide, { x, y, w, h, radius: 12 });

  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    fill: { color: 'FFFFFF' },
    line: { color: COLORS.placeholderBorder, width: 1 },
    radius: 12,
  });

  if (imagePath) {
    slide.addImage({ path: imagePath, x: x + 0.12, y: y + 0.12, w: w - 0.24, h: h - 0.24 });
    return;
  }

  slide.addText(`SEM DOPLŇ SCREENSHOT\n${label}`, {
    x: x + 0.25,
    y: y + 0.25,
    w: w - 0.5,
    h: h - 0.5,
    fontFace: FONT.face,
    fontSize: FONT.small,
    color: COLORS.text2,
    align: 'center',
    valign: 'mid',
    bold: true,
  });
}

function addCover(pptx, slide, config) {
  slide.background = { color: COLORS.bg };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 7.5,
    fill: { color: COLORS.bg },
    line: { color: COLORS.bg },
  });

  // Modern cover layout (keeps the same color palette).
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.45,
    h: 7.5,
    fill: { color: COLORS.primary },
    line: { color: COLORS.primary },
  });

  // Soft decorative blobs.
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 9.8,
    y: -1.2,
    w: 4.8,
    h: 4.8,
    fill: { color: COLORS.primary, transparency: 90 },
    line: { color: COLORS.primary, transparency: 100 },
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 10.9,
    y: 5.2,
    w: 3.4,
    h: 3.4,
    fill: { color: COLORS.primary, transparency: 92 },
    line: { color: COLORS.primary, transparency: 100 },
  });

  // Title block
  slide.addText(config.title, {
    x: 1.05,
    y: 2.05,
    w: 8.2,
    h: 0.9,
    fontFace: FONT.face,
    fontSize: 56,
    bold: true,
    color: COLORS.text,
    align: 'left',
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 1.05,
    y: 3.02,
    w: 2.35,
    h: 0.08,
    fill: { color: COLORS.primary },
    line: { color: COLORS.primary },
  });

  slide.addText(config.subtitle, {
    x: 1.05,
    y: 3.22,
    w: 8.2,
    h: 0.5,
    fontFace: FONT.face,
    fontSize: FONT.subtitle,
    color: COLORS.text2,
    align: 'left',
  });

  // Logo / visual card
  const card = { x: 9.15, y: 2.05, w: 3.65, h: 3.65, radius: 18 };
  addSoftShadow(pptx, slide, card);
  slide.addShape(pptx.ShapeType.roundRect, {
    ...card,
    fill: { color: 'FFFFFF' },
    line: { color: COLORS.placeholderBorder, width: 1 },
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: card.x + 0.22,
    y: card.y + 0.22,
    w: card.w - 0.44,
    h: 0.12,
    radius: 6,
    fill: { color: COLORS.primary },
    line: { color: COLORS.primary },
  });

  const logo = safeImagePath('assets/images/logo.png') || safeImagePath('assets/images/icon.png');
  if (logo) {
    slide.addImage({ path: logo, x: 9.95, y: 2.9, w: 2.1, h: 2.1 });
  } else {
    slide.addText('LOGO', {
      x: card.x,
      y: card.y + 1.35,
      w: card.w,
      h: 0.6,
      fontFace: FONT.face,
      fontSize: 22,
      color: COLORS.text2,
      align: 'center',
      bold: true,
    });
  }

  slide.addText(config.footer, {
    x: 1.05,
    y: 6.75,
    w: 11.7,
    h: 0.45,
    fontFace: FONT.face,
    fontSize: FONT.small,
    color: COLORS.text2,
    align: 'left',
  });
}

function addStandardSlide(pptx, config, { title, bullets, screenshotLabel, notes }) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bg };

  addDecorations(pptx, slide);
  addBottomBand(pptx, slide);

  addTopBar(pptx, slide, title);
  addBullets(slide, bullets);
  addScreenshotPlaceholder(pptx, slide, screenshotLabel, config, title);

  if (notes) slide.addNotes(notes);

  return slide;
}

function addUsedTechnologiesSlide(pptx) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bg };

  addDecorations(pptx, slide);
  addBottomBand(pptx, slide);

  addTopBar(pptx, slide, 'Použité technologie');

  const technologies = [
    {
      title: 'React Native',
      body: 'Framework pro vývoj mobilní aplikace jedním kódem pro Android/iOS, zvolen pro rychlý vývoj a sdílené UI.',
    },
    {
      title: 'Expo',
      body: 'Nadstavba nad React Native pro snadné spouštění, buildy a práci se zařízeními bez složité konfigurace.',
    },
    {
      title: 'TypeScript',
      body: 'Typovaný JavaScript zvyšuje spolehlivost a čitelnost kódu, proto byl použit pro bezpečnější vývoj.',
    },
    {
      title: 'Firebase',
      body: 'Backend jako služba (Auth/Firestore) pro přihlášení a ukládání dat bez vlastního serveru.',
    },
    {
      title: 'GitHub Copilot',
      body: 'AI asistent pro návrhy kódu a refaktoring, použit pro urychlení práce a kontrolu rutinních částí.',
    },
    {
      title: 'Visual Studio Code',
      body: 'Vývojové prostředí pro práci s projektem, zvolené kvůli rozšířením, TypeScript podpoře a rychlému workflow.',
    },
  ];

  const cardW = 6.05;
  const cardH = 1.65;
  const gapY = 0.25;
  const xLeft = 0.9;
  const xRight = 6.95;
  const yStart = LAYOUT.contentY;

  const addCard = (x, y, tech) => {
    addSoftShadow(pptx, slide, { x, y, w: cardW, h: cardH, radius: 14 });
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: cardW,
      h: cardH,
      fill: { color: 'FFFFFF' },
      line: { color: COLORS.placeholderBorder, width: 1 },
      radius: 14,
    });
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.16,
      y: y + 0.2,
      w: 0.12,
      h: cardH - 0.4,
      fill: { color: COLORS.primary },
      line: { color: COLORS.primary },
      radius: 4,
    });
    slide.addText(tech.title, {
      x: x + 0.4,
      y: y + 0.2,
      w: cardW - 0.6,
      h: 0.35,
      fontFace: FONT.face,
      fontSize: 22,
      bold: true,
      color: COLORS.text,
      align: 'left',
    });
    slide.addText(tech.body, {
      x: x + 0.4,
      y: y + 0.6,
      w: cardW - 0.6,
      h: 0.95,
      fontFace: FONT.face,
      fontSize: 16,
      color: COLORS.text2,
      align: 'left',
      valign: 'top',
    });
  };

  technologies.slice(0, 3).forEach((tech, i) => {
    addCard(xLeft, yStart + i * (cardH + gapY), tech);
  });
  technologies.slice(3).forEach((tech, i) => {
    addCard(xRight, yStart + i * (cardH + gapY), tech);
  });

  slide.addNotes('Ke každé technologii řekni 1 větu: k čemu je a proč byla zvolená.');

  return slide;
}

function addProjectStatusSlide(pptx) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bg };

  addDecorations(pptx, slide);
  addBottomBand(pptx, slide);

  addTopBar(pptx, slide, 'Současný stav projektu');

  const boxY = LAYOUT.contentY;
  const boxH = LAYOUT.slideH - boxY - LAYOUT.bottomMargin;
  const boxW = 6.05;
  const leftX = 0.9;
  const rightX = 6.95;

  const addStatusBox = ({ x, title, bullets }) => {
    addSoftShadow(pptx, slide, { x, y: boxY, w: boxW, h: boxH, radius: 16 });
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y: boxY,
      w: boxW,
      h: boxH,
      fill: { color: COLORS.placeholderFill },
      line: { color: COLORS.placeholderBorder, width: 1 },
      radius: 16,
    });

    slide.addText(title, {
      x: x + 0.35,
      y: boxY + 0.3,
      w: boxW - 0.7,
      h: 0.4,
      fontFace: FONT.face,
      fontSize: 22,
      bold: true,
      color: COLORS.primary,
      align: 'left',
    });

    const text = bullets.map((b) => b.trim()).filter(Boolean).join('\n');
    slide.addText(text, {
      x: x + 0.35,
      y: boxY + 0.85,
      w: boxW - 0.7,
      h: boxH - 1.1,
      fontFace: FONT.face,
      fontSize: 18,
      color: COLORS.text,
      valign: 'mid',
      bullet: { indent: 16 },
      paraSpaceAfter: 8,
      lineSpacingMultiple: 1.15,
    });
  };

  addStatusBox({
    x: leftX,
    title: 'Hotové funkce',
    bullets: [
      'Základ aplikace (React Native + Expo)',
      'Navigace mezi obrazovkami (Expo Router, taby + detail)',
      'Přihlášení / registrace (pokud je zapnuto)',
      'Základní propojení s Firebase (Auth/Firestore – pokud je hotové)',
      'Výběr svalové partie na těle (předek/zadek, muž/žena)',
      'Databáze cviků + detail s postupem',
      'Tvorba tréninku (základ) + ukládání (pokud je hotové)',
    ],
  });

  addStatusBox({
    x: rightX,
    title: 'Plánované funkce',
    bullets: [
      'Rozšíření práce s tréninky (historie, úpravy, šablony)',
      'Sledování progresu (statistiky, grafy, osobní rekordy)',
      'Rozšíření databáze cviků (více cviků, vyhledávání/filtry)',
      'Uživatelské účty: úprava profilu, změna hesla',
      'Vylepšení UI, testování a optimalizace výkonu',
    ],
  });

  slide.addNotes('Pokud něco nesedí, uprav bodově (hotové vs plánované).');

  return slide;
}

function main() {
  const config = loadConfig();
  const cliArgs = parseArgs(process.argv.slice(2));
  const outPath = resolveOutPath(config, cliArgs);

  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = config.pptxAuthor;

  const slides = [];

  // Cover
  const cover = pptx.addSlide();
  addCover(pptx, cover, config);
  slides.push(cover);

  slides.push(addStandardSlide(pptx, config, {
    title: 'Motivace a cíl',
    bullets: [
      'Problém: často nevím, co cvičit na partii',
      'Cíl: přehled cviků + postup + vlastní tréninky',
      'Důraz: jednoduchost a rychlá orientace',
    ],
    screenshotLabel: 'Home / úvod',
    notes: 'Řekni, proč je to užitečné v praxi (rychlá volba cviku + správná technika).',
  }));

  slides.push(addStandardSlide(pptx, config, {
    title: 'Jak to funguje (flow)',
    bullets: [
      'Registrace / přihlášení',
      'Výběr partie na těle',
      'Seznam cviků + detail',
      'Trénink + uložení do databáze',
    ],
    screenshotLabel: 'Koláž: Login + Výběr partie + Nový trénink',
    notes: 'Krátký příklad: „Dnes záda → vyberu záda → vyberu cvik → přidám do tréninku“.',
  }));

  slides.push(addStandardSlide(pptx, config, {
    title: 'Hlavní funkce',
    bullets: [
      'Interaktivní výběr partie (předek / zadek)',
      'Databáze cviků + detail s postupem',
      'Nový trénink: série / opakování / váha',
      'Profil: pohlaví + tréninkový cíl',
    ],
    screenshotLabel: 'Výběr partie (wow obrazovka)',
    notes: 'Rychlý přehled a pak demo.',
  }));

  slides.push(addStandardSlide(pptx, config, {
    title: 'Přihlášení a účet',
    bullets: [
      'Uživatel má vlastní účet',
      'Data jsou „moje“: profil + tréninky',
      'Základ profilu (pohlaví) se uloží při registraci',
    ],
    screenshotLabel: 'Login / Register',
    notes: 'Proč účet: ukládání profilu a tréninků do databáze.',
  }));

  slides.push(addStandardSlide(pptx, config, {
    title: 'Výběr partie na těle',
    bullets: [
      'Klik na oblast = vybraná partie',
      'Otočení: přední / zadní strana',
      'Pohlaví v profilu mění model',
    ],
    screenshotLabel: 'Front + Back',
    notes: 'Krátké demo kliknutí + otočení modelu.',
  }));

  slides.push(addStandardSlide(pptx, config, {
    title: 'Seznam cviků pro partii',
    bullets: [
      'Po výběru partie vidím seznam cviků',
      'Řazení: A→Z / Z→A / obtížnost',
      'Přehled: název + vybavení + obtížnost (hvězdy)',
    ],
    screenshotLabel: 'muscle/[type]',
    notes: 'Důraz na rychlou orientaci.',
  }));

  slides.push(addStandardSlide(pptx, config, {
    title: 'Detail cviku (postup)',
    bullets: [
      'Partie a vybavení nahoře',
      'Postup krok za krokem',
      'Cíl: uživatel ví, jak cvik provést',
    ],
    screenshotLabel: 'exercise/[id]',
    notes: 'Projdi 2–3 kroky instrukcí (technika).',
  }));

  slides.push(addStandardSlide(pptx, config, {
    title: 'Nový trénink (plán)',
    bullets: [
      'Vytvořím trénink a pojmenuju ho',
      'Přidám cviky + série/opakování/váhu',
      'Varování při odchodu bez uložení',
    ],
    screenshotLabel: 'new-workout',
    notes: 'Ukaž přidání cviku, úpravu hodnot a uložení do databáze.',
  }));

  slides.push(addStandardSlide(pptx, config, {
    title: 'Profil',
    bullets: [
      'Jméno a základní údaje (věk/výška/váha)',
      'Tréninkový cíl: síla / hmota / vytrvalost',
      'Uložení do databáze',
    ],
    screenshotLabel: 'Profil',
    notes: 'Profil jako základ pro personalizaci (např. správný model těla).',
  }));

  slides.push(addUsedTechnologiesSlide(pptx));
  slides.push(addProjectStatusSlide(pptx));

  slides.push(addStandardSlide(pptx, config, {
    title: 'Závěr + další kroky',
    bullets: [
      'Naučil jsem se: mobilní UI, navigace, databáze',
      'Nejtěžší: ukládání a načítání uživatelských dat',
      'Další kroky: statistiky, historie, vlastní cviky',
      'Demo + dotazy',
    ],
    screenshotLabel: 'Finální hezký screen',
    notes: 'Krátké demo (max 60 s) + Q&A.',
  }));

  // Page numbering: start from slide 2 (index 1).
  for (let i = 1; i < slides.length; i += 1) {
    addSlideNumber(slides[i], i + 1);
  }

  pptx.writeFile({ fileName: outPath });
  // eslint-disable-next-line no-console
  console.log(`Generated: ${outPath}`);
}

main();

