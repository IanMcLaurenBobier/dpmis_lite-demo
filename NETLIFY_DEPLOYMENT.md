# Deploying DPMIS Lite to Netlify

Your application is pre-configured and ready for Netlify deployment with `netlify.toml` and `public/_redirects`.

---

## Method 1: Deploy with Git (Recommended)

1. **Push your code to GitHub / GitLab / Bitbucket**:
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Log in to your [Netlify Dashboard](https://app.netlify.com/).
   - Click **"Add new site"** > **"Import an existing project"**.
   - Select **GitHub** (or your Git provider) and choose this repository.

3. **Verify Build Settings** (Netlify will auto-detect from `netlify.toml`):
   - **Base directory**: (leave blank / root)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

4. Click **"Deploy site"**. Your site will be live at `https://<site-name>.netlify.app` within ~1 minute!

---

## Method 2: Instant Manual Drag-and-Drop (Netlify Drop)

If you don't want to connect a Git repository:

1. Build the production bundle locally:
   ```bash
   npm run build
   ```
2. Open [app.netlify.com/drop](https://app.netlify.com/drop) in your browser.
3. Drag and drop the generated `dist` folder into the upload area.
4. Your application is instantly deployed and live.

---

## Method 3: Deploy via Netlify CLI

Run the following command in your terminal:

```bash
# Login to Netlify (one-time)
npx netlify login

# Deploy to production
npx netlify deploy --prod --dir=dist
```

---

## Post-Deployment: Authorize Domain in Firebase

To ensure Firebase Authentication (Google Sign-In) and Firestore allow requests from your new Netlify URL:

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project (`gen-lang-client-0937553409`).
3. Navigate to **Build** > **Authentication** > **Settings** tab > **Authorized domains**.
4. Click **Add domain** and enter your Netlify domain:
   ```
   <your-site-name>.netlify.app
   ```
5. Click **Done**.
