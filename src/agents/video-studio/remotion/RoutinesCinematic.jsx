/**
 * routines × MBF Cosmetics — Cinematic product showcase
 * Visual DNA: La Mer restraint · SkinCeuticals precision · Dior editorial
 * 90s · 1080×1920 · 30fps
 */
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const VIDEO_CONFIG = { fps: 30, width: 1080, height: 1920, durationInFrames: 2700 };

// ── Brand palette ─────────────────────────────────────────────────────────────
const C = {
  white:    '#FAFAF8',
  ivory:    '#F0EBE3',
  paper:    '#E8E2DA',
  charcoal: '#0F0F0F',
  grey:     '#4A4A4A',
  muted:    '#9A9490',
  accent:   '#B8A898',
  sage:     '#4A6A5A',
  black:    '#080808',
  darkbg:   '#111110',
};

// ── Fonts ─────────────────────────────────────────────────────────────────────
const SANS  = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const SERIF = 'Georgia, "Times New Roman", serif';

// ── Product catalogue ─────────────────────────────────────────────────────────
const PRODUCTS = [
  {
    id: 'serum-s1',
    name: 'SÉRUM S1',
    subtitle: 'Longevity Complex™',
    claim: '94%',
    claimUnit: 'actifs naturels',
    detail: 'Régénère · Éclaire · Anti-âge',
    bg: C.white,
    accentColor: C.sage,
    tag: 'PROTOCOLE VISAGE',
  },
  {
    id: 'hydratant',
    name: 'HYDRATANT PRO',
    subtitle: 'Barrière Cutanée',
    claim: '+72H',
    claimUnit: 'd\'hydratation',
    detail: 'Céramides · Niacinamide · Panthénol',
    bg: C.ivory,
    accentColor: C.accent,
    tag: 'SOIN QUOTIDIEN',
  },
  {
    id: 'contour',
    name: 'CONTOUR YEUX',
    subtitle: 'Eye Protocol',
    claim: '-52%',
    claimUnit: 'rides d\'expression',
    detail: 'Rétinol 0.1% · Peptides · Caféine',
    bg: C.paper,
    accentColor: C.grey,
    tag: 'SOIN CIBLÉ',
  },
  {
    id: 'nettoyant',
    name: 'NETTOYANT',
    subtitle: 'Enzymatique Doux',
    claim: 'pH 5.5',
    claimUnit: 'sans sulfates',
    detail: 'Respecte le microbiome cutané',
    bg: C.white,
    accentColor: C.sage,
    tag: 'PROTOCOLE NETTOYAGE',
  },
  {
    id: 'spf',
    name: 'SPF 50+',
    subtitle: 'Protection Intelligente',
    claim: '4EN1',
    claimUnit: 'UVA · UVB · IR · Bleu',
    detail: 'Photoprotection + anti-âge quotidien',
    bg: '#F7F4EF',
    accentColor: C.accent,
    tag: 'PROTECTION',
  },
];

// ── Animation helpers ─────────────────────────────────────────────────────────
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };

function fadeIn(frame, start = 0, end = 30) {
  return interpolate(frame, [start, end], [0, 1], clamp);
}

function slideUp(frame, start = 0, end = 40, distance = 36) {
  return interpolate(frame, [start, end], [distance, 0], clamp);
}

function fadeOut(frame, totalFrames, duration = 25) {
  return interpolate(frame, [totalFrames - duration, totalFrames], [1, 0], clamp);
}

function springIn(frame, fps, start = 0, config = { damping: 180, stiffness: 90, mass: 0.6 }) {
  return spring({ frame: frame - start, fps, config });
}

// ── Shared UI components ──────────────────────────────────────────────────────
function HRule({ y, color = C.accent, opacity = 0.5, padX = 0.18 }) {
  return (
    <div style={{
      position: 'absolute',
      top: y, left: `${padX * 100}%`,
      width: `${(1 - padX * 2) * 100}%`,
      height: 0.6,
      background: color,
      opacity,
    }} />
  );
}

