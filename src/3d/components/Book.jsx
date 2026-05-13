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

  // base gradient (left-to-right light variation simulating curvature)
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0,   darken(mat.darkColor, 22));
  g.addColorStop(0.08, darken(mat.darkColor, 12));
  g.addColorStop(0.25, lighten(mat.darkColor, 8));
  g.addColorStop(0.5,  lighten(mat.darkColor, 14));
  g.addColorStop(0.75, lighten(mat.darkColor, 8));
  g.addColorStop(0.92, darken(mat.darkColor, 10));
  g.addColorStop(1,   darken(mat.darkColor, 20));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // vertical highlight streak (simulates light catching the rounded spine)
  const vg = ctx.createLinearGradient(0, 0, W, 0);
  vg.addColorStop(0,   'rgba(255,255,255,0)');
  vg.addColorStop(0.35, 'rgba(255,255,255,0.03)');
  vg.addColorStop(0.5,  'rgba(255,255,255,0.06)');
  vg.addColorStop(0.65, 'rgba(255,255,255,0.03)');
  vg.addColorStop(1,   'rgba(255,255,255,0)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  // leather/cloth micro-grain
  const isLeather = mat.preset === 'leather';
  const grainCount = isLeather ? 10000 : 6000;
  for (let i = 0; i < grainCount; i++) {
    const x = Math.random() * W, y = Math.random() * H;
    const a = 0.012 + Math.random() * 0.02;
    if (isLeather) {
      // Leather has tiny pores and creases
      if (Math.random() > 0.85) {
        ctx.fillStyle = `rgba(0,0,0,${a * 2})`;
        ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random());
      } else {
        ctx.fillStyle = Math.random() > 0.5
          ? `rgba(255,255,255,${a * 0.5})`
          : `rgba(0,0,0,${a * 0.8})`;
        ctx.fillRect(x, y, 1, 1);
      }
    } else {
      ctx.fillStyle = Math.random() > 0.5
        ? `rgba(255,255,255,${a})`
        : `rgba(0,0,0,${a})`;
      if (mat.preset === 'cloth') ctx.fillRect(x, y, 2 + Math.random() * 3, 1);
      else ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }
  }

  // raised-band grooves
  if (mat.spineStyle === 'raised_bands') {
    [0.18, 0.32, 0.62, 0.76].forEach((p) => {
      const y = H * p;
      const lg = ctx.createLinearGradient(0, y - 12, 0, y + 12);
      lg.addColorStop(0,   darken(mat.darkColor, 12));
      lg.addColorStop(0.3, lighten(mat.darkColor, 28));
      lg.addColorStop(0.5, lighten(mat.darkColor, 32));
      lg.addColorStop(0.7, lighten(mat.darkColor, 28));
      lg.addColorStop(1,   darken(mat.darkColor, 12));
      ctx.fillStyle = lg;
      ctx.fillRect(2, y - 10, W - 4, 20);
      // band edge highlights
      ctx.fillStyle = mat.accentColor + '70';
      ctx.fillRect(2, y - 11, W - 4, 1.5);
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(2, y + 9, W - 4, 1.5);
    });
  }

  // gold accent lines at top and bottom
  ctx.fillStyle = mat.accentColor;
  ctx.globalAlpha = 0.55;
  ctx.fillRect(14, 30,  W - 28, 1.8);
  ctx.fillRect(14, 36,  W - 28, 0.5);
  ctx.fillRect(14, H - 32, W - 28, 1.8);
  ctx.fillRect(14, H - 38, W - 28, 0.5);
  ctx.globalAlpha = 1;

  // spine title – rotated
  const label = (mat.spineText || '').replace(/\\n/g, ' ');
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = mat.accentColor;
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 5;
  ctx.font = `bold 34px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, 0);
  // Second pass without shadow for crispness
  ctx.shadowBlur = 0;
  ctx.fillText(label, 0, 0);
  ctx.restore();

  // Subtle edge wear marks
  ctx.globalAlpha = 0.04;
  for (let i = 0; i < 30; i++) {
    const wx = Math.random() < 0.5 ? Math.random() * 12 : W - Math.random() * 12;
    const wy = Math.random() * H;
    ctx.fillStyle = 'rgba(200,180,140,0.3)';
    ctx.fillRect(wx, wy, 2 + Math.random() * 4, 1 + Math.random() * 2);
  }
  ctx.globalAlpha = 1;

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

  // base gradient with better curvature simulation
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0,    lighten(mat.coverColor, 12));
  bg.addColorStop(0.2,  lighten(mat.coverColor, 6));
  bg.addColorStop(0.45, mat.coverColor);
  bg.addColorStop(0.7,  darken(mat.coverColor, 10));
  bg.addColorStop(1,    darken(mat.coverColor, 24));
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Spine edge shadow (left side gets darker near the hinge)
  const hingeShadow = ctx.createLinearGradient(0, 0, W * 0.12, 0);
  hingeShadow.addColorStop(0, 'rgba(0,0,0,0.15)');
  hingeShadow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = hingeShadow;
  ctx.fillRect(0, 0, W * 0.12, H);

  // material grain - varies by preset
  const isLeather = mat.preset === 'leather';
  const grains = isLeather ? 12000 : mat.preset === 'cloth' ? 8000 : mat.preset === 'velvet' ? 10000 : 5000;
  for (let i = 0; i < grains; i++) {
    const x = Math.random() * W, y = Math.random() * H;
    const a = 0.008 + Math.random() * 0.018;
    if (isLeather) {
      // Leather pores
      if (Math.random() > 0.9) {
        ctx.fillStyle = `rgba(0,0,0,${a * 1.5})`;
        ctx.beginPath();
        ctx.arc(x, y, 0.5 + Math.random(), 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = Math.random() > 0.5
          ? `rgba(255,255,255,${a * 0.5})`
          : `rgba(0,0,0,${a * 0.7})`;
        ctx.fillRect(x, y, 1, 1);
      }
    } else if (mat.preset === 'cloth') {
      ctx.fillStyle = Math.random() > 0.5
        ? `rgba(255,255,255,${a})`
        : `rgba(0,0,0,${a})`;
      ctx.fillRect(x, y, 3 + Math.random() * 3, 1);
    } else {
      ctx.fillStyle = Math.random() > 0.5
        ? `rgba(255,255,255,${a})`
        : `rgba(0,0,0,${a})`;
      ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }
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
  } else if (mat.coverStyle === 'art_deco') {
    // Art Deco style – bold geometric lines, sunburst, zigzag
    ctx.strokeStyle = ac; ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, W-40, H-40);
    ctx.lineWidth = 1;
    ctx.strokeRect(28, 28, W-56, H-56);
    // Sunburst rays from top center
    ctx.save(); ctx.translate(W/2, 0);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 0.6 - Math.PI * 0.3;
      ctx.strokeStyle = ac; ctx.globalAlpha = 0.3;
      ctx.beginPath(); ctx.moveTo(0, 28);
      ctx.lineTo(Math.cos(a) * 300, Math.sin(a) * 300 + 28);
      ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.restore();
    // Zigzag border at bottom
    ctx.strokeStyle = ac; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 28; x < W - 28; x += 18) {
      const zigY = H - 80 + ((x / 18) % 2 === 0 ? 0 : 12);
      if (x === 28) ctx.moveTo(x, zigY);
      else ctx.lineTo(x, zigY);
    }
    ctx.stroke();
    // Corner chevrons
    [[40, 40], [W-40, 40], [40, H-40], [W-40, H-40]].forEach(([cx, cy]) => {
      ctx.save(); ctx.translate(cx, cy);
      ctx.strokeStyle = ac; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(0, -8); ctx.lineTo(8, 0); ctx.stroke();
      ctx.restore();
    });
  } else if (mat.coverStyle === 'ornate') {
    // Ornate Victorian style – elaborate scrollwork, double borders, corner flourishes
    ctx.strokeStyle = ac; ctx.lineWidth = 2.5;
    ctx.strokeRect(18, 18, W-36, H-36);
    ctx.lineWidth = 1;
    ctx.strokeRect(26, 26, W-52, H-52);
    // Inner decorative frame
    ctx.lineWidth = 0.8;
    ctx.strokeRect(38, 38, W-76, H-76);
    // Corner flourishes
    [[32, 32, 1, 1], [W-32, 32, -1, 1], [32, H-32, 1, -1], [W-32, H-32, -1, -1]].forEach(([cx, cy, dx, dy]) => {
      ctx.save(); ctx.translate(cx, cy);
      ctx.strokeStyle = ac; ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, dy * 30); ctx.bezierCurveTo(0, 0, dx * 30, 0, dx * 30, dy * 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(dx * 5, 0); ctx.bezierCurveTo(dx * 10, dy * 10, dx * 20, dy * 5, dx * 30, 0);
      ctx.stroke();
      ctx.restore();
    });
    // Central oval medallion
    ctx.strokeStyle = ac; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(W/2, H*0.38, 75, 55, 0, 0, Math.PI*2); ctx.stroke();
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.ellipse(W/2, H*0.38, 65, 45, 0, 0, Math.PI*2); ctx.stroke();
  } else if (mat.coverStyle === 'floral_vine') {
    // Floral vine – organic botanical illustration
    ctx.strokeStyle = ac; ctx.lineWidth = 1.2;
    // Vine from bottom-left
    ctx.beginPath();
    ctx.moveTo(40, H - 40);
    ctx.bezierCurveTo(80, H - 120, 60, H - 200, 120, H * 0.55);
    ctx.bezierCurveTo(140, H * 0.45, 100, H * 0.35, 160, H * 0.3);
    ctx.stroke();
    // Leaves along vine
    for (let i = 0; i < 6; i++) {
      const t = 0.15 + i * 0.14;
      const lx = 40 + (120 - 40) * t + Math.sin(t * 4) * 20;
      const ly = (H - 40) - ((H - 40) - H * 0.3) * t;
      ctx.save(); ctx.translate(lx, ly); ctx.rotate(-0.3 + i * 0.15);
      ctx.fillStyle = ac; ctx.globalAlpha = 0.25;
      ctx.beginPath(); ctx.ellipse(0, 0, 18, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1; ctx.restore();
    }
    // Small flower buds
    [[100, H * 0.65], [140, H * 0.45], [80, H * 0.55]].forEach(([fx, fy]) => {
      ctx.strokeStyle = ac; ctx.lineWidth = 1;
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(fx + Math.cos(a) * 6, fy + Math.sin(a) * 6, 5, 3, a, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    // Simple border
    ctx.strokeStyle = ac; ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, W-60, H-60);
  } else if (mat.coverStyle === 'geometric_modern') {
    // Modern geometric – overlapping shapes, clean lines
    ctx.strokeStyle = ac; ctx.lineWidth = 1;
    // Overlapping circles
    ctx.globalAlpha = 0.12;
    [[W*0.3, H*0.3, 80], [W*0.6, H*0.25, 60], [W*0.5, H*0.5, 90], [W*0.35, H*0.6, 50]].forEach(([cx, cy, r]) => {
      ctx.fillStyle = ac;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    // Thin geometric lines
    ctx.strokeStyle = ac; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(40, H * 0.15); ctx.lineTo(W - 40, H * 0.15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(40, H * 0.85); ctx.lineTo(W - 40, H * 0.85); ctx.stroke();
    // Small square accent
    ctx.strokeStyle = ac; ctx.lineWidth = 1.5;
    ctx.strokeRect(W/2 - 20, H*0.35 - 20, 40, 40);
  } else if (mat.coverStyle === 'typographic') {
    // Typographic style – decorative text treatment, large initial letter
    // Large decorative initial
    ctx.fillStyle = ac; ctx.globalAlpha = 0.12;
    ctx.font = 'bold 280px Georgia, serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const initial = (title || 'B').charAt(0).toUpperCase();
    ctx.fillText(initial, W/2, H * 0.35);
    ctx.globalAlpha = 1;
    // Double rule
    ctx.strokeStyle = ac; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(60, H * 0.6); ctx.lineTo(W - 60, H * 0.6); ctx.stroke();
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(70, H * 0.62); ctx.lineTo(W - 70, H * 0.62); ctx.stroke();
    // Small decorative dot
    ctx.fillStyle = ac;
    ctx.beginPath(); ctx.arc(W/2, H * 0.64, 4, 0, Math.PI * 2); ctx.fill();
  } else if (mat.coverStyle === 'stars') {
    // Celestial stars pattern
    ctx.fillStyle = ac; ctx.globalAlpha = 0.35;
    for (let i = 0; i < 30; i++) {
      const sx = 30 + Math.random() * (W - 60);
      const sy = 30 + Math.random() * (H - 100);
      const sr = 2 + Math.random() * 5;
      // Draw 5-pointed star
      ctx.beginPath();
      for (let j = 0; j < 10; j++) {
        const a = (j / 10) * Math.PI * 2 - Math.PI / 2;
        const r2 = j % 2 === 0 ? sr : sr * 0.4;
        if (j === 0) ctx.moveTo(sx + Math.cos(a) * r2, sy + Math.sin(a) * r2);
        else ctx.lineTo(sx + Math.cos(a) * r2, sy + Math.sin(a) * r2);
      }
      ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Crescent moon
    ctx.strokeStyle = ac; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.arc(W/2, H*0.3, 35, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(W/2 + 12, H*0.3 - 5, 30, 0, Math.PI*2); ctx.stroke();
    ctx.globalAlpha = 1;
    // Border
    ctx.strokeStyle = ac; ctx.lineWidth = 1;
    ctx.strokeRect(25, 25, W-50, H-50);
  } else if (mat.coverStyle === 'marbled') {
    // Marbled paper effect
    for (let i = 0; i < 20; i++) {
      const mx = Math.random() * W;
      const my = Math.random() * H;
      const mr = 30 + Math.random() * 80;
      const mg = ctx.createRadialGradient(mx, my, 0, mx + mr * 0.3, my + mr * 0.2, mr);
      mg.addColorStop(0, ac + '30');
      mg.addColorStop(0.3, ac + '18');
      mg.addColorStop(0.6, lighten(mat.coverColor, 30) + '15');
      mg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = mg;
      ctx.beginPath();
      // Wavy shape
      ctx.moveTo(mx, my - mr);
      for (let a = 0; a < Math.PI * 2; a += 0.1) {
        const wave = Math.sin(a * 3 + i) * mr * 0.2;
        ctx.lineTo(mx + Math.cos(a) * (mr + wave), my + Math.sin(a) * (mr + wave));
      }
      ctx.closePath(); ctx.fill();
    }
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
  // Creamy page background
  ctx.fillStyle = '#F0EBE0';
  ctx.fillRect(0, 0, W, H);
  // Horizontal page-edge lines (visible when looking at page stack from the side)
  for (let y = 0; y < H; y += 2) {
    const shade = 0.012 + Math.random() * 0.022;
    ctx.fillStyle = `rgba(0,0,0,${shade})`;
    ctx.fillRect(0, y, W, 1);
  }
  // Small foxing/age spots
  for (let i = 0; i < 25; i++) {
    const x = Math.random() * W, y = Math.random() * H, r = 1 + Math.random() * 3;
    ctx.fillStyle = `rgba(190,160,110,${0.06 + Math.random() * 0.08})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  // Subtle page ripple shadows (simulates slight waviness)
  for (let i = 0; i < 8; i++) {
    const startX = Math.random() * W;
    ctx.strokeStyle = `rgba(0,0,0,${0.02 + Math.random() * 0.02})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(startX, 0);
    for (let y = 0; y < H; y += 10) {
      ctx.lineTo(startX + Math.sin(y * 0.05 + i) * 3, y);
    }
    ctx.stroke();
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


// ──── open-page content texture (right page when book is open) ────────────
function buildOpenPageContentTexture(book, mat) {
  const W = 512, H = 768;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Warm parchment background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#FDFAF4');
  bg.addColorStop(0.5, '#FAF6EE');
  bg.addColorStop(1, '#F5F0E8');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle ruled lines
  ctx.strokeStyle = 'rgba(180,160,130,0.10)';
  ctx.lineWidth = 0.5;
  for (let y = 90; y < H - 70; y += 26) {
    ctx.beginPath(); ctx.moveTo(55, y); ctx.lineTo(W - 55, y); ctx.stroke();
  }

  // Red margin line
  ctx.strokeStyle = 'rgba(200,140,140,0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(75, 45); ctx.lineTo(75, H - 45); ctx.stroke();

  // Spine gutter shadow at center
  const gutterGrad = ctx.createLinearGradient(W / 2 - 15, 0, W / 2 + 15, 0);
  gutterGrad.addColorStop(0, 'rgba(0,0,0,0)');
  gutterGrad.addColorStop(0.4, 'rgba(0,0,0,0.04)');
  gutterGrad.addColorStop(0.5, 'rgba(0,0,0,0.06)');
  gutterGrad.addColorStop(0.6, 'rgba(0,0,0,0.04)');
  gutterGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gutterGrad;
  ctx.fillRect(W / 2 - 15, 0, 30, H);

  // Page aging speckles
  for (let i = 0; i < 1200; i++) {
    ctx.fillStyle = `rgba(0,0,0,${0.002 + Math.random() * 0.004})`;
    ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
  }

  // Decorative corner brackets
  ctx.strokeStyle = 'rgba(160,140,110,0.20)';
  ctx.lineWidth = 1.5;
  const cm = 22, cs = 30;
  ctx.beginPath(); ctx.moveTo(cm, cm + cs); ctx.lineTo(cm, cm); ctx.lineTo(cm + cs, cm); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W - cm - cs, cm); ctx.lineTo(W - cm, cm); ctx.lineTo(W - cm, cm + cs); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cm, H - cm - cs); ctx.lineTo(cm, H - cm); ctx.lineTo(cm + cs, H - cm); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W - cm - cs, H - cm); ctx.lineTo(W - cm, H - cm); ctx.lineTo(W - cm, H - cm - cs); ctx.stroke();

  // ─── LEFT SIDE: Return indicator ───
  // Small "back" arrow in the bottom-left area
  ctx.fillStyle = 'rgba(107,66,38,0.25)';
  ctx.font = 'italic 14px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('\u2190 Return', W * 0.25, H - 40);

  // ─── RIGHT SIDE: Content area ───

  // Book icon/emoji (on right side of spread)
  const iconEmoji = book.icon || '\ud83d\udcd6';
  ctx.font = '48px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(iconEmoji, W * 0.72, 140);

  // Thin ornamental rule under icon
  ctx.strokeStyle = mat.accentColor;
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(W * 0.56, 200); ctx.lineTo(W * 0.88, 200); ctx.stroke();
  ctx.globalAlpha = 1;

  // Title (on right side)
  ctx.fillStyle = '#1B2A4A';
  ctx.shadowColor = 'rgba(0,0,0,0.06)';
  ctx.shadowBlur = 2;
  ctx.font = 'bold 26px Georgia, serif';
  ctx.textAlign = 'center';

  const titleText = book.title || '';
  const titleWords = titleText.split(' ');
  if (titleWords.length > 3) {
    const half = Math.ceil(titleWords.length / 2);
    ctx.fillText(titleWords.slice(0, half).join(' '), W * 0.72, 240);
    ctx.fillText(titleWords.slice(half).join(' '), W * 0.72, 272);
  } else {
    ctx.fillText(titleText, W * 0.72, 255);
  }
  ctx.shadowBlur = 0;

  // Subtitle / description
  ctx.fillStyle = '#6B4226';
  ctx.font = 'italic 16px Georgia, serif';
  const subtitleText = book.subtitle || '';
  if (subtitleText.length > 35) {
    const mid = subtitleText.lastIndexOf(' ', 35);
    ctx.fillText(subtitleText.slice(0, mid), W * 0.72, 320);
    ctx.fillText(subtitleText.slice(mid + 1), W * 0.72, 344);
  } else {
    ctx.fillText(subtitleText, W * 0.72, 330);
  }

  // "Today's Page" label
  ctx.fillStyle = 'rgba(27,42,74,0.5)';
  ctx.font = '600 15px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText("Today's Page", W * 0.72, 400);

  // Question text
  ctx.fillStyle = '#1B2A4A';
  ctx.font = '500 17px Georgia, serif';
  ctx.fillText('Would you like to', W * 0.72, 450);
  ctx.fillText('open this page?', W * 0.72, 474);

  // Open Page button (right side)
  const btnY = 520;
  const btnW = 200;
  const btnH = 48;
  const btnX = W * 0.72 - btnW / 2;

  const openGrad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY + btnH);
  openGrad.addColorStop(0, '#B8922A');
  openGrad.addColorStop(1, '#9A7A22');
  ctx.fillStyle = openGrad;
  ctx.beginPath();
  ctx.roundRect(btnX, btnY, btnW, btnH, 10);
  ctx.fill();

  ctx.shadowColor = 'rgba(184,146,42,0.3)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 17px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Open Page \u2192', btnX + btnW / 2, btnY + btnH / 2 + 6);

  // Tap hint
  ctx.fillStyle = 'rgba(107,66,38,0.3)';
  ctx.font = 'italic 12px Georgia, serif';
  ctx.fillText('tap right side to open \u2022 left to return', W / 2, btnY + btnH + 30);

  // Decorative flourish at bottom
  ctx.strokeStyle = mat.accentColor;
  ctx.globalAlpha = 0.20;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W * 0.25, H - 70);
  ctx.bezierCurveTo(W * 0.35, H - 80, W * 0.55, H - 80, W * 0.75, H - 70);
  ctx.stroke();
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 8;
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
  openBookScale = 2.5,
  openBookPosZ = 4.5,
  openBookPosY = 0.2,
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
  const spineTex          = useMemo(() => buildSpineTexture(mat),            [mat]);
  const coverTex          = useMemo(() => buildCoverTexture(mat, book.title), [mat, book.title]);
  const pageEdgeTex       = useMemo(() => buildPageEdgeTexture(),            []);
  const innerPageTex      = useMemo(() => buildInnerPageTexture(),           []);
  const openPageTex       = useMemo(() => buildOpenPageContentTexture(book, mat), [book, mat]);

  // ── per-preset surface props ────────────────────────────────────────────────
  const coverRough = mat.preset === 'leather' ? 0.48 : mat.preset === 'velvet' ? 0.82 : mat.preset === 'modern' ? 0.15 : mat.preset === 'cloth' ? 0.72 : 0.65;
  const coverMetal = mat.preset === 'modern'  ? 0.14 : mat.preset === 'leather' ? 0.05 : 0.03;
  const spineRough = mat.preset === 'leather' ? 0.42 : mat.preset === 'velvet' ? 0.78 : 0.58;

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
      g.scale.set(1, 1, 1);
      if (cvr) cvr.rotation.y = 0;
      return;
    }

    // HOVER – lift + lean toward camera
    if (animState === BOOK_STATES.HOVER) {
      g.scale.set(1, 1, 1);
      g.position.y = THREE.MathUtils.lerp(g.position.y, position[1] + 0.055, 0.09);
      g.position.z = THREE.MathUtils.lerp(g.position.z, position[2] + 0.13,  0.09);
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -0.04,  0.07);
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z,  0.015, 0.07);
      return;
    }

    // SELECTED – slide forward + rotate -90° so the +X front cover faces camera
    if (animState === BOOK_STATES.SELECTED) {
      g.scale.set(1, 1, 1);
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

    // CENTERED – glide to screen centre (further back for open-book view)
    if (animState === BOOK_STATES.CENTERED) {
      animProgress.current = Math.min(1, animProgress.current + delta / (TIMINGS.CENTER_MOVE / 1000));
      const p = easeOutBack(Math.min(animProgress.current, 0.98));
      g.position.x = THREE.MathUtils.lerp(snapPos.current.x, 0,    p);
      g.position.y = THREE.MathUtils.lerp(snapPos.current.y, openBookPosY,  p);
      g.position.z = THREE.MathUtils.lerp(snapPos.current.z, openBookPosZ,  p);
      g.rotation.set(0, -Math.PI / 2, 0);
      g.scale.set(openBookScale, openBookScale, openBookScale);
      return;
    }

    // FLIPPING – cover swings open (negative rotation to open left-to-right)
    if (animState === BOOK_STATES.FLIPPING) {
      animProgress.current = Math.min(1, animProgress.current + delta / (TIMINGS.BOOK_OPEN / 1000));
      const p = easeOutCubic(animProgress.current);
      g.rotation.set(0, -Math.PI / 2 + 0.06, 0);
      g.scale.set(openBookScale, openBookScale, openBookScale);
      if (cvr) cvr.rotation.y = THREE.MathUtils.lerp(0, -Math.PI * 0.80, p);
      return;
    }

    // OPEN – gentle float, scaled up for readability on mobile
    if (animState === BOOK_STATES.OPEN) {
      g.position.y = openBookPosY + Math.sin(time * 1.4) * 0.004;
      g.scale.set(openBookScale, openBookScale, openBookScale);
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
      g.scale.set(1, 1, 1);
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
    if (animState === BOOK_STATES.OPEN) {
      // After Ry(-PI/2): local Z → world -X (negated). So:
      //   local Z = +0.5 → world X = -0.5 (camera-LEFT) → decorative page / return
      //   local Z = -0.5 → world X = +0.5 (camera-RIGHT) → content page / open
      // We check e.point.x relative to group.x to determine left vs right click.
      if (e.point) {
        const localX = e.point.x - (groupRef.current?.position.x || 0);
        if (localX < 0) {
          // Clicked left side (camera-LEFT) – animate return to shelf
          startState(BOOK_STATES.RETURNING);
          setTimeout(() => {
            startState(BOOK_STATES.IDLE);
            if (onBookReturn) onBookReturn(book.id);
          }, TIMINGS.RETURN_TO_SHELF);
        } else {
          // Clicked right side (camera-RIGHT) – navigate to tool page
          if (onBookOpen) onBookOpen(book);
          if (onClick) onClick(book);
        }
      }
      return;
    }
    if (animState !== BOOK_STATES.IDLE && animState !== BOOK_STATES.HOVER) return;
    startState(BOOK_STATES.SELECTED);
    setTimeout(() => {
      startState(BOOK_STATES.CENTERED);
      setTimeout(() => {
        if (frontCoverPivotRef.current) frontCoverPivotRef.current.rotation.y = 0;
        startState(BOOK_STATES.FLIPPING);
        setTimeout(() => {
          setAnimState(BOOK_STATES.OPEN);
          // Don't call onBookOpen here – we show the in-book UI first
        }, TIMINGS.BOOK_OPEN);
      }, TIMINGS.CENTER_MOVE);
    }, TIMINGS.SELECTION_SLIDE);
  }, [animState, book, onClick, onBookOpen, onBookReturn, startState]);

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
      {/* ═══ PAGE BLOCK (hidden when open) ═══ */}
      {animState !== BOOK_STATES.OPEN && (
        <mesh position={[0, 0, -d / 2]} castShadow receiveShadow>
          <boxGeometry args={[t - 0.018, h - 0.03, d - 0.016]} />
          <meshStandardMaterial
            map={pageEdgeTex}
            color="#F0EAD8"
            roughness={0.88}
            metalness={0}
          />
        </mesh>
      )}

      {/* ══ BACK COVER (hidden when open) ══ */}
      {animState !== BOOK_STATES.OPEN && (
        <mesh position={[-t / 2 - cT / 2, 0, -d / 2]} castShadow receiveShadow>
          <boxGeometry args={[cT, h, d]} />
          <meshStandardMaterial
            color={mat.coverColor}
            roughness={coverRough}
            metalness={coverMetal}
          />
        </mesh>
      )}

      {/* ══ SPINE BOARD (hidden when open) ══ */}
      {animState !== BOOK_STATES.OPEN && (
        <mesh position={[0, 0, cT / 2]} castShadow>
          <boxGeometry args={[t, h, cT]} />
          <meshStandardMaterial
            color={mat.darkColor}
            roughness={spineRough}
            metalness={0.05}
          />
        </mesh>
      )}

      {/* Spine artwork overlay (always visible) */}
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

      {/* Spine board visible when open - provides solid backing for spine artwork */}
      {animState === BOOK_STATES.OPEN && (
        <mesh position={[0, 0, cT / 2]}>
          <boxGeometry args={[t, h, cT]} />
          <meshStandardMaterial
            color={mat.darkColor}
            roughness={spineRough}
            metalness={0.05}
          />
        </mesh>
      )}


      {/* Raised bands (always visible) */}
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

      {/* Headbands & page-edge caps (always visible) */}
      <>
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
        </>

      {/* ══ FRONT COVER – pivots open at the SPINE edge ══
          The group is always rendered so the ref survives state transitions.
          Children are hidden when OPEN to prevent occlusion. */}
      <group ref={frontCoverPivotRef} position={[t / 2, 0, 0]}>
        <group position={[cT / 2, 0, -d / 2]}>
          {/* Cover board - always visible */}
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

        {/* First flyleaf (only when in motion and not open) */}
        {isMoving && animState !== BOOK_STATES.OPEN && (
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

      {/* Inner pages visible from front (only when closed and idle) */}
      {!isMoving && animState !== BOOK_STATES.OPEN && (
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

      {/* ─── Open book: single content page filling the spread ───
          After Ry(-PI/2): local Z maps to world -X. The full book depth becomes width.
          Single page covers the entire open spread for maximum readability on mobile.
          Left half (Z>0 → camera-LEFT) = tap to return. Right half = tap to open. */}
      {animState === BOOK_STATES.OPEN && (
        <group>
          {/* Content page - fills the entire open book spread */}
          <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[d - 0.02, h - 0.04]} />
            <meshStandardMaterial
              map={openPageTex}
              roughness={0.90}
              metalness={0}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Spine gutter shadow line */}
          <mesh position={[0, 0, 0.001]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.015, h - 0.04]} />
            <meshBasicMaterial color="#6B5B4B" transparent opacity={0.18} side={THREE.DoubleSide} />
          </mesh>
          {/* "Return" indicator on left side */}
          <mesh position={[0, -h / 2 + 0.06, d / 4]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.08, 0.08]} />
            <meshBasicMaterial color="#8B7D6B" transparent opacity={0.35} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}



      {/* Page block visible when open - shows page edges between covers */}
      {animState === BOOK_STATES.OPEN && (
        <mesh position={[0, 0, -d / 2]}>
          <boxGeometry args={[t - 0.018, h - 0.03, d - 0.016]} />
          <meshStandardMaterial
            map={pageEdgeTex}
            color="#F0EAD8"
            roughness={0.88}
            metalness={0}
          />
        </mesh>
      )}

      {/* Back cover visible when open */}
      {animState === BOOK_STATES.OPEN && (
        <mesh position={[-t / 2 - cT / 2, 0, -d / 2]}>
          <boxGeometry args={[cT, h, d]} />
          <meshStandardMaterial
            color={mat.coverColor}
            roughness={coverRough}
            metalness={coverMetal}
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
