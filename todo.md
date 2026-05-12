# Library Overlay & Cover Customization Overhaul

## Phase 1: Remove HTML Overlay, Render Pages in 3D Book
- [ ] Update Book.jsx to render inner page content (title, icon, buttons) as 3D textures when OPEN
- [ ] Build inner page texture with title, icon, description, and interactive elements
- [ ] Remove BookPageOverlay.jsx and BookPageOverlay.module.css
- [ ] Update Library3D.jsx to remove overlay state and component usage
- [ ] Handle Open Page / Return to Shelf actions from within the 3D scene via callbacks

## Phase 2: Enhanced Custom Book Covers
- [ ] Add more cover styles (art_deco, ornate, floral_vine, geometric_modern, typographic)
- [ ] Implement pattern textures that render on covers
- [ ] Add corner decoration styles that render on covers
- [ ] Support custom icon rendering on covers via the texture generator
- [ ] Make border styles render visually on the cover texture

## Phase 3: Build, Test & Push
- [ ] Run build to verify no errors
- [ ] Commit and push to GitHub via gh CLI
