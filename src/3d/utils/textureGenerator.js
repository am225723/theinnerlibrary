// Texture generation utilities for The Inner Library 3D Bookshelf

import * as THREE from 'three';

// Generate leather texture
export const generateLeatherTexture = (color = '#1B2A4A') => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 512, 512);

  // Add grain
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const brightness = Math.random() * 20 - 10;
    ctx.fillStyle = `rgba(${brightness > 0 ? 255 : 0}, ${brightness > 0 ? 255 : 0}, ${brightness > 0 ? 255 : 0}, ${Math.abs(brightness) / 100})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Add subtle creases
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 512, 0);
    ctx.bezierCurveTo(
      Math.random() * 512, Math.random() * 512,
      Math.random() * 512, Math.random() * 512,
      Math.random() * 512, 512
    );
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

// Generate cloth texture
export const generateClothTexture = (color = '#2D5016') => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 512, 512);

  // Add weave pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  const spacing = 4;
  for (let x = 0; x < 512; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y < 512; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Add subtle noise
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const brightness = Math.random() * 15 - 7;
    ctx.fillStyle = `rgba(${brightness > 0 ? 255 : 0}, ${brightness > 0 ? 255 : 0}, ${brightness > 0 ? 255 : 0}, ${Math.abs(brightness) / 100})`;
    ctx.fillRect(x, y, 1, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

// Generate paper texture
export const generatePaperTexture = (color = '#F5F0E8') => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 512, 512);

  // Add subtle grain
  for (let i = 0; i < 10000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const brightness = Math.random() * 10 - 5;
    ctx.fillStyle = `rgba(${brightness > 0 ? 255 : 0}, ${brightness > 0 ? 255 : 0}, ${brightness > 0 ? 255 : 0}, ${Math.abs(brightness) / 100})`;
    ctx.fillRect(x, y, 1, 1);
  }

  // Add subtle lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.02)';
  ctx.lineWidth = 0.5;
  for (let y = 0; y < 512; y += 8) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

// Generate gold foil texture
export const generateGoldFoilTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base gold color
  const gradient = ctx.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, '#D4A845');
  gradient.addColorStop(0.5, '#F5E6B8');
  gradient.addColorStop(1, '#B8922A');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  // Add metallic sheen
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const brightness = Math.random() * 30;
    ctx.fillStyle = `rgba(255, 255, 255, ${brightness / 100})`;
    ctx.fillRect(x, y, 2, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

// Generate wood texture for shelves
export const generateWoodTexture = (color = '#8B6F47') => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 512, 512);

  // Add grain lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 50; i++) {
    ctx.beginPath();
    ctx.moveTo(0, Math.random() * 512);
    ctx.bezierCurveTo(
      Math.random() * 512, Math.random() * 512,
      Math.random() * 512, Math.random() * 512,
      512, Math.random() * 512
    );
    ctx.stroke();
  }

  // Add knots
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const radius = Math.random() * 20 + 10;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

// Generate normal map from texture
export const generateNormalMap = (texture, strength = 1.0) => {
  // This would create a normal map from the texture
  // For simplicity, we'll return the texture itself
  // In production, you'd use a proper normal map generator
  return texture;
};

// Generate roughness map
export const generateRoughnessMap = (baseRoughness = 0.5) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base roughness
  ctx.fillStyle = `rgb(${baseRoughness * 255}, ${baseRoughness * 255}, ${baseRoughness * 255})`;
  ctx.fillRect(0, 0, 512, 512);

  // Add variation
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const variation = Math.random() * 0.2 - 0.1;
    const value = Math.max(0, Math.min(1, baseRoughness + variation));
    ctx.fillStyle = `rgb(${value * 255}, ${value * 255}, ${value * 255})`;
    ctx.fillRect(x, y, 2, 2);
  }

  const roughnessTexture = new THREE.CanvasTexture(canvas);
  roughnessTexture.wrapS = THREE.RepeatWrapping;
  roughnessTexture.wrapT = THREE.RepeatWrapping;
  return roughnessTexture;
};

// Generate embossing texture
export const generateEmbossTexture = (text, fontSize = 24) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
  ctx.fillRect(0, 0, 512, 512);

  ctx.font = `${fontSize}px serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};

// Cache for generated textures
const textureCache = new Map();

// Get or generate texture with caching
export const getTexture = (type, options = {}) => {
  const cacheKey = `${type}_${JSON.stringify(options)}`;
  
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey);
  }

  let texture;
  switch (type) {
    case 'leather':
      texture = generateLeatherTexture(options.color);
      break;
    case 'cloth':
      texture = generateClothTexture(options.color);
      break;
    case 'paper':
      texture = generatePaperTexture(options.color);
      break;
    case 'goldFoil':
      texture = generateGoldFoilTexture();
      break;
    case 'wood':
      texture = generateWoodTexture(options.color);
      break;
    default:
      texture = generateLeatherTexture(options.color);
  }

  textureCache.set(cacheKey, texture);
  return texture;
};

// Clear texture cache
export const clearTextureCache = () => {
  textureCache.forEach((texture) => {
    texture.dispose();
  });
  textureCache.clear();
};