// Book.jsx  –  The Inner Library
// ─────────────────────────────────────────────────────────────────────────────
// WORLD-SPACE CONVENTION (book at rest on shelf, camera along +Z):
//
//   X  = book thickness   (spine width you see on the shelf)
//   Y  = book height      (vertical)
//   Z  = book depth       (pages run front-to-back when on shelf)
//
//  On shelf the spine (+Z face) faces the camera.
//  On click the whole group rotates -90° around Y so the front cover
//  (+X face) faces the camera, then the cover opens from the spine hinge.
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  useRef, useState, useMemo, useCallback, useEffect,
} from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BOOK_STATES, TIMINGS } from '../utils/animationTimings';
import { getBookMaterial, BOOK_COLORS } from '../utils/materialPresets';
import { loadAllCovers } from '../hooks/useCoverDesigner';
import { getBookDimensionsById } from '../utils/bookGeometry';

// ─── colour helpers ───────────────────────────────────────────────────────────
const hexToRgb = (hex) => {
  const c = (hex || '#444444').replace('#', '');
  return {
    r: parseInt(c.substring(0, 2), 16),
    g: parseInt(c.substring(2, 4), 16),
    b: parseInt(c.substring(4, 6), 16),
  };
};
const lighten = (hex, n = 20) => {
  const { r, g, b } = hexToRgb(hex);
  const f = (v) => Math.min(255, v + n).toString(16).padStart(2, '0');
  return `#${f(r)}${f(g)}${f(b)}`;
};
const darken = (hex, n = 20) => {
  const { r, g, b } = hexToRgb(hex);
  const f = (v) => Math.max(0, v - n).toString(16).padStart(2, '0');
  return `#${f(r)}${f(g)}${f(b)}`;
};

// ─── easing ───────────────────────────────────────────────────────────────────
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutCubic  = (t) => 1 - Math.pow(1 - t, 3);
const easeOutBack   = (t) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

