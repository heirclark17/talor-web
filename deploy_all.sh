#!/bin/bash
# Deploy both backend and frontend to production

set -e  # Exit on any error

echo "============================================"
echo "DEPLOYING TO PRODUCTION"
echo "============================================"

# Backend deployment
echo ""
echo "[1/4] Deploying Backend to Railway..."
cd backend
git status | grep -q "nothing to commit" || (echo "❌ Backend has uncommitted changes!" && exit 1)
git push origin main
railway up
echo "✅ Backend deployed"

# Wait for backend to be ready
echo ""
echo "[2/4] Waiting for backend to be ready..."
sleep 30
HEALTH=$(curl -s https://resume-ai-backend-production-3134.up.railway.app/health)
if [[ $HEALTH == *"ok"* ]]; then
    echo "✅ Backend is responding"
else
    echo "❌ Backend health check failed"
    exit 1
fi

# Frontend deployment
echo ""
echo "[3/4] Deploying Frontend to Vercel..."
cd ..
git status | grep -q "nothing to commit" || (echo "❌ Frontend has uncommitted changes!" && exit 1)
git push origin master
vercel --prod --token d5fI7CE1HK76axj4HVZTA0es --force | tee /tmp/vercel_deploy.log

if grep -q "https://talorme.com" /tmp/vercel_deploy.log; then
    echo "✅ Frontend deployed to https://talorme.com"
else
    echo "❌ Frontend deployment may have failed"
    exit 1
fi

# Final verification
echo ""
echo "[4/4] Final Verification..."
sleep 10
curl -sI https://talorme.com > /dev/null && echo "✅ Frontend is accessible" || (echo "❌ Frontend not accessible" && exit 1)

echo ""
echo "============================================"
echo "✅ DEPLOYMENT COMPLETE"
echo "============================================"
echo ""
echo "Backend:  https://resume-ai-backend-production-3134.up.railway.app"
echo "Frontend: https://talorme.com"
echo ""
echo "Test it now to verify everything works!"
