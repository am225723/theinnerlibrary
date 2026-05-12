# The Inner Library — 3D Bookshelf Design Specification

## Executive Summary

A photorealistic 3D bookshelf interface that transforms The Inner Library's therapeutic tools into an immersive, tactile experience. Users interact with their collection as if browsing a physical library, with smooth animations bringing books to life.

---

## 1. UI/UX Layout & Interaction Flow

### 1.1 Initial View — The Library

```
┌─────────────────────────────────────────────────────────┐
│                    🕯️ The Inner Library                 │
│  Welcome back. Your shelves are waiting.                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│    ┌─────────────────────────────────────────────┐     │
│    │  ╔═════════════════════════════════════════╗ │     │
│    │  ║  📖  🌿  🗣  ✍️  🏺  🎭  💌  📋       ║ │     │
│    │  ║  [8 books with realistic spines]        ║ │     │
│    │  ╚═════════════════════════════════════════╝ │     │
│    │  ─────────────────────────────────────────  │     │
│    │  ╔═════════════════════════════════════════╗ │     │
│    │  ║  [Saved entries as additional books]    ║ │     │
│    │  ╚═════════════════════════════════════════╝ │     │
│    └─────────────────────────────────────────────┘     │
│                                                         │
│  [🔔 3 reminders]  [🎨 Customize]  [📚 View All]       │
└─────────────────────────────────────────────────────────┘
```

**Key Elements:**
- **Perspective:** Isometric or slightly elevated front view (30° angle)
- **Lighting:** Warm ambient light + directional light from upper-left
- **Shadows:** Soft shadows cast by books onto shelf surface
- **Depth:** Books have visible thickness (spine width ~12-16px)

### 1.2 Interaction Flow

```
User clicks book
    ↓
[Animation: Book slides forward 200px, rotates 15° toward viewer]
    ↓
[Animation: Book opens, pages fan out]
    ↓
[Transition: 3D book fades, 2D content fades in]
    ↓
User interacts with tool
    ↓
User clicks "Return to shelf"
    ↓
[Animation: Book closes, slides back to original position]
```

### 1.3 Book Selection States

| State | Description | Animation Duration |
|-------|-------------|-------------------|
| **Idle** | Book sits on shelf, subtle breathing animation (±2px) | 3s loop |
| **Hover** | Book lifts 4px, spine brightens, shadow softens | 200ms ease-out |
| **Selected** | Book slides forward, rotates toward viewer | 400ms ease-in-out |
| **Opening** | Book opens, pages fan out | 600ms ease-in-out |
| **Closing** | Book closes, pages fold back | 400ms ease-in-out |
| **Returning** | Book slides back to shelf | 400ms ease-in-out |

---

## 2. Technical Approach

### 2.1 Recommended Stack: Three.js + React Three Fiber

**Why Three.js?**
- Mature, well-documented WebGL library
- Excellent performance for 8-50 book objects
- Built-in lighting, shadows, and material systems
- Large ecosystem of loaders and helpers

**Why React Three Fiber?**
- Declarative 3D components
- Seamless integration with existing React app
- Easy state management for animations
- Hot reloading for development

### 2.2 Architecture

```
src/
├── 3d/
│   ├── components/
│   │   ├── Bookshelf.jsx          # Main shelf container
│   │   ├── Book.jsx               # Individual 3D book
│   │   ├── BookCover.jsx         # Cover geometry & material
│   │   ├── BookSpine.jsx         # Spine geometry & material
│   │   ├── BookPages.jsx         # Page stack geometry
│   │   ├── Lighting.jsx          # Scene lighting setup
│   │   └── CameraController.jsx  # Camera positioning
│   ├── hooks/
│   │   ├── useBookAnimation.jsx  # Animation state machine
│   │   └── useBookshelfLayout.jsx # Dynamic shelf arrangement
│   ├── utils/
│   │   ├── bookGeometry.js       # Book mesh generation
│   │   ├── materialPresets.js    # Predefined materials
│   │   └── animationTimings.js   # Easing functions
│   └── scenes/
│       ├── LibraryScene.jsx      # Main 3D scene
│       └── BookOpenScene.jsx     # Open book transition
├── components/
│   └── BookCoverDesigner.jsx     # 2D cover editor
└── screens/
    └── Library3D.jsx             # 3D library screen
```

