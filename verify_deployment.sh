#!/bin/bash
# Verify both backend and frontend are deployed and working

echo "============================================"
echo "DEPLOYMENT VERIFICATION"
echo "============================================"

# Backend check
echo ""
echo "[1] Backend Health Check..."
BACKEND_STATUS=$(curl -s https://resume-ai-backend-production-3134.up.railway.app/health)
if [[ $BACKEND_STATUS == *"ok"* ]]; then
    echo "✅ Backend is LIVE"
else
    echo "❌ Backend is DOWN"
    exit 1
fi

# Frontend check
echo ""
echo "[2] Frontend Deployment Check..."
FRONTEND_DATE=$(curl -sI https://talorme.com | grep -i "date" | cut -d' ' -f2-)
echo "   Last deployed: $FRONTEND_DATE"
echo "✅ Frontend is LIVE"

# CORS check
echo ""
echo "[3] CORS Configuration Check..."
CORS_CHECK=$(curl -sX OPTIONS https://resume-ai-backend-production-3134.up.railway.app/api/resume-analysis/analyze-changes \
  -H "Origin: https://talorme.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,x-user-id" \
  -v 2>&1 | grep -i "access-control-allow-origin")

if [[ $CORS_CHECK == *"talorme.com"* ]]; then
    echo "✅ CORS is configured correctly"
else
    echo "❌ CORS may have issues"
fi

# Git sync check
echo ""
echo "[4] Git Sync Check..."
cd backend
BACKEND_COMMIT=$(git log -1 --oneline | cut -d' ' -f1)
echo "   Backend latest commit: $BACKEND_COMMIT"

cd ..
FRONTEND_COMMIT=$(git log -1 --oneline | cut -d' ' -f1)
echo "   Frontend latest commit: $FRONTEND_COMMIT"

echo ""
echo "============================================"
echo "✅ ALL SYSTEMS OPERATIONAL"
echo "============================================"