function CornerMarks({ color = C.accent, opacity = 0.2 }) {
  const s = { position: 'absolute', width: 44, height: 44, opacity };
  const b = `1.5px solid ${color}`;
  return (
    <>
      <div style={{ ...s, top: 52, left: 52, borderTop: b, borderLeft: b }} />
      <div style={{ ...s, top: 52, right: 52, borderTop: b, borderRight: b }} />
      <div style={{ ...s, bottom: 52, left: 52, borderBottom: b, borderLeft: b }} />
      <div style={{ ...s, bottom: 52, right: 52, borderBottom: b, borderRight: b }} />
    </>
  );
}

function BrandMark({ color = C.muted, bottom = 160 }) {
  return (
    <div style={{
      position: 'absolute', bottom, left: 0, right: 0,
      textAlign: 'center', fontFamily: SANS, fontSize: 18,
      letterSpacing: 9, color, opacity: 0.55,
    }}>
      ROUTINES
    </div>
  );
}

// ── Scene: Brand Intro (0-4s, 0-120f) ────────────────────────────────────────
function SceneIntro({ frame }) {
  const lineW = interpolate(frame, [20, 80], [0, 520], clamp);
  const titleO = fadeIn(frame, 40, 90);
  const titleY = slideUp(frame, 40, 90, 24);
  const subO   = fadeIn(frame, 70, 110);

  return (
    <AbsoluteFill style={{ background: C.black, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', width: '100%' }}>
        <div style={{ width: lineW, height: 0.7, background: C.accent, margin: '0 auto 40px', opacity: 0.6 }} />
        <div style={{
          fontFamily: SANS, fontSize: 72, letterSpacing: 18, color: C.white,
          opacity: titleO, transform: `translateY(${titleY}px)`, fontWeight: 300,
        }}>
          ROUTINES
        </div>
        <div style={{
          fontFamily: SANS, fontSize: 22, letterSpacing: 7, color: C.accent,
          opacity: subO, marginTop: 20,
        }}>
          PAR MBF COSMETICS
        </div>
        <div style={{ width: lineW, height: 0.7, background: C.accent, margin: '40px auto 0', opacity: 0.6 }} />
      </div>
    </AbsoluteFill>
  );
}

// ── Scene: Manifesto (120-330f, 4-11s) ───────────────────────────────────────
function SceneManifesto({ frame }) {
  const total = 210;
  const lineO = fadeIn(frame, 10, 50);
  const l1O   = fadeIn(frame, 30, 70); const l1Y = slideUp(frame, 30, 70);
  const l2O   = fadeIn(frame, 60, 100); const l2Y = slideUp(frame, 60, 100);
  const l3O   = fadeIn(frame, 90, 130); const l3Y = slideUp(frame, 90, 130);
  const fO    = fadeOut(frame, total);

  return (
    <AbsoluteFill style={{ background: C.charcoal, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CornerMarks color={C.accent} opacity={0.15} />
      <div style={{ textAlign: 'center', padding: '0 80px', opacity: fO }}>
        <div style={{ width: 60, height: 0.6, background: C.accent, margin: '0 auto 48px', opacity: lineO }} />
        <div style={{ fontFamily: SERIF, fontSize: 48, color: C.white, lineHeight: 1.5, opacity: l1O, transform: `translateY(${l1Y}px)` }}>
          La science
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 48, color: C.accent, lineHeight: 1.5, opacity: l2O, transform: `translateY(${l2Y}px)` }}>
          au service
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 48, color: C.white, lineHeight: 1.5, opacity: l3O, transform: `translateY(${l3Y}px)` }}>
          de votre longévité.
        </div>
        <div style={{ width: 60, height: 0.6, background: C.accent, margin: '48px auto 0', opacity: lineO }} />
      </div>
    </AbsoluteFill>
  );
}