### 2.3 Alternative: CSS 3D Transforms

**For simpler implementation:**

```javascript
// Book as CSS 3D element
const Book3D = ({ book, onClick }) => (
  <div
    className="book-3d"
    onClick={onClick}
    style={{
      transform: `rotateY(${rotation}deg) translateZ(${z}px)`,
      transition: 'transform 0.4s ease-in-out'
    }}
  >
    <div className="book-spine">{book.title}</div>
    <div className="book-cover-front" />
    <div className="book-cover-back" />
    <div className="book-pages" />
  </div>
);
```

**Pros:** No WebGL overhead, easier to debug
**Cons:** Limited realism, no true lighting/shadows

---

## 3. Animation Specifications

### 3.1 Book Selection Animation

**Phase 1: Slide Forward**
```javascript
// Timeline: 0ms → 400ms
{
  position: {
    x: 0 → 0,
    y: 0 → 0,
    z: 0 → 200  // Move toward camera
  },
  rotation: {
    x: 0 → 0,
    y: 0 → 15,  // Rotate toward viewer
    z: 0 → 0
  },
  easing: 'easeInOutCubic'
}
```

**Phase 2: Open Book**
```javascript
// Timeline: 400ms → 1000ms
{
  bookRotation: {
    x: 0 → 0,
    y: 15 → 0,  // Face forward
    z: 0 → 0
  },
  pages: {
    leftCover: { rotation: 0 → -160 },  // Open left
    rightCover: { rotation: 0 → 160 },   // Open right
    pagesFan: { spread: 0 → 1 }          // Pages fan out
  },
  easing: 'easeOutBack'
}
```

**Phase 3: Content Fade In**
```javascript
// Timeline: 1000ms → 1200ms
{
  opacity: {
    book3D: 1 → 0,
    content2D: 0 → 1
  },
  scale: {
    content2D: 0.9 → 1
  },
  easing: 'easeOutQuad'
}
```

### 3.2 Page Flip Animation

**Single Page Turn:**
```javascript
// Duration: 300ms per page
{
  page: {
    rotation: { x: 0 → -180 },  // Flip over
    z: 0 → 50 → 0,              // Lift and settle
    opacity: 1 → 0.8 → 1
  },
  shadow: {
    intensity: 0 → 0.5 → 0      // Shadow during flip
  },
  easing: 'easeInOutSine'
}
```

### 3.3 Hover Animation

**Subtle Breathing:**
```javascript
// Continuous loop, 3s duration
{
  position: {
    y: 0 → 4 → 0  // Gentle lift
  },
  shadow: {
    blur: 8 → 4 → 8  // Shadow sharpens when lifted
  },
  easing: 'easeInOutSine',
  loop: true
}
```

---

## 4. Custom Book Cover Creation Tool

### 4.1 Cover Designer Interface

