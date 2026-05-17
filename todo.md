# Inner Library — Console Warning/Error Fix

## Issues from browser console
- [x] Fix PCFSoftShadowMap deprecation → use shadows="pcf" on Canvas
- [x] Fix THREE.Clock deprecation → use useElapsedTime() hook (delta accumulation)
- [x] Fix rgba() alpha component ignored in THREE.Color constructors → hex + fillOpacity
- [x] Fix WebGL Context Lost caused by ContactShadows GPU overload → single instance + frames cap
- [x] Fix apple-mobile-web-app-capable meta tag deprecation → add mobile-web-app-capable

## Integration
- [x] Verify build compiles
- [ ] Push fix to feature branch
