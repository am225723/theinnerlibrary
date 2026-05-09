// Bookshelf component for The Inner Library 3D Bookshelf

import React, { useRef } from 'react';
import * as THREE from 'three';
import Book from './Book';
import { SHELF_DIMENSIONS } from '../utils/bookGeometry';
import { getTexture } from '../utils/textureGenerator';

const Bookshelf = ({ 
  books = [], 
  onBookClick, 
  onBookHover, 
  onBookHoverEnd,
  selectedBookId,
  bookmarks = {},
}) => {
  const woodTexture = useRef(getTexture('wood', { color: '#8B6F47' }));

  // Calculate shelf positions based on books - 4 per shelf
  const shelves = [];
  const booksPerShelf = 4;
  const shelfCount = Math.ceil(books.length / booksPerShelf);

  for (let i = 0; i < Math.max(shelfCount, 2); i++) {
    shelves.push({
      index: i,
      y: -i * SHELF_DIMENSIONS.shelfGap,
      books: books.slice(i * booksPerShelf, (i + 1) * booksPerShelf),
    });
  }

  return (
    <group>
      {/* Background wall */}
      <mesh position={[0, -1, -1.5]} receiveShadow>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial
          color="#E8E0D0"
          roughness={0.95}
          metalness={0}
        />
      </mesh>

      {/* Each shelf level */}
      {shelves.map((shelf) => (
        <ShelfLevel
          key={shelf.index}
          shelf={shelf}
          woodTexture={woodTexture.current}
          onBookClick={onBookClick}
          onBookHover={onBookHover}
          onBookHoverEnd={onBookHoverEnd}
          selectedBookId={selectedBookId}
          bookmarks={bookmarks}
        />
      ))}

      {/* Decorative shelf supports */}
      {shelves.map((shelf) => (
        <React.Fragment key={`support-${shelf.index}`}>
          {/* Left bracket */}
          <mesh
            position={[-SHELF_DIMENSIONS.width / 2 - 0.1, shelf.y - 0.5, -0.3]}
            castShadow
          >
            <boxGeometry args={[0.15, 0.8, 0.8]} />
            <meshStandardMaterial
              map={woodTexture.current}
              color="#7A5F3A"
              roughness={0.8}
              metalness={0}
            />
          </mesh>

          {/* Right bracket */}
          <mesh
            position={[SHELF_DIMENSIONS.width / 2 + 0.1, shelf.y - 0.5, -0.3]}
            castShadow
          >
            <boxGeometry args={[0.15, 0.8, 0.8]} />
            <meshStandardMaterial
              map={woodTexture.current}
              color="#7A5F3A"
              roughness={0.8}
              metalness={0}
            />
          </mesh>
        </React.Fragment>
      ))}

      {/* Top decorative molding */}
      <mesh position={[0, shelves.length > 0 ? (shelves[0]?.y || 0) + 1.8 : 1.8, -0.5]}>
        <boxGeometry args={[SHELF_DIMENSIONS.width + 0.5, 0.12, 1.2]} />
        <meshStandardMaterial
          map={woodTexture.current}
          color="#7A5F3A"
          roughness={0.75}
          metalness={0.05}
        />
      </mesh>

      {/* Candle decoration */}
      <Candle position={[-SHELF_DIMENSIONS.width / 2 + 0.5, shelves.length > 0 ? (shelves[0]?.y || 0) + 1.0 : 1.0, 0]} />

      {/* Small plant decoration */}
      <SmallPlant position={[SHELF_DIMENSIONS.width / 2 - 0.5, shelves.length > 0 ? (shelves[0]?.y || 0) + 1.0 : 1.0, 0]} />
    </group>
  );
};

// Individual shelf level
const ShelfLevel = ({ 
  shelf, 
  woodTexture, 
  onBookClick, 
  onBookHover, 
  onBookHoverEnd,
  selectedBookId,
  bookmarks,
}) => {
  const shelfY = shelf.y;
  const booksPerShelf = 4;
  const shelfWidth = SHELF_DIMENSIONS.width;

  return (
    <group>
      {/* Shelf plank */}
      <mesh
        position={[0, shelfY + 0.05, -0.1]}
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[shelfWidth, 0.1, SHELF_DIMENSIONS.depth]} />
        <meshStandardMaterial
          map={woodTexture}
          color="#8B6F47"
          roughness={0.8}
          metalness={0}
        />
      </mesh>

      {/* Shelf front edge (slightly raised) */}
      <mesh position={[0, shelfY + 0.12, SHELF_DIMENSIONS.depth / 2 - 0.3]}>
        <boxGeometry args={[shelfWidth, 0.06, 0.06]} />
        <meshStandardMaterial
          color="#7A5F3A"
          roughness={0.75}
          metalness={0.05}
        />
      </mesh>

      {/* Books on this shelf */}
      {shelf.books.map((book, index) => {
        // Distribute books evenly across the shelf
        const spacing = shelfWidth / (booksPerShelf + 1);
        const bookX = -shelfWidth / 2 + (index + 1) * spacing;
        const bookY = shelfY + 1.1; // Book sits on top of shelf
        const bookZ = 0;

        return (
          <Book
            key={book.id}
            book={book}
            position={[bookX, bookY, bookZ]}
            onClick={onBookClick}
            onHover={onBookHover}
            onHoverEnd={onBookHoverEnd}
            isSelected={selectedBookId === book.id}
            showBookmark={bookmarks[book.id] !== undefined}
            bookmarkCount={bookmarks[book.id] || 0}
          />
        );
      })}
    </group>
  );
};

// Candle decoration
const Candle = ({ position }) => {
  return (
    <group position={position}>
      {/* Candle body */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.4, 16]} />
        <meshStandardMaterial
          color="#F5F0E8"
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Candle holder */}
      <mesh position={[0, -0.05, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.1, 0.1, 16]} />
        <meshStandardMaterial
          color="#B8922A"
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Flame glow */}
      <mesh position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>

      {/* Flame light */}
      <pointLight
        position={[0, 0.45, 0]}
        color="#FFD700"
        intensity={0.3}
        distance={3}
        decay={2}
      />
    </group>
  );
};

// Small plant decoration
const SmallPlant = ({ position }) => {
  return (
    <group position={position}>
      {/* Pot */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.08, 0.15, 16]} />
        <meshStandardMaterial
          color="#8B4513"
          roughness={0.85}
          metalness={0}
        />
      </mesh>

      {/* Soil */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.02, 16]} />
        <meshStandardMaterial
          color="#3E2723"
          roughness={0.95}
          metalness={0}
        />
      </mesh>

      {/* Leaves (simple geometric shapes) */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((angle * Math.PI) / 180) * 0.06,
            0.15 + i * 0.02,
            Math.sin((angle * Math.PI) / 180) * 0.06,
          ]}
          rotation={[0, (angle * Math.PI) / 180, 0.3]}
        >
          <boxGeometry args={[0.08, 0.15, 0.01]} />
          <meshStandardMaterial
            color="#2D5016"
            roughness={0.8}
            metalness={0}
          />
        </mesh>
      ))}
    </group>
  );
};

export default Bookshelf;