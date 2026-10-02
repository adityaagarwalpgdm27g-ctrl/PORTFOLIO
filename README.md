# Aditya Agarwal: portfolio site

One folder, one deploy, three working links:

| Path | What it is |
|---|---|
| `/` | Portfolio |
| `/boat/` | boAt Decision-Making System (live dashboard) |
| `/gharfix/` | GharFix website (walk-through + booking) |
| `/#/work/hafele` | Häfele teaching case, with the field dashboard |
| `/assets/` | Photo, screenshots, resume PDF, public dashboard PDF |

The portfolio links to the other two with relative paths, so nothing needs editing after you deploy.

## Deploy on Vercel (recommended)

You need a free Vercel account (vercel.com, sign up with GitHub or email).

### Option A: Vercel CLI (no GitHub needed)
1. Install Node.js from nodejs.org (LTS version).
2. Open a terminal in this folder (`aditya-portfolio`) and run:
   ```
   npm install -g vercel
   vercel login
   vercel --prod
   ```
3. Answer the prompts: set up and deploy → Yes; scope → your account; link to existing project → No; project name → e.g. `aditya-agarwal`; directory → `./`; override settings → No.
4. Vercel prints your live link, e.g. `https://aditya-agarwal.vercel.app`.

### Option B: GitHub + Vercel (updates automatically when you change files)
GitHub's website uploads only 100 files at a time and this folder has about 250, so use GitHub Desktop (desktop.github.com):
1. GitHub Desktop → File → New repository → name `aditya-portfolio` → Create.
2. Copy everything in this folder into the new repository folder → Commit → Publish repository.
3. On vercel.com: Add New → Project → Import `aditya-portfolio` → Framework preset: Other → Deploy.

## Alternative: Netlify Drop (fastest, drag and drop)
Go to app.netlify.com/drop, drag this whole folder onto the page. Sign up (free) to keep the link permanently, then change the site name under Site settings.

## After deploying
- Check all three links: `/`, `/boat/`, `/gharfix/`.
- Put the main link on your resume and LinkedIn.
- To change the name in the link: Vercel → Project → Settings → Domains (or Netlify → Site settings → Change site name).

## Updating your resume later
Replace `assets/Aditya_Agarwal_Resume.pdf` (keep the same name) and `assets/resume-1.jpg` (the preview image), then deploy again.
