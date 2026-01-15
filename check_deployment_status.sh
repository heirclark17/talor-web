#!/bin/bash
echo "=== BACKEND STATUS ==="
echo "Latest commit:"
cd backend && git log -1 --oneline
echo ""
echo "Health check:"
curl -s https://resume-ai-backend-production-3134.up.railway.app/health
echo ""

echo ""
echo "=== FRONTEND STATUS ==="
echo "Latest commit:"
cd .. && git log -1 --oneline
echo ""
echo "Live site:"
curl -sI https://talorme.com | grep -E "HTTP|date"
echo ""

echo ""
echo "=== CORS CHECK ==="
curl -X OPTIONS https://resume-ai-backend-production-3134.up.railway.app/api/certifications/recommend \
  -H "Origin: https://talorme.com" \
  -v 2>&1 | grep -i "access-control-allow-origin"
