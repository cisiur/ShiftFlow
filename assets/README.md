# Assets

Place these files here before building for production:

- `icon.png` — 1024×1024 app icon (iOS + Android)
- `adaptive-icon.png` — 1024×1024 foreground for Android adaptive icon
- `splash.png` — 1284×2778 splash screen image
- `favicon.png` — 48×48 web favicon

For development with Expo Go, the app runs without these files.
For production builds (EAS Build), all icons are required.

## Quick placeholder (development only)

You can generate simple placeholder images with any image editor, or use:
```bash
npx expo install expo-asset
# Then copy any 1024x1024 PNG as icon.png
```
