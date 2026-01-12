# Talor Web App 🎯

AI-powered resume tailoring for cybersecurity professionals - now available as a web application!

## 🌐 Live Demo

**Backend:** https://resume-ai-backend-production-3134.up.railway.app
**Frontend:** _Deploy to Vercel to get your URL_

---

## ✨ Features

- 📄 **Upload Resume**: Upload your .docx or .pdf resume for AI processing
- 🎯 **Tailor Resume**: Customize your resume for specific jobs using Claude AI & Perplexity
- 👀 **Side-by-Side Comparison**: See original vs. tailored resume
- 🎨 **Modern UI**: Beautiful gradient design with Urbanist font
- ⚡ **Fast**: Built with Vite and React for optimal performance

---

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at http://localhost:3000

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📦 Deploy to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd C:\Users\derri\projects\resume-ai-app\web
   vercel
   ```

4. **Follow the prompts**:
   - Set up and deploy? **Y**
   - Which scope? **Select your account**
   - Link to existing project? **N**
   - Project name? **talor** (or your preferred name)
   - In which directory is your code located? **./**
   - Want to modify settings? **N**

5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import Git Repository or upload the `web` folder
3. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (if uploading web folder directly)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://resume-ai-backend-production-3134.up.railway.app`
5. Click **Deploy**

---

## 🔧 Environment Variables

Create a `.env` file with:

```env
VITE_API_URL=https://resume-ai-backend-production-3134.up.railway.app
```

---

## 📁 Project Structure

```
web/
├── src/
│   ├── api/
│   │   └── client.ts          # API client for Railway backend
│   ├── pages/
│   │   ├── TailorResume.tsx   # Main tailoring page
│   │   └── UploadResume.tsx   # Resume upload page
│   ├── App.tsx                # Root component with routing
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── public/                     # Static assets
├── index.html                  # HTML template
├── vite.config.ts              # Vite configuration
├── package.json                # Dependencies
└── vercel.json                 # Vercel deployment config
```

---

## 🔗 Backend Integration

The web app connects to the existing Railway backend:

```typescript
// API calls from src/api/client.ts
const API_BASE_URL = 'https://resume-ai-backend-production-3134.up.railway.app';

// Available endpoints:
- POST /api/resumes/upload    // Upload resume
- GET  /api/resumes            // List all resumes
- POST /api/resumes/tailor     // Tailor resume
- GET  /api/health             // Health check
```

---

## 🎨 Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **React Router 7** - Routing
- **Lucide React** - Icons

---

## 🆚 Electron vs Web Comparison

| Feature | Electron (Desktop) | Web App |
|---------|-------------------|---------|
| File Upload | Native file dialog | HTML file input |
| Backend Calls | IPC → Main Process → HTTP | Direct HTTP calls |
| Distribution | Download .exe | URL access |
| Updates | Manual download | Instant (refresh) |
| Offline Support | Partial | Requires internet |

---

## 🐛 Troubleshooting

### Build Errors

If you encounter build errors:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### API Connection Issues

1. Check backend is running: https://resume-ai-backend-production-3134.up.railway.app/api/health
2. Verify VITE_API_URL in `.env`
3. Check CORS settings on backend

### Deployment Issues

1. Ensure vercel.json is configured correctly
2. Check build logs in Vercel dashboard
3. Verify environment variables are set in Vercel project settings

---

## 📝 Next Steps After Deployment

1. **Custom Domain**: Add a custom domain in Vercel settings
2. **Analytics**: Add Vercel Analytics or Google Analytics
3. **SEO**: Add meta tags and Open Graph tags
4. **PWA**: Convert to Progressive Web App for offline support
5. **Authentication**: Add user login and resume management

---

## 🤝 Contributing

This is a personal project, but feel free to fork and customize for your own use!

---

## 📄 License

MIT

---

## 🎯 About Talor

Talor uses Claude AI and Perplexity to deeply research companies and tailor your resume to match their culture, values, and job requirements. Built for cybersecurity professionals seeking high-quality, customized resume outputs.

**Created by**: Justin Washington
**Contact**: justinwashington@gmail.com
**LinkedIn**: linkedin.com/in/justintwashington
