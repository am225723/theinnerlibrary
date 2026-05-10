// Realistic Bookshelf component for The Inner Library
// Two floating wooden shelves with 4 books each, decorative items

import React, { useRef, useMemo } from 'react';
import Book from './Book';
import { SHELF_DIMENSIONS, getBookDimensionsById } from '../utils/bookGeometry';
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
  const darkWoodTexture = useRef(getTexture('wood', { color: '#5C4033' }));

  // Split books into shelves - 4 per shelf
  const shelves = useMemo(() => {
    const result = [];
    const perShelf = SHELF_DIMENSIONS.booksPerShelf;
    const shelfCount = Math.ceil(books.length / perShelf);

    for (let i = 0; i < Math.max(shelfCount, 2); i++) {
      result.push({
        index: i,
        y: -i * SHELF_DIMENSIONS.shelfGap,
        books: books.slice(i * perShelf, (i + 1) * perShelf),
      });
    }
    return result;
  }, [books]);

  return (
    <group>
      {/* Background wall - warm cream with subtle texture */}
      <mesh position={[0, -1.5, -1.2]} receiveShadow>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial color="#F0EBE0" roughness={0.95} metalness={0} />
      </mesh>

      {/* Each shelf level */}
      {shelves.map((shelf) => (
        <ShelfLevel
          key={shelf.index}
          shelf={shelf}
          woodTexture={woodTexture.current}
          darkWoodTexture={darkWoodTexture.current}
          onBookClick={onBookClick}
          onBookHover={onBookHover}
          onBookHoverEnd={onBookHoverEnd}
          selectedBookId={selectedBookId}
          bookmarks={bookmarks}
        />
      ))}

      {/* Decorative items between shelves */}
      <Candle position={[-SHELF_DIMENSIONS.width / 2 + 0.5, shelves[0]?.y + 0.85, 0.3]} />
      <SmallPlant position={[SHELF_DIMENSIONS.width / 2 - 0.5, shelves[0]?.y + 0.75, 0.3]} />
      <CoffeeCup position={[SHELF_DIMENSIONS.width / 2 - 1.2, shelves[0]?.y + 0.65, 0.4]} />
      <PictureFrame position={[-SHELF_DIMENSIONS.width / 2 + 1.5, shelves[0]?.y + 0.9, 0.2]} />

      {/* Bottom shelf decorations */}
      {shelves.length > 1 && (
        <>
          <SaltLamp position={[SHELF_DIMENSIONS.width / 2 - 0.4, shelves[1]?.y + 0.7, 0.3]} />
          <SmallPlant position={[-SHELF_DIMENSIONS.width / 2 + 0.4, shelves[1]?.y + 0.75, 0.3]} variant="succulent" />
        </>
      )}
    </group>
  );
};

// Individual shelf level - realistic floating shelf
const ShelfLevel = ({
  shelf,
  woodTexture,
  darkWoodTexture,
  onBookClick,
  onBookHover,
  onBookHoverEnd,
  selectedBookId,
  bookmarks,
}) => {
  const shelfY = shelf.y;
  const shelfWidth = SHELF_DIMENSIONS.width;
  const shelfDepth = SHELF_DIMENSIONS.depth;

  return (
    <group>
      {/* Main shelf plank - thick realistic wood */}
      <mesh position={[0, shelfY, 0]} castShadow receiveShadow>
        <boxGeometry args={[shelfWidth, 0.1, shelfDepth]} />
        <meshStandardMaterial
          map={woodTexture}
          color="#8B6F47"
          roughness={0.75}
          metalness={0.02}
        />
      </mesh>

      {/* Shelf front edge - slightly rounded look */}
      <mesh position={[0, shelfY + 0.04, shelfDepth / 2 - 0.02]}>
        <boxGeometry args={[shelfWidth, 0.08, 0.04]} />
        <meshStandardMaterial
          map={darkWoodTexture}
          color="#7A5F3A"
          roughness={0.7}
          metalness={0.02}
        />
      </mesh>

      {/* Shelf back edge */}
      <mesh position={[0, shelfY + 0.02, -shelfDepth / 2 + 0.02]}>
        <boxGeometry args={[shelfWidth, 0.06, 0.04]} />
        <meshStandardMaterial color="#6B5235" roughness={0.8} metalness={0} />
      </mesh>

      {/* Wall bracket left */}
      <mesh position={[-shelfWidth / 2 + 0.3, shelfY - 0.25, -0.4]} castShadow>
        <boxGeometry args={[0.08, 0.5, 0.6]} />
        <meshStandardMaterial color="#4A3828" roughness={0.8} metalness={0.05} />
      </mesh>

      {/* Wall bracket right */}
      <mesh position={[shelfWidth / 2 - 0.3, shelfY - 0.25, -0.4]} castShadow>
        <boxGeometry args={[0.08, 0.5, 0.6]} />
        <meshStandardMaterial color="#4A3828" roughness={0.8} metalness={0.05} />
      </mesh>

      {/* Books on this shelf - snug side by side */}
      <SnugBookRow
        shelfBooks={shelf.books}
        shelfY={shelfY}
        onBookClick={onBookClick}
        onBookHover={onBookHover}
        onBookHoverEnd={onBookHoverEnd}
        selectedBookId={selectedBookId}
        bookmarks={bookmarks}
      />
    </group>
  );
};