// ── Scene: Product card (generic, 330f each) ──────────────────────────────────
function SceneProduct({ frame, product, durationFrames }) {
  const { fps } = useVideoConfig();
  const total = durationFrames;

  const bgO    = fadeIn(frame, 0, 40);
  const tagO   = fadeIn(frame, 30, 65);
  const nameS  = springIn(frame, fps, 45);
  const subO   = fadeIn(frame, 75, 110);
  const ruleO  = fadeIn(frame, 90, 120);
  const claimS = springIn(frame, fps, 110, { damping: 200, stiffness: 80, mass: 0.8 });
  const detO   = fadeIn(frame, 140, 175);
  const fO     = fadeOut(frame, total);

  const cy = VIDEO_CONFIG.height / 2;

  return (
    <AbsoluteFill style={{ background: product.bg, opacity: bgO * fO }}>
      <CornerMarks color={product.accentColor} opacity={0.18} />
      <BrandMark />

      {/* Tag */}
      <div style={{
        position: 'absolute', top: cy - 340, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 18,
        letterSpacing: 8, color: product.accentColor, opacity: tagO * fO,
      }}>
        {product.tag}
      </div>

      {/* Top rule */}
      <HRule y={cy - 280} color={product.accentColor} opacity={ruleO * 0.5 * fO} />

      {/* Product name */}
      <div style={{
        position: 'absolute', top: cy - 210, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 100,
        fontWeight: 700, letterSpacing: 2,
        color: C.charcoal, opacity: fO,
        transform: `scale(${0.88 + nameS * 0.12})`,
      }}>
        {product.name}
      </div>

      {/* Subtitle */}
      <div style={{
        position: 'absolute', top: cy - 80, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 28,
        letterSpacing: 6, color: product.accentColor, opacity: subO * fO,
      }}>
        {product.subtitle}
      </div>

      {/* Middle rule */}
      <HRule y={cy - 20} color={C.accent} opacity={ruleO * 0.45 * fO} />

      {/* Claim number — hero data point */}
      <div style={{
        position: 'absolute', top: cy + 30, left: 0, right: 0,
        textAlign: 'center',
        transform: `scale(${0.8 + claimS * 0.2})`,
        opacity: claimS * fO,
      }}>
        <span style={{ fontFamily: SANS, fontSize: 160, fontWeight: 700, color: C.charcoal, letterSpacing: -4 }}>
          {product.claim}
        </span>
      </div>
      <div style={{
        position: 'absolute', top: cy + 220, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 28,
        letterSpacing: 3, color: C.grey, opacity: claimS * fO,
      }}>
        {product.claimUnit}
      </div>

      {/* Bottom rule */}
      <HRule y={cy + 290} color={C.accent} opacity={ruleO * 0.4 * fO} />

      {/* Ingredient detail */}
      <div style={{
        position: 'absolute', top: cy + 330, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 26,
        letterSpacing: 2, color: C.muted, opacity: detO * fO,
        padding: '0 80px',
      }}>
        {product.detail}
      </div>
    </AbsoluteFill>
  );
}

// ── Scene: Collection (1860-2160f, 62-72s) ───────────────────────────────────
function SceneCollection({ frame }) {
  const total = 300;
  const fO = fadeOut(frame, total);
  const bgO = fadeIn(frame, 0, 40);

  return (
    <AbsoluteFill style={{ background: C.white, opacity: bgO * fO }}>
      <CornerMarks color={C.accent} opacity={0.2} />

      {/* Title */}
      <div style={{
        position: 'absolute', top: 160, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS,
        opacity: fadeIn(frame, 20, 60),
      }}>
        <div style={{ fontSize: 20, letterSpacing: 10, color: C.muted }}>LA COLLECTION</div>
        <div style={{ fontSize: 52, fontWeight: 700, color: C.charcoal, marginTop: 16, letterSpacing: 1 }}>ROUTINES</div>
      </div>

      {/* 5-card grid — staggered */}
      {PRODUCTS.map((p, i) => {
        const delay = 40 + i * 25;
        const cardO = fadeIn(frame, delay, delay + 40);
        const cardY = slideUp(frame, delay, delay + 40, 30);
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = col === 0 ? 60 : 570;
        const y = 380 + row * 340 + (i === 4 ? 160 : 0);
        const w = i === 4 ? 460 : 420;
        const cx = i === 4 ? (1080 - w) / 2 : x;

        return (
          <div key={p.id} style={{
            position: 'absolute', left: cx, top: y + cardY,
            width: w, height: 280,
            background: p.bg,
            border: `0.5px solid ${C.line ?? '#D4CCC4'}`,
            opacity: cardO * fO,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '0 24px',
          }}>
            <div style={{ fontFamily: SANS, fontSize: 18, letterSpacing: 6, color: p.accentColor, marginBottom: 10 }}>
              {p.tag}
            </div>
            <div style={{ fontFamily: SANS, fontSize: 36, fontWeight: 700, color: C.charcoal, letterSpacing: 1, textAlign: 'center' }}>
              {p.name}
            </div>
            <div style={{ fontFamily: SANS, fontSize: 18, color: C.muted, marginTop: 8, letterSpacing: 2, textAlign: 'center' }}>
              {p.subtitle}
            </div>
            <div style={{ width: 40, height: 0.5, background: p.accentColor, margin: '12px auto 8px', opacity: 0.5 }} />
            <div style={{ fontFamily: SANS, fontSize: 22, fontWeight: 700, color: C.charcoal }}>
              {p.claim}
            </div>
          </div>
        );
      })}
      <BrandMark />
    </AbsoluteFill>
  );
}

