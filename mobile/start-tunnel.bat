@echo off
echo Starting Expo with Tunnel mode...
cd /d "%~dp0"
npx expo start --tunnel --clear