// Books arranged snugly side-by-side on a shelf
const SnugBookRow = ({
  shelfBooks,
  shelfY,
  onBookClick,
  onBookHover,
  onBookHoverEnd,
  selectedBookId,
  bookmarks,
}) => {
  // Calculate positions - books packed together snugly
  const bookPositions = useMemo(() => {
    let xOffset = 0;
    const positions = [];
    const gap = 0.03;

    // First pass: calculate total width
    shelfBooks.forEach((book, i) => {
      const dims = getBookDimensionsById(book.id);
      positions.push({
        x: xOffset,
        book,
        width: dims.width,
      });
      xOffset += dims.width + gap;
    });

    // Center the row
    const totalWidth = xOffset - gap;
    const startX = -totalWidth / 2;
    return positions.map((p) => ({
      ...p,
      x: startX + p.x + p.width / 2,
    }));
  }, [shelfBooks]);

  return (
    <>
      {bookPositions.map(({ x, book, width }) => {
        const dims = getBookDimensionsById(book.id);
        const bookY = shelfY + dims.height / 2 + 0.06;

        return (
          <Book
            key={book.id}
            book={book}
            position={[x, bookY, 0.2]}
            onClick={onBookClick}
            onHover={onBookHover}
            onHoverEnd={onBookHoverEnd}
            isSelected={selectedBookId === book.id}
            showBookmark={bookmarks[book.id] !== undefined}
            bookmarkCount={bookmarks[book.id] || 0}
          />
        );
      })}
    </>
  );
};

// Candle decoration with realistic flame
const Candle = ({ position }) => {
  return (
    <group position={position}>
      {/* Candle holder - brass */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.06, 16]} />
        <meshStandardMaterial color="#B8922A" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Candle body */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.045, 0.3, 16]} />
        <meshStandardMaterial color="#FAF5EE" roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Flame */}
      <mesh position={[0, 0.36, 0]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
      {/* Flame glow */}
      <pointLight position={[0, 0.36, 0]} color="#FFD700" intensity={0.4} distance={3} decay={2} />
    </group>
  );
};

// Small plant - potted succulent or leafy plant
const SmallPlant = ({ position, variant = 'leafy' }) => {
  return (
    <group position={position}>
      {/* Ceramic pot */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.06, 0.12, 16]} />
        <meshStandardMaterial
          color={variant === 'succulent' ? '#D4C5A9' : '#E8DDD0'}
          roughness={0.85}
          metalness={0}
        />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.015, 16]} />
        <meshStandardMaterial color="#3E2723" roughness={0.95} metalness={0} />
      </mesh>
      {variant === 'succulent' ? (
        // Succulent - small rosette
        <>
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <mesh
              key={i}
              position={[
                Math.cos((angle * Math.PI) / 180) * 0.03,
                0.1 + i * 0.005,
                Math.sin((angle * Math.PI) / 180) * 0.03,
              ]}
              rotation={[0.3, (angle * Math.PI) / 180, 0]}
            >
              <boxGeometry args={[0.04, 0.06, 0.01]} />
              <meshStandardMaterial color="#7B9E6B" roughness={0.8} metalness={0} />
            </mesh>
          ))}
        </>
      ) : (
        // Leafy plant
        <>
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <mesh
              key={i}
              position={[
                Math.cos((angle * Math.PI) / 180) * 0.05,
                0.12 + i * 0.015,
                Math.sin((angle * Math.PI) / 180) * 0.05,
              ]}
              rotation={[0, (angle * Math.PI) / 180, 0.25]}
            >
              <boxGeometry args={[0.06, 0.12, 0.008]} />
              <meshStandardMaterial color="#3D7A2A" roughness={0.8} metalness={0} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
};

// Coffee cup decoration
const CoffeeCup = ({ position }) => {
  return (
    <group position={position}>
      {/* Cup */}
      <mesh position={[0, 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.04, 0.1, 16]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.4} metalness={0.05} />
      </mesh>
      {/* Coffee liquid */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.02, 16]} />
        <meshStandardMaterial color="#6B3A1F" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Handle */}
      <mesh position={[0.06, 0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.03, 0.008, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.4} metalness={0.05} />
      </mesh>
    </group>
  );
};

// Picture frame decoration
const PictureFrame = ({ position }) => {
  return (
    <group position={position}>
      {/* Frame */}
      <mesh castShadow>
        <boxGeometry args={[0.4, 0.5, 0.02]} />
        <meshStandardMaterial color="#5C4033" roughness={0.7} metalness={0.05} />
      </mesh>
      {/* Picture/mat */}
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[0.32, 0.42]} />
        <meshStandardMaterial color="#E8DDD0" roughness={0.9} metalness={0} />
      </mesh>
      {/* Inner image */}
      <mesh position={[0, 0, 0.014]}>
        <planeGeometry args={[0.25, 0.3]} />
        <meshStandardMaterial color="#A8C4A0" roughness={0.9} metalness={0} />
      </mesh>
    </group>
  );
};

// Salt lamp decoration - warm glow
const SaltLamp = ({ position }) => {
  return (
    <group position={position}>
      {/* Lamp body - rough salt crystal shape */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <dodecahedronGeometry args={[0.12, 1]} />
        <meshStandardMaterial
          color="#E8926A"
          roughness={0.9}
          metalness={0}
          transparent
          opacity={0.85}
          emissive="#FF8C42"
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Wooden base */}
      <mesh position={[0, -0.02, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 16]} />
        <meshStandardMaterial color="#5C4033" roughness={0.8} metalness={0} />
      </mesh>
      {/* Warm glow */}
      <pointLight position={[0, 0.12, 0]} color="#FF8C42" intensity={0.5} distance={2.5} decay={2} />
    </group>
  );
};

export default Bookshelf;