```
┌─────────────────────────────────────────────────────────┐
│  🎨 Custom Book Cover Designer                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────┐       │
│  │                                             │       │
│  │          [Live 3D Preview]                  │       │
│  │                                             │       │
│  └─────────────────────────────────────────────┘       │
│                                                         │
│  Cover Style:                                           │
│  ○ Classic Leather  ○ Cloth  ○ Modern  ○ Custom       │
│                                                         │
│  Color Palette:                                         │
│  [Navy] [Forest] [Brown] [Gold] [Cream] [Custom]       │
│                                                         │
│  Spine Text:                                            │
│  ┌─────────────────────────────────────────────┐       │
│  │ Today's Page                                │       │
│  └─────────────────────────────────────────────┘       │
│  Font: Playfair Display  Size: 14px  Color: Gold      │
│                                                         │
│  Cover Design:                                          │
│  ┌─────────────────────────────────────────────┐       │
│  │  [Pattern: None] [Texture: Smooth]          │       │
│  │  [Add Icon: 📖] [Add Border: Gold]         │       │
│  └─────────────────────────────────────────────┘       │
│                                                         │
│  [👁 Preview in Library]  [💾 Save Cover]  [↩ Back]   │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Cover Customization Options

| Element | Options | Default |
|---------|---------|---------|
| **Material** | Leather, Cloth, Paper, Velvet, Custom | Leather |
| **Base Color** | 12 preset colors + custom picker | Navy |
| **Spine Color** | Same as cover or custom | Same |
| **Texture** | Smooth, Grainy, Embossed, Foil | Smooth |
| **Pattern** | None, Geometric, Floral, Striped, Custom | None |
| **Icon** | 50+ icons (book, leaf, heart, etc.) | Tool-specific |
| **Border** | None, Thin, Thick, Gold, Silver | None |
| **Spine Text** | Custom text, font, size, color | Tool name |
| **Embossing** | None, Title, Icon, Full cover | None |
| **Wear** | Pristine, Light, Moderate, Heavy | Light |

### 4.3 Cover Data Structure

```javascript
{
  id: "cover_today_page_v1",
  bookId: "daily_checkin",
  material: "leather",
  colors: {
    cover: "#1B2A4A",
    spine: "#1B2A4A",
    text: "#B8922A",
    accent: "#D4A845"
  },
  texture: {
    type: "grainy",
    roughness: 0.7,
    metalness: 0.1
  },
  pattern: null,
  icon: {
    emoji: "📖",
    position: "center",
    size: 48
  },
  border: {
    enabled: true,
    color: "#B8922A",
    width: 2
  },
  spine: {
    text: "Today's Page",
    font: "Playfair Display",
    fontSize: 14,
    vertical: true
  },
  embossing: {
    enabled: true,
    depth: 0.5,
    elements: ["icon", "title"]
  },
  wear: "light"
}
```

### 4.4 Cover Generation Pipeline

```
User inputs
    ↓
[Validate: colors, dimensions, text length]
    ↓
[Generate texture maps]
    ├─ Base color map
    ├─ Normal map (texture/embossing)
    ├─ Roughness map (material feel)
    └─ Emissive map (gold foil)
    ↓
[Create 3D materials]
    ├─ Cover material (4 maps)
    ├─ Spine material (4 maps)
    └─ Page material (paper texture)
    ↓
[Apply to book mesh]
    ↓
[Render in preview]
    ↓
[Save to localStorage]
```

---

## 5. Reminder Notifications Design

### 5.1 Visual Representation: Bookmarks

Reminders appear as **golden bookmarks** protruding from book spines:

```
┌─────────────────────────────────────────────┐
│  ╔═════════════════════════════════════════╗ │
│  ║  📖  🌿  🗣  ✍️  🏺  🎭  💌  📋       ║ │
│  ║   │    │    │    │    │    │    │      ║ │
│  ║   ▼    ▼    ▼    ▼    ▼    ▼    ▼      ║ │
│  ║  🔖   🔖   🔖   🔖   🔖   🔖   🔖      ║ │
│  ║ [3]  [1]  [2]  [0]  [1]  [0]  [1]      ║ │
│  ╚═════════════════════════════════════════╝ │
│         ────────────────────────────────    │
│  ╔═════════════════════════════════════════╗ │
│  ║  [Saved entries with bookmarks]         ║ │
│  ╚═════════════════════════════════════════╝ │
└─────────────────────────────────────────────┘
```

**Bookmark Design:**
- Golden ribbon material (`#B8922A`)
- Subtle fabric texture
- Small number badge showing reminder count
- Gentle sway animation (±3°) when reminders exist
- Click to view all reminders for that book

### 5.2 Reminder Types & Visual Indicators

