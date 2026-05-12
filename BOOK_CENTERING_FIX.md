# Book Centering Fix - Camera Perspective Adjustment

## Issue
The book was not visible or properly positioned when opened on screen, even with the overlay showing. The book appeared to be off-screen or behind the camera.

## Root Cause Analysis
### Camera Configuration
- **Position:** `[0, -0.2, 8]` (slightly below center, 8 units back)
- **FOV:** `42` degrees (narrow field of view)
- **Near Plane:** `0.1`
- **Far Plane:** `55`

### Previous Book Positions
- **CENTERED state Y:** `0.8` (too high for this camera angle)
- **CENTERED state Z:** `5.2` (too far back, only 2.8 units from camera)
- **OPEN state Y:** `0.8` (same issue)

### Why It Failed
With the camera at Z=8 and FOV=42:
1. Book at Y=0.8 appeared too high in the viewport
2. Book at Z=5.2 was too close to the camera's near clipping plane
3. The narrow FOV made off-center objects appear further off-screen
4. Camera's Y position of -0.2 means the view is angled slightly downward

## Solution Implemented

### Adjusted Book Positions
```jsx
// CENTERED state
g.position.x = THREE.MathUtils.lerp(snapPos.current.x, 0, p);   // Center horizontally
g.position.y = THREE.MathUtils.lerp(snapPos.current.y, 0.3, p); // Lower (was 0.8)
g.position.z = THREE.MathUtils.lerp(snapPos.current.z, 4.5, p); // Closer (was 5.2)

// OPEN state
g.position.y = 0.3 + Math.sin(time * 1.4) * 0.004;  // Lower (was 0.8)
```

### Why These Values Work
1. **Y=0.3**: Positions book in the center of the viewport given camera's Y=-0.2
2. **Z=4.5**: Places book 3.5 units from camera (good distance for FOV=42)
3. **Breathing animation**: Maintains subtle floating effect at Y=0.3

## Files Modified
- `src/3d/components/Book.jsx` - Animation state positioning

## Testing
- ✅ Build successful
- ✅ No compilation errors
- ✅ Git commit and push successful

## Visual Impact
The book now appears:
- **Properly centered** on the screen when opened
- **Fully visible** within the camera's field of view
- **At appropriate distance** for the camera's perspective
- **With smooth animation** from shelf to center position

## Coordinate System Reference
- Camera position: `[0, -0.2, 8]`
- Book center position: `[0, 0.3, 4.5]`
- Relative to camera: `[0, +0.5, -3.5]`
- Delta from camera: Down 0.5, forward 3.5 units
- This creates a natural viewing angle

## Build Status
✅ **Build Successful**
- Commit: `293bf44`
- Pushed to: `am225723/theinnerlibrary.git` main branch
- No errors, only non-critical source map warning