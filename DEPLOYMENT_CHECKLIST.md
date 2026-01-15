# Claude Deployment Checklist

## ⚠️ CRITICAL RULE: ALL CHANGES MUST BE DEPLOYED TO PRODUCTION

**No changes stay in local/dev. Everything goes live immediately.**

---

## Workflow for Every Change

### Backend Changes (resume-ai-backend)

1. **Make Changes** in backend/app/
2. **Commit to Git**
   ```bash
   cd backend && git add . && git commit -m "Description"
   ```
3. **Push to GitHub**
   ```bash
   git push origin main
   ```
4. **Deploy to Railway (MANDATORY)**
   ```bash
   railway up
   ```
5. **Verify Deployment**
   ```bash
   curl https://resume-ai-backend-production-3134.up.railway.app/health
   ```

### Frontend Changes (talor-web)

1. **Make Changes** in web/src/
2. **Commit to Git**
   ```bash
   git add . && git commit -m "Description"
   ```
3. **Push to GitHub**
   ```bash
   git push origin master
   ```
4. **Deploy to Vercel (MANDATORY)**
   ```bash
   vercel --prod --token d5fI7CE1HK76axj4HVZTA0es --force
   ```
5. **Verify Deployment**
   - Must see: "Aliased: https://talorme.com"
   - Curl check: `curl -I https://talorme.com | grep date`

---

## ✅ Claude's Deployment Promise

Before telling the user a fix is complete:

1. ✅ Make changes locally
2. ✅ Commit to git
3. ✅ Push to GitHub
4. ✅ Deploy to Railway/Vercel
5. ✅ Verify with curl
6. ✅ Test in production browser
7. ✅ Only then say "It's deployed"

**No exceptions. Every change goes live.**