| Reminder Type | Bookmark Style | Badge Color |
|---------------|----------------|-------------|
| Daily check-in | Gold ribbon | Gold |
| Weekly summary | Silver ribbon | Silver |
| Unfinished entry | Red ribbon tip | Red |
| Bookmarked entry | Star icon | Gold |
| Therapist note | Blue ribbon | Blue |

### 5.3 Reminder Interaction

```
User clicks bookmark
    ↓
[Animation: Bookmark slides up, expands into card]
    ↓
┌─────────────────────────────────────┐
│ 🔖 Reminders for "Today's Page"    │
├─────────────────────────────────────┤
│ • Daily check-in pending            │
│   [Open now] [Snooze 1h]           │
│                                     │
│ • Unfinished entry from yesterday   │
│   [Continue] [Dismiss]              │
│                                     │
│ • Bookmarked: "I noticed a need"    │
│   [View] [Remove bookmark]          │
└─────────────────────────────────────┘
```

---

## 6. Implementation Plan

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Three.js + React Three Fiber
- [ ] Create basic bookshelf scene
- [ ] Implement camera controls
- [ ] Add lighting and shadows
- [ ] Create book mesh geometry

### Phase 2: Core Interactions (Week 3-4)
- [ ] Implement hover animations
- [ ] Build book selection animation
- [ ] Create page flip animation
- [ ] Add transition to 2D content
- [ ] Implement return-to-shelf animation

### Phase 3: Cover Designer (Week 5-6)
- [ ] Build 2D cover editor UI
- [ ] Implement texture generation
- [ ] Create material presets
- [ ] Add live 3D preview
- [ ] Save/load cover designs

### Phase 4: Reminders (Week 7)
- [ ] Design bookmark component
- [ ] Implement reminder data model
- [ ] Add bookmark animations
- [ ] Create reminder card UI
- [ ] Integrate with notification system

### Phase 5: Polish (Week 8)
- [ ] Optimize performance
- [ ] Add sound effects (optional)
- [ ] Implement accessibility features
- [ ] Cross-browser testing
- [ ] Mobile optimization

---

## 7. Performance Considerations

### 7.1 Optimization Strategies

| Technique | Impact | Implementation |
|-----------|--------|----------------|
| **Instanced Mesh** | High | Reuse book geometry for multiple books |
| **LOD (Level of Detail)** | Medium | Reduce polygon count for distant books |
| **Texture Atlas** | Medium | Combine textures into single atlas |
| **Lazy Loading** | High | Load book details only when needed |
| **Object Pooling** | Medium | Reuse animation objects |

### 7.2 Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Initial load | < 2s | With 8 core books |
| Animation FPS | 60 FPS | On mid-range devices |
| Memory usage | < 50MB | For full library |
| Battery impact | Low | Minimal GPU usage when idle |

---

## 8. Accessibility

### 8.1 Keyboard Navigation

- `Tab` — Cycle through books
- `Enter`/`Space` — Select book
- `Escape` — Close book / Return to shelf
- `Arrow keys` — Navigate between books

### 8.2 Screen Reader Support

```html
<div
  role="button"
  aria-label="Today's Page book. Click to open."
  aria-describedby="book-description"
  tabindex="0"
>
  <span id="book-description" class="sr-only">
    A gentle daily check-in tool. 3 reminders pending.
  </span>
</div>
```

### 8.3 Reduced Motion Preference

```css
@media (prefers-reduced-motion: reduce) {
  .book-3d {
    transition: none !important;
    animation: none !important;
  }
}
```

---

## 9. Fallback Strategy

If WebGL is not available or performance is poor:

1. **CSS 3D Fallback:** Use CSS transforms for 3D effect
2. **2D Grid Fallback:** Show books as flat cards with hover effects
3. **Progressive Enhancement:** Start with 2D, upgrade to 3D if supported

```javascript
const use3D = useMemo(() => {
  return (
    typeof window !== 'undefined' &&
    window.WebGLRenderingContext &&
    !prefersReducedMotion &&
    !isLowEndDevice
  );
}, []);
```