// ─── spine texture ────────────────────────────────────────────────────────────
function buildSpineTexture(mat) {
  const W = 256, H = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // base gradient (left-to-right light variation)
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0,   darken(mat.darkColor, 18));
  g.addColorStop(0.1, lighten(mat.darkColor, 12));
  g.addColorStop(0.5, lighten(mat.darkColor, 6));
  g.addColorStop(0.9, lighten(mat.darkColor, 10));
  g.addColorStop(1,   darken(mat.darkColor, 14));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // micro-grain
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * W, y = Math.random() * H;
    const a = 0.012 + Math.random() * 0.018;
    ctx.fillStyle = Math.random() > 0.5
      ? `rgba(255,255,255,${a})`
      : `rgba(0,0,0,${a})`;
    ctx.fillRect(x, y, 1 + Math.random(), 1);
  }

  // raised-band grooves
  if (mat.spineStyle === 'raised_bands') {
    [0.18, 0.32, 0.62, 0.76].forEach((p) => {
      const y = H * p;
      const lg = ctx.createLinearGradient(0, y - 10, 0, y + 10);
      lg.addColorStop(0,   darken(mat.darkColor, 8));
      lg.addColorStop(0.5, lighten(mat.darkColor, 22));
      lg.addColorStop(1,   darken(mat.darkColor, 8));
      ctx.fillStyle = lg;
      ctx.fillRect(0, y - 9, W, 18);
      ctx.fillStyle = mat.accentColor + '60';
      ctx.fillRect(0, y - 10, W, 2);
      ctx.fillRect(0, y + 8,  W, 2);
    });
  }

  // gold accent lines
  ctx.fillStyle = mat.accentColor;
  ctx.globalAlpha = 0.55;
  ctx.fillRect(18, 36,  W - 36, 1.5);
  ctx.fillRect(18, H - 36, W - 36, 1.5);
  ctx.globalAlpha = 1;

  // spine title – rotated
  const label = (mat.spineText || '').replace(/\\n/g, ' ');
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = mat.accentColor;
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 4;
  ctx.font = `bold 36px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, 0);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 8;
  return tex;
}

// ─── cover texture ────────────────────────────────────────────────────────────
function buildCoverTexture(mat, title) {
  const W = 512, H = 768;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // base gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0,    lighten(mat.coverColor, 8));
  bg.addColorStop(0.45, mat.coverColor);
  bg.addColorStop(1,    darken(mat.coverColor, 20));
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // material grain
  const grains = mat.preset === 'cloth' ? 8000 : mat.preset === 'velvet' ? 10000 : 5000;
  for (let i = 0; i < grains; i++) {
    const x = Math.random() * W, y = Math.random() * H;
    const a = 0.008 + Math.random() * 0.018;
    ctx.fillStyle = Math.random() > 0.5
      ? `rgba(255,255,255,${a})`
      : `rgba(0,0,0,${a})`;
    if (mat.preset === 'cloth') ctx.fillRect(x, y, 3 + Math.random() * 3, 1);
    else ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }

  const ac = mat.accentColor;

  if (mat.coverStyle === 'gilt_border') {
    ctx.strokeStyle = ac; ctx.lineWidth = 3;
    ctx.strokeRect(22, 22, W - 44, H - 44);
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, W - 60, H - 60);
    [[28,28],[W-28,28],[28,H-28],[W-28,H-28]].forEach(([cx,cy]) => {
      ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI*2);
      ctx.fillStyle = ac; ctx.fill();
    });
    ctx.save(); ctx.translate(W/2, H * 0.38); ctx.rotate(Math.PI/4);
    ctx.strokeStyle = ac; ctx.lineWidth = 1.5;
    ctx.strokeRect(-22, -22, 44, 44);
    ctx.strokeRect(-14, -14, 28, 28);
    ctx.restore();
  } else if (mat.coverStyle === 'gilt_center') {
    ctx.strokeStyle = ac; ctx.lineWidth = 1.5;
    ctx.strokeRect(36, 36, W-72, H-72);
    ctx.beginPath(); ctx.arc(W/2, H*0.38, 68, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(W/2, H*0.38, 55, 0, Math.PI*2); ctx.stroke();
    for (let i=0;i<12;i++) {
      const a = (i/12)*Math.PI*2;
      ctx.fillStyle = ac;
      ctx.beginPath(); ctx.arc(W/2+Math.cos(a)*80, H*0.38+Math.sin(a)*80, 4, 0, Math.PI*2); ctx.fill();
    }
  } else if (mat.coverStyle === 'embossed') {
    for (let i=0;i<8;i++) {
      const o = 22+i*9;
      ctx.strokeStyle = lighten(mat.coverColor, 16+i*2); ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(o, H-o-i*18); ctx.lineTo(o,o); ctx.lineTo(W-o-i*18,o); ctx.stroke();
    }
  } else if (mat.coverStyle === 'watercolor') {
    for (let i=0;i<12;i++) {
      const x=60+Math.random()*(W-120), y=80+Math.random()*(H-200), r=40+Math.random()*80;
      const wg = ctx.createRadialGradient(x,y,0,x,y,r);
      wg.addColorStop(0, ac+'40'); wg.addColorStop(1, ac+'00');
      ctx.fillStyle=wg; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    }
  } else if (mat.coverStyle === 'minimal') {
    ctx.fillStyle = ac; ctx.globalAlpha = 0.6;
    ctx.fillRect(55, 55, W-110, 1.5);
    ctx.fillRect(55, H-55, W-110, 1.5);
    ctx.globalAlpha = 1;
  }

  // title text
  ctx.fillStyle = ac;
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 3;
  const words = (title||'').split(' ');
  ctx.font = 'bold 28px Georgia, serif';
  ctx.textAlign = 'center';
  if (words.length > 3) {
    const half = Math.ceil(words.length / 2);
    ctx.fillText(words.slice(0, half).join(' '), W/2, H*0.72);
    ctx.fillText(words.slice(half).join(' '),    W/2, H*0.72+38);
  } else {
    ctx.fillText(title||'', W/2, H*0.72);
  }
  ctx.shadowBlur = 0;

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 8;
  return tex;
}

// ─── page-edge texture ────────────────────────────────────────────────────────
function buildPageEdgeTexture() {
  const W = 256, H = 256;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#F0EBE0'; ctx.fillRect(0,0,W,H);
  for (let y=0;y<H;y+=2) {
    ctx.fillStyle = `rgba(0,0,0,${0.015+Math.random()*0.025})`;
    ctx.fillRect(0,y,W,1);
  }
  for (let i=0;i<20;i++) {
    const x=Math.random()*W, y=Math.random()*H, r=1+Math.random()*3;
    ctx.fillStyle = `rgba(190,160,110,${0.06+Math.random()*0.08})`;
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

// ─── inner-page texture ───────────────────────────────────────────────────────
function buildInnerPageTexture() {
  const W = 512, H = 768;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FDFAF4'; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle = 'rgba(180,160,130,0.18)'; ctx.lineWidth=1;
  for (let y=80;y<H-60;y+=28) {
    ctx.beginPath(); ctx.moveTo(70,y); ctx.lineTo(W-60,y); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(200,140,140,0.15)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(90,60); ctx.lineTo(90,H-60); ctx.stroke();
  for (let i=0;i<2000;i++) {
    ctx.fillStyle=`rgba(0,0,0,${0.003+Math.random()*0.007})`;
    ctx.fillRect(Math.random()*W, Math.random()*H, 1, 1);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 4;
  return tex;
}

// ─── main component ───────────────────────────────────────────────────────────
const Book = ({
  book,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  onClick,
  onHover,
  onHoverEnd,
  isSelected = false,
  showBookmark = false,
  bookmarkCount = 0,
  onBookOpen,
  onBookReturn,
  returnToShelf = false,
}) => {
  const groupRef            = useRef();
  const frontCoverPivotRef  = useRef();
  const [hovered, setHovered]       = useState(false);
  const [animState, setAnimState]   = useState(BOOK_STATES.IDLE);
  const animProgress  = useRef(0);
  const snapPos       = useRef(new THREE.Vector3());
  const snapRot       = useRef(new THREE.Euler());

  // ── material ────────────────────────────────────────────────────────────────
  const savedCover = useMemo(() => {
    const all = loadAllCovers(); return all[book.id] || null;
  }, [book.id]);
  const bookMat = useMemo(() => getBookMaterial(book.id), [book.id]);

  const mat = useMemo(() => {
    if (savedCover) return {
      coverColor:  savedCover.colors.cover,
      darkColor:   savedCover.colors.spine,
      accentColor: savedCover.colors.text,
      preset:      savedCover.material,
      spineText:   savedCover.spine?.text || book.spineLabel,
      spineStyle:  bookMat.spineStyle,
      coverStyle:  bookMat.coverStyle,
      ribbonColor: bookMat.ribbonColor,
    };
    const c = bookMat.color || BOOK_COLORS.navy;
    return {
      coverColor:  c.main,
      darkColor:   c.dark,
      accentColor: c.accent,
      preset:      bookMat.preset,
      spineText:   book.spineLabel || book.title,
      spineStyle:  bookMat.spineStyle,
      coverStyle:  bookMat.coverStyle,
      ribbonColor: bookMat.ribbonColor,
    };
  }, [book.spineLabel, book.title, savedCover, bookMat]);

  // ── dimensions ──────────────────────────────────────────────────────────────
  const dims = useMemo(() => getBookDimensionsById(book.id), [book.id]);
  const t  = dims.thickness;   // X
  const h  = dims.height;      // Y
  const d  = dims.depth;       // Z
  const cT = 0.022;            // cover board thickness

  // ── textures ────────────────────────────────────────────────────────────────
  const spineTex     = useMemo(() => buildSpineTexture(mat),            [mat]);
  const coverTex     = useMemo(() => buildCoverTexture(mat, book.title), [mat, book.title]);
  const pageEdgeTex  = useMemo(() => buildPageEdgeTexture(),            []);
  const innerPageTex = useMemo(() => buildInnerPageTexture(),           []);

  // ── per-preset surface props ────────────────────────────────────────────────
  const coverRough = mat.preset === 'leather' ? 0.50 : mat.preset === 'modern' ? 0.18 : 0.70;
  const coverMetal = mat.preset === 'modern'  ? 0.12 : 0.03;
  const spineRough = mat.preset === 'leather' ? 0.45 : 0.62;

  // ── "is book in flight" flag ────────────────────────────────────────────────
  const isMoving = animState === BOOK_STATES.SELECTED
    || animState === BOOK_STATES.CENTERED
    || animState === BOOK_STATES.FLIPPING
    || animState === BOOK_STATES.OPEN
    || animState === BOOK_STATES.RETURNING;

  // ── animation loop ───────────────────────────────────────────────────────────
  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const g   = groupRef.current;
    const cvr = frontCoverPivotRef.current;
    const time = clock.getElapsedTime();

    // IDLE – gentle breathing
    if (animState === BOOK_STATES.IDLE) {
      const breathe = Math.sin(time * 2.1) * 0.006;
      g.position.set(position[0], position[1] + breathe, position[2]);
      g.rotation.set(rotation[0], rotation[1], rotation[2]);
      if (cvr) cvr.rotation.y = 0;
      return;
    }

    // HOVER – lift + lean toward camera
    if (animState === BOOK_STATES.HOVER) {
      g.position.y = THREE.MathUtils.lerp(g.position.y, position[1] + 0.055, 0.09);
      g.position.z = THREE.MathUtils.lerp(g.position.z, position[2] + 0.13,  0.09);
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -0.04,  0.07);
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z,  0.015, 0.07);
      return;
    }

    // SELECTED – slide forward + rotate -90° so the +X front cover faces camera
    if (animState === BOOK_STATES.SELECTED) {
      animProgress.current = Math.min(1, animProgress.current + delta / (TIMINGS.SELECTION_SLIDE / 1000));
      const p = easeInOutCubic(animProgress.current);
      g.position.x = THREE.MathUtils.lerp(snapPos.current.x, position[0],       p);
      g.position.y = THREE.MathUtils.lerp(snapPos.current.y, position[1] + 0.12, p);
      g.position.z = THREE.MathUtils.lerp(snapPos.current.z, position[2] + 2.0,  p);
      g.rotation.x = THREE.MathUtils.lerp(snapRot.current.x, 0,            p);
      g.rotation.y = THREE.MathUtils.lerp(snapRot.current.y, -Math.PI / 2,  p);
      g.rotation.z = THREE.MathUtils.lerp(snapRot.current.z, 0,            p);
      return;
    }

    // CENTERED – glide to screen centre
    if (animState === BOOK_STATES.CENTERED) {
      animProgress.current = Math.min(1, animProgress.current + delta / (TIMINGS.CENTER_MOVE / 1000));
      const p = easeOutBack(Math.min(animProgress.current, 0.98));
      g.position.x = THREE.MathUtils.lerp(snapPos.current.x, 0,   p);
      g.position.y = THREE.MathUtils.lerp(snapPos.current.y, 0.3, p);
      g.position.z = THREE.MathUtils.lerp(snapPos.current.z, 4.5, p);
      g.rotation.set(0, -Math.PI / 2, 0);
      return;
    }

    // FLIPPING – cover swings open (negative rotation to open left-to-right)
    if (animState === BOOK_STATES.FLIPPING) {
      animProgress.current = Math.min(1, animProgress.current + delta / (TIMINGS.BOOK_OPEN / 1000));
      const p = easeOutCubic(animProgress.current);
      g.rotation.set(0, -Math.PI / 2 + 0.06, 0);
      if (cvr) cvr.rotation.y = THREE.MathUtils.lerp(0, -Math.PI * 0.80, p);
      return;
    }

    // OPEN – gentle float
    if (animState === BOOK_STATES.OPEN) {
      g.position.y = 0.3 + Math.sin(time * 1.4) * 0.004;
      return;
    }

    // RETURNING – fly back to shelf
    if (animState === BOOK_STATES.RETURNING) {
      animProgress.current = Math.min(1, animProgress.current + delta / (TIMINGS.RETURN_TO_SHELF / 1000));
      const p = easeInOutCubic(animProgress.current);
      g.position.x = THREE.MathUtils.lerp(snapPos.current.x, position[0], p);
      g.position.y = THREE.MathUtils.lerp(snapPos.current.y, position[1], p);
      g.position.z = THREE.MathUtils.lerp(snapPos.current.z, position[2], p);
      g.rotation.y = THREE.MathUtils.lerp(-Math.PI / 2, 0, p);
      g.rotation.x = 0; g.rotation.z = 0;
      if (cvr) cvr.rotation.y = THREE.MathUtils.lerp(-Math.PI * 0.80, 0, p);
      return;
    }
  });

  // ── state transition helper ──────────────────────────────────────────────────
  const startState = useCallback((next) => {
    if (groupRef.current) {
      snapPos.current.copy(groupRef.current.position);
      snapRot.current.copy(groupRef.current.rotation);
    }
    animProgress.current = 0;
    setAnimState(next);
  }, []);

  // ── pointer events ───────────────────────────────────────────────────────────
  const handlePointerOver = useCallback((e) => {
    e.stopPropagation();
    setHovered(true);
    if (animState === BOOK_STATES.IDLE) startState(BOOK_STATES.HOVER);
    document.body.style.cursor = 'pointer';
    if (onHover) onHover(book.id);
  }, [animState, book.id, onHover, startState]);

  const handlePointerOut = useCallback((e) => {
    e.stopPropagation();
    setHovered(false);
    if (animState === BOOK_STATES.HOVER) startState(BOOK_STATES.IDLE);
    document.body.style.cursor = 'default';
    if (onHoverEnd) onHoverEnd(book.id);
  }, [animState, book.id, onHoverEnd, startState]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (animState !== BOOK_STATES.IDLE && animState !== BOOK_STATES.HOVER) return;
    startState(BOOK_STATES.SELECTED);
    setTimeout(() => {
      startState(BOOK_STATES.CENTERED);
      setTimeout(() => {
        if (frontCoverPivotRef.current) frontCoverPivotRef.current.rotation.y = 0;
        startState(BOOK_STATES.FLIPPING);
        setTimeout(() => {
          setAnimState(BOOK_STATES.OPEN);
          if (onBookOpen) onBookOpen(book);
          if (onClick) onClick(book);
        }, TIMINGS.BOOK_OPEN);
      }, TIMINGS.CENTER_MOVE);
    }, TIMINGS.SELECTION_SLIDE);
  }, [animState, book, onClick, onBookOpen, startState]);

  useEffect(() => {
    if (isSelected && (animState === BOOK_STATES.IDLE || animState === BOOK_STATES.HOVER)) {
      startState(BOOK_STATES.SELECTED);
    }
  }, [isSelected, animState, startState]);

  // ─── handle returnToShelf prop ───
  useEffect(() => {
    if (returnToShelf && animState === BOOK_STATES.OPEN) {
      startState(BOOK_STATES.RETURNING);
      setTimeout(() => {
        startState(BOOK_STATES.IDLE);
        if (onBookReturn) onBookReturn(book.id);
      }, TIMINGS.RETURN_TO_SHELF);
    }
  }, [returnToShelf, animState, startState, onBookReturn, book.id]);

  // ── geometry ──────────────────────────────────────────────────────────────
  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* ══ PAGE BLOCK ══ */}
      <mesh position={[0, 0, -d / 2]} castShadow receiveShadow>
        <boxGeometry args={[t - 0.018, h - 0.03, d - 0.016]} />
        <meshStandardMaterial
          map={pageEdgeTex}
          color="#F0EAD8"
          roughness={0.88}
          metalness={0}
        />
      </mesh>

      {/* ══ BACK COVER ══ */}
      <mesh position={[-t / 2 - cT / 2, 0, -d / 2]} castShadow receiveShadow>
        <boxGeometry args={[cT, h, d]} />
        <meshStandardMaterial
          color={mat.coverColor}
          roughness={coverRough}
          metalness={coverMetal}
        />
      </mesh>

      {/* ══ SPINE BOARD ══ */}
      <mesh position={[0, 0, cT / 2]} castShadow>
        <boxGeometry args={[t, h, cT]} />
        <meshStandardMaterial
          color={mat.darkColor}
          roughness={spineRough}
          metalness={0.05}
        />
      </mesh>

      {/* Spine artwork overlay */}
      <mesh position={[0, 0, cT + 0.001]}>
        <planeGeometry args={[t - 0.008, h - 0.008]} />
        <meshStandardMaterial
          map={spineTex}
          transparent
          opacity={0.97}
          roughness={spineRough}
          metalness={0.04}
        />
      </mesh>

      {/* Raised bands */}
      {mat.spineStyle === 'raised_bands' && (
        [0.18, 0.32, 0.62, 0.76].map((p, i) => (
          <mesh key={i} position={[0, h * (p - 0.5), cT / 2]} castShadow>
            <boxGeometry args={[t + 0.004, 0.028, cT + 0.008]} />
            <meshStandardMaterial
              color={lighten(mat.darkColor, 10)}
              roughness={0.40}
              metalness={0.12}
            />
          </mesh>
        ))
      )}

      {/* Top headband */}
      <mesh position={[0, h / 2 - 0.004, -d / 2]}>
        <boxGeometry args={[t + 0.008, 0.010, d * 0.035]} />
        <meshStandardMaterial color={mat.ribbonColor} roughness={0.38} metalness={0.18} />
      </mesh>
      {/* Bottom tailband */}
      <mesh position={[0, -h / 2 + 0.004, -d / 2]}>
        <boxGeometry args={[t + 0.008, 0.010, d * 0.035]} />
        <meshStandardMaterial color={mat.ribbonColor} roughness={0.38} metalness={0.18} />
      </mesh>

      {/* Top page-edge cap */}
      <mesh position={[0,  h / 2 - 0.008, -d / 2]}>
        <boxGeometry args={[t - 0.016, 0.005, d - 0.03]} />
        <meshStandardMaterial color="#EDE7D8" roughness={0.92} metalness={0} />
      </mesh>
      {/* Bottom page-edge cap */}
      <mesh position={[0, -h / 2 + 0.008, -d / 2]}>
        <boxGeometry args={[t - 0.016, 0.005, d - 0.03]} />
        <meshStandardMaterial color="#EDE7D8" roughness={0.92} metalness={0} />
      </mesh>

      {/* ══ FRONT COVER – pivots open at the SPINE edge ══
          The book spine is the +Z face, so the cover hinge must sit at z=0,
          not at the middle of the page block. The cover then extends backward
          along -Z from this hinge, exactly like a real hardback cover. */}
      <group ref={frontCoverPivotRef} position={[t / 2, 0, 0]}>
        {/* Board centre: slightly outside the page block on +X, halfway back along -Z */}
        <group position={[cT / 2, 0, -d / 2]}>
          {/* Cover board */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[cT, h, d]} />
            <meshStandardMaterial
              color={mat.coverColor}
              roughness={coverRough}
              metalness={coverMetal}
            />
          </mesh>

          {/* Outer face artwork (faces +X → camera after -90° book rotation) */}
          <mesh position={[cT / 2 + 0.001, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[d - 0.008, h - 0.008]} />
            <meshStandardMaterial
              map={coverTex}
              transparent
              opacity={0.97}
              roughness={coverRough - 0.05}
              metalness={coverMetal}
            />
          </mesh>

          {/* Inner endpaper face */}
          <mesh position={[-cT / 2 - 0.001, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[d - 0.008, h - 0.008]} />
            <meshStandardMaterial color="#E8DDD0" roughness={0.78} metalness={0} />
          </mesh>
        </group>

        {/* First flyleaf (only when in motion) */}
        {isMoving && (
          <mesh position={[cT / 2, 0, -d / 2 - 0.004]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[d - 0.03, h - 0.05]} />
            <meshStandardMaterial
              map={innerPageTex}
              roughness={0.90}
              metalness={0}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>

      {/* Inner pages visible from front (only when closed) */}
      {!isMoving && (
        <mesh
          position={[0, 0, -d / 2 + cT + 0.004]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          <planeGeometry args={[d - 0.05, h - 0.07]} />
          <meshStandardMaterial
            map={innerPageTex}
            roughness={0.90}
            metalness={0}
          />
        </mesh>
      )}

      {/* Hover glow shell */}
      {hovered && !isMoving && (
        <mesh position={[0, 0, -d / 2]}>
          <boxGeometry args={[t + 0.05, h + 0.05, d + 0.05]} />
          <meshBasicMaterial
            color={mat.accentColor}
            transparent
            opacity={0.06}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Bookmark */}
      {showBookmark && bookmarkCount > 0 && (
        <Bookmark
          bookHeight={h}
          bookDepth={d}
          bookThickness={t}
          count={bookmarkCount}
        />
      )}
    </group>
  );
};

// ─── Bookmark ─────────────────────────────────────────────────────────────────
const Bookmark = ({ bookHeight, bookDepth, bookThickness, count }) => {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 1.8) * 0.04;
  });
  return (
    <group
      ref={ref}
      position={[bookThickness * 0.25, bookHeight / 2 + 0.08, -bookDepth * 0.45]}
    >
      <mesh castShadow>
        <boxGeometry args={[0.035, 0.26, 0.004]} />
        <meshStandardMaterial color="#C09820" roughness={0.32} metalness={0.35} />
      </mesh>
      {count > 0 && (
        <mesh position={[0, 0.11, 0.005]}>
          <circleGeometry args={[0.030, 12]} />
          <meshBasicMaterial color="#D4A825" />
        </mesh>
      )}
    </group>
  );
};

export default Book;
