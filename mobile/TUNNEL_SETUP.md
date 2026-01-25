# Expo Tunnel Setup Guide

## Quick Start

Double-click `start-tunnel.bat` to start the Expo dev server with tunnel mode.

## If Tunnel Keeps Timing Out

### Option 1: Try Manual ngrok Setup
```bash
npm install -g ngrok
ngrok config add-authtoken YOUR_TOKEN_HERE
npx expo start --tunnel
```

Get your ngrok auth token from: https://dashboard.ngrok.com/get-started/your-authtoken

### Option 2: Use Cloudflare Tunnel (Faster Alternative)
```bash
npm install -g cloudflared
npx expo start --tunnel
```

### Option 3: Use LAN Mode (Same WiFi Network)
If you're on the same WiFi as your phone:
```bash
npx expo start
```
Then scan the QR code with the Expo app on your phone.

### Option 4: Use Localhost Tunnel Service
```bash
npx localtunnel --port 8081
```

## Troubleshooting

### Error: "ngrok tunnel took too long to connect"

**Cause**: Firewall, network restrictions, or ngrok service issues

**Solutions**:
1. Check your firewall - allow ngrok.exe
2. Try a different network (mobile hotspot)
3. Restart your router
4. Use cloudflared instead (faster and more reliable)

### Error: "Port 8081 is being used"

**Solution**:
```bash
npx expo start --tunnel --port 8090
```

### Can't connect from phone

1. Make sure you're scanning the QR code from the Expo terminal output
2. Both devices should be connected to internet (not necessarily same network with tunnel)
3. Try downloading the Expo app from App Store if not installed

## Current Setup

- **API Backend**: https://resume-ai-backend-production-3134.up.railway.app
- **User Session**: Stored in AsyncStorage on device
- **Expo Account**: heirclark17

## Alternative: Build Standalone App

If tunnel keeps failing, build a development build:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Create development build
eas build --profile development --platform ios

# Install on your device via TestFlight or direct install
```

This creates a native iOS app that runs without Expo Go/tunnel.