---

## 10. Technical Specifications

### 10.1 Book Geometry

```javascript
const bookGeometry = {
  width: 32,        // px (spine width)
  height: 180,      // px (book height)
  depth: 220,       // px (book depth when open)
  spineRadius: 2,   // px (rounded spine)
  coverThickness: 1, // px
  pageThickness: 0.5, // px per page
  pageCount: 200    // visual pages
};
```

### 10.2 Material Properties

```javascript
const leatherMaterial = {
  color: "#1B2A4A",
  roughness: 0.7,
  metalness: 0.1,
  normalMap: "leather_normal.png",
  bumpScale: 0.02
};

const goldFoilMaterial = {
  color: "#B8922A",
  roughness: 0.3,
  metalness: 0.8,
  emissive: "#D4A845",
  emissiveIntensity: 0.2
};
```

### 10.3 Lighting Setup

```javascript
const lighting = {
  ambient: {
    color: "#F5F0E8",
    intensity: 0.6
  },
  directional: {
    color: "#FFFFFF",
    intensity: 0.8,
    position: { x: -5, y: 10, z: 5 },
    castShadow: true
  },
  fill: {
    color: "#E4DBCA",
    intensity: 0.3,
    position: { x: 5, y: 5, z: 5 }
  }
};
```

---

## 11. File Structure

```
theinnerlibrary/
├── src/
│   ├── 3d/
│   │   ├── components/
│   │   │   ├── Bookshelf.jsx
│   │   │   ├── Book.jsx
│   │   │   ├── BookCover.jsx
│   │   │   ├── BookSpine.jsx
│   │   │   ├── BookPages.jsx
│   │   │   ├── Bookmark.jsx
│   │   │   ├── Lighting.jsx
│   │   │   └── CameraController.jsx
│   │   ├── hooks/
│   │   │   ├── useBookAnimation.jsx
│   │   │   ├── useBookshelfLayout.jsx
│   │   │   └── useCoverDesigner.jsx
│   │   ├── utils/
│   │   │   ├── bookGeometry.js
│   │   │   ├── materialPresets.js
│   │   │   ├── textureGenerator.js
│   │   │   └── animationTimings.js
│   │   └── scenes/
│   │       ├── LibraryScene.jsx
│   │       └── BookOpenScene.jsx
│   ├── components/
│   │   ├── BookCoverDesigner.jsx
│   │   └── ReminderCard.jsx
│   └── screens/
│       └── Library3D.jsx
├── public/
│   └── textures/
│       ├── leather_normal.png
│       ├── cloth_normal.png
│       ├── paper_normal.png
│       └── gold_foil.png
└── package.json
```

---

## 12. Dependencies

```json
{
  "dependencies": {
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.88.0",
    "three": "^0.158.0",
    "@react-spring/three": "^9.7.3",
    "framer-motion": "^10.16.0",
    "canvas-confetti": "^1.9.0"
  }
}
```

---

## 13. Next Steps

1. **Prototype:** Build a minimal Three.js bookshelf with 2 books
2. **Test:** Verify animations on target devices
3. **Iterate:** Refine based on user feedback
4. **Scale:** Add remaining books and features
5. **Polish:** Optimize performance and accessibility

---

## Appendix: Animation Timing Reference

| Animation | Duration | Easing | Notes |
|-----------|----------|--------|-------|
| Hover lift | 200ms | easeOut | Subtle, responsive |
| Selection slide | 400ms | easeInOutCubic | Smooth, deliberate |
| Book open | 600ms | easeOutBack | Slight overshoot |
| Page flip | 300ms | easeInOutSine | Natural feel |
| Content fade | 200ms | easeOutQuad | Quick transition |
| Bookmark sway | 3s | easeInOutSine | Continuous loop |
| Return to shelf | 400ms | easeInOutCubic | Mirror of selection |

---

*This specification provides a complete roadmap for implementing a photorealistic 3D bookshelf interface for The Inner Library application.*