// ── Scene: Maroc Exclusif (2160-2400f, 72-80s) ───────────────────────────────
function SceneMaroc({ frame }) {
  const total = 240;
  const bgO  = fadeIn(frame, 0, 40);
  const fO   = fadeOut(frame, total);
  const l1O  = fadeIn(frame, 30, 70); const l1Y = slideUp(frame, 30, 70);
  const l2O  = fadeIn(frame, 60, 100); const l2Y = slideUp(frame, 60, 100);
  const subO = fadeIn(frame, 100, 140);
  const bodyO = fadeIn(frame, 130, 170);

  return (
    <AbsoluteFill style={{ background: C.paper, opacity: bgO * fO }}>
      <CornerMarks color={C.sage} opacity={0.2} />
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-50%)', textAlign: 'center', padding: '0 80px' }}>
        <div style={{ fontFamily: SANS, fontSize: 18, letterSpacing: 8, color: C.sage, opacity: l1O, marginBottom: 32 }}>
          UNE PREMIÈRE MONDIALE
        </div>
        <div style={{ width: 300, height: 0.6, background: C.accent, margin: '0 auto 40px', opacity: l1O * 0.5 }} />
        <div style={{ fontFamily: SANS, fontSize: 80, fontWeight: 700, color: C.charcoal, opacity: l1O, transform: `translateY(${l1Y}px)`, letterSpacing: 1 }}>
          EXCLUSIVEMENT
        </div>
        <div style={{ fontFamily: SANS, fontSize: 100, fontWeight: 700, color: C.charcoal, opacity: l2O, transform: `translateY(${l2Y}px)`, letterSpacing: 2 }}>
          AU MAROC
        </div>
        <div style={{ width: 300, height: 0.6, background: C.accent, margin: '40px auto', opacity: subO * 0.5 }} />
        <div style={{ fontFamily: SANS, fontSize: 30, color: C.grey, opacity: bodyO, lineHeight: 1.8 }}>
          routines choisit le Maroc<br />
          pour son lancement mondial.
        </div>
        <div style={{ fontFamily: SANS, fontSize: 22, color: C.muted, opacity: bodyO, marginTop: 24, letterSpacing: 2 }}>
          chez MBF Cosmetics · exclusivement
        </div>
      </div>
      <BrandMark />
    </AbsoluteFill>
  );
}

// ── Scene: Teaser Finale A — quote (2400-2580f, 80-86s) ──────────────────────
function SceneTeaserA({ frame }) {
  const total = 180;
  const bgO   = fadeIn(frame, 0, 50);
  const fO    = fadeOut(frame, total, 30);
  const l1O   = fadeIn(frame, 40, 90);
  const l2O   = fadeIn(frame, 65, 115);
  const l3O   = fadeIn(frame, 90, 140);
  const ruleO = fadeIn(frame, 130, 160);

  return (
    <AbsoluteFill style={{ background: C.darkbg, opacity: bgO }}>
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-50%)', textAlign: 'center', padding: '0 80px', opacity: fO }}>
        <div style={{ fontFamily: SERIF, fontSize: 52, color: C.white, lineHeight: 1.6, fontWeight: 400 }}>
          <span style={{ opacity: l1O }}>Certaines peaux</span><br />
          <span style={{ opacity: l2O }}>ont attendu ceci</span><br />
          <span style={{ opacity: l3O }}>toute leur vie.</span>
        </div>
        <div style={{ width: 120, height: 0.7, background: C.accent, margin: '48px auto 0', opacity: ruleO * 0.5 }} />
      </div>
    </AbsoluteFill>
  );
}

