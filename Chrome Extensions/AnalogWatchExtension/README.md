# Analog Watch Chrome Extension

A beautifully crafted Chrome extension featuring an elegant analog watch with British design aesthetics.

## Features

- **Analog Watch Face**: Professional British-crafted design with elegant styling
- **Real-time Clock**: Smooth hand animations showing hours, minutes, and seconds
- **Digital Display**: Current time shown in HH:MM:SS format
- **Temperature Display**: Real-time temperature fetched from your location
- **Smooth Animations**: Fluid motion of watch hands synchronized with system time
- **Tapered Watch Hands**: Professional pointed ends on all three hands
- **Hour & Minute Dials**: Precise markers for accurate time reading
- **Designer Branding**: "Chronos" designer logo in the center

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** using the toggle in the top-right corner
3. Click **Load unpacked**
4. Navigate to the `AnalogWatchExtension` folder and select it
5. The extension should now appear in your Chrome extensions list

## Usage

Simply click the extension icon in your Chrome toolbar to view the analog watch. The extension displays:

- **Analog Clock**: Real-time watch face with moving hands
- **Digital Time**: Exact time in HH:MM:SS format below the clock
- **Current Temperature**: Temperature at your location (requires location permission)

## Permission

The extension requests **Geolocation** permission to:
- Determine your current location
- Fetch local weather/temperature data from Open-Meteo API

You can grant or deny this permission when the extension first attempts to use it.

## Project Structure

```
AnalogWatchExtension/
├── manifest.json          # Chrome extension configuration
├── popup.html             # Main HTML structure
├── popup.css              # Styling with British design aesthetic
├── popup.js               # Clock logic and temperature fetching
├── icons/                 # Extension icons
│   ├── icon-16.svg        # Small icon (16x16)
│   ├── icon-48.svg        # Medium icon (48x48)
│   └── icon-128.svg       # Large icon (128x128)
└── README.md              # This file
```

## Technical Details

### Manifest
- Manifest Version: 3
- Permissions: Geolocation
- Action: Popup extension

### APIs Used
- **Web APIs**: Canvas/SVG rendering, Geolocation API
- **External API**: Open-Meteo (free weather data API)
- **JavaScript**: ES6+, Classes for clean architecture

### Styling Features
- Gradient backgrounds for realistic depth
- Box shadows for 3D appearance
- Smooth CSS animations
- Responsive design for different screen sizes

### Watch Hand Animation
- Hour hand rotates 360° every 12 hours (0.5°/minute)
- Minute hand rotates 360° every 60 minutes (6°/minute)
- Second hand rotates 360° every 60 seconds (6°/second)
- Smooth sub-second animation using milliseconds

## Browser Compatibility

- Google Chrome 88+
- Chromium-based browsers

## License

Created with British design principles in mind for elegant timekeeping.

## Notes

- The extension is lightweight and uses no external libraries
- Temperature data is fetched every 10 minutes (600000ms)
- Temperature display shows "--°C" if location is unavailable
- All animations run smoothly at 60fps