// ── Scene: Teaser Finale B — reveal (2580-2700f, 86-90s) ─────────────────────
function SceneTeaserB({ frame }) {
  const total = 120;
  const bgO   = fadeIn(frame, 0, 30);
  const s1O   = fadeIn(frame, 15, 55);
  const ruleO = fadeIn(frame, 40, 70);
  const s2O   = fadeIn(frame, 55, 90);
  const s3O   = fadeIn(frame, 70, 100);
  const s4O   = fadeIn(frame, 85, total);

  return (
    <AbsoluteFill style={{ background: C.black, opacity: bgO }}>
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-50%)', textAlign: 'center' }}>
        <div style={{ fontFamily: SANS, fontSize: 24, letterSpacing: 12, color: C.accent, opacity: s1O }}>
          SÉRUM S1
        </div>
        <div style={{ width: 200, height: 0.6, background: C.muted, margin: '28px auto', opacity: ruleO * 0.3 }} />
        <div style={{ fontFamily: SANS, fontSize: 36, color: C.white, opacity: s2O, lineHeight: 1.7 }}>
          Disponible exclusivement<br />au Maroc
        </div>
        <div style={{ width: 200, height: 0.6, background: C.muted, margin: '28px auto', opacity: ruleO * 0.25 }} />
        <div style={{ fontFamily: SANS, fontSize: 22, letterSpacing: 9, color: C.muted, opacity: s3O }}>
          ROUTINES
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 26, color: C.accent, opacity: s4O, marginTop: 60, letterSpacing: 3 }}>
          Bientôt au Maroc
        </div>
        <div style={{ fontFamily: SANS, fontSize: 20, color: C.muted, opacity: s4O, marginTop: 12, letterSpacing: 2 }}>
          chez MBF Cosmetics exclusivement
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── Root composition ──────────────────────────────────────────────────────────
export function RoutinesCinematic() {
  const frame = useCurrentFrame();

  // Scene offsets (frames)
  const OFF = {
    intro:       0,    // 0-4s
    manifesto:   120,  // 4-11s
    serumS1:     330,  // 11-22s
    hydratant:   660,  // 22-32s
    contour:     960,  // 32-42s
    nettoyant:   1260, // 42-52s
    spf:         1560, // 52-62s
    collection:  1860, // 62-72s
    maroc:       2160, // 72-80s
    teaserA:     2400, // 80-86s
    teaserB:     2580, // 86-90s
  };

  const PRODUCT_DUR = 300; // 10s each

  return (
    <AbsoluteFill>
      <Sequence from={OFF.intro}      durationInFrames={120}>
        <SceneIntro frame={frame - OFF.intro} />
      </Sequence>
      <Sequence from={OFF.manifesto}  durationInFrames={210}>
        <SceneManifesto frame={frame - OFF.manifesto} />
      </Sequence>
      {PRODUCTS.map((product, i) => {
        const start = OFF.serumS1 + i * PRODUCT_DUR;
        return (
          <Sequence key={product.id} from={start} durationInFrames={PRODUCT_DUR}>
            <SceneProduct frame={frame - start} product={product} durationFrames={PRODUCT_DUR} />
          </Sequence>
        );
      })}
      <Sequence from={OFF.collection} durationInFrames={300}>
        <SceneCollection frame={frame - OFF.collection} />
      </Sequence>
      <Sequence from={OFF.maroc}      durationInFrames={240}>
        <SceneMaroc frame={frame - OFF.maroc} />
      </Sequence>
      <Sequence from={OFF.teaserA}    durationInFrames={180}>
        <SceneTeaserA frame={frame - OFF.teaserA} />
      </Sequence>
      <Sequence from={OFF.teaserB}    durationInFrames={120}>
        <SceneTeaserB frame={frame - OFF.teaserB} />
      </Sequence>
    </AbsoluteFill>
  );
}
