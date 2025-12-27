# Web Deployment Guide

## Building for Web Deployment

Your app is configured to deploy to: **https://www.idatagear.com/tttt**

### Step 1: Build the Project

Run the build command to create the production-ready files:

```bash
npm run build
```

This will:
- Create optimized production files in the `dist/` folder
- Use the base path `/tttt/` for all assets
- Minify and optimize JavaScript, CSS, and assets

### Step 2: Review the Build Output

After building, check the `dist/` folder:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── style-[hash].css
└── ...
```

### Step 3: Deploy to Your Server

You need to upload the contents of the `dist/` folder to your web server at:
```
https://www.idatagear.com/tttt/
```

#### Option A: Using FTP/SFTP
1. Connect to your server via FTP/SFTP
2. Navigate to your web root directory
3. Upload all files from the `dist/` folder to the `tttt/` directory
4. Ensure the directory structure is: `www.idatagear.com/tttt/index.html`

#### Option B: Using SSH/SCP
```bash
# From your project directory
scp -r dist/* user@your-server:/path/to/www/tttt/
```

#### Option C: Using Git (if your server supports it)
1. Push your code to a repository
2. On your server, pull the latest code
3. Run `npm run build` on the server
4. Copy `dist/` contents to the web directory

### Step 4: Verify Deployment

After uploading, verify:
1. Visit: https://www.idatagear.com/tttt/
2. Check that the app loads correctly
3. Verify AdSense ads are displaying
4. Test on mobile and desktop

## Important Configuration

### Base Path
The app is configured with base path `/tttt/` in `vite.config.ts`. This means:
- All assets will be loaded from `/tttt/assets/...`
- The app expects to be served from `https://www.idatagear.com/tttt/`

### AdSense Configuration
✅ AdSense is already configured correctly:
- Script in `index.html`: `ca-pub-8396981938969998`
- AdSense component uses the same client ID
- Ads are placed in the game interface

## Server Requirements

Your web server needs to:
1. Serve static files (HTML, JS, CSS, images)
2. Support client-side routing (SPA)
3. Have proper MIME types configured
4. Support HTTPS (required for AdSense)

### Apache Configuration (if using Apache)

Create or update `.htaccess` in the `tttt/` directory:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /tttt/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /tttt/index.html [L]
</IfModule>
```

### Nginx Configuration (if using Nginx)

Add to your Nginx config:

```nginx
location /tttt {
    alias /path/to/your/dist;
    try_files $uri $uri/ /tttt/index.html;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Build Scripts

Available npm scripts:
- `npm run build` - Build for web deployment (uses `/tttt/` base path)
- `npm run build:android` - Build for Android (uses `/` base path)
- `npm run preview` - Preview the production build locally
- `npm run dev` - Development server (for testing)

## Troubleshooting

### Assets Not Loading
- Check that the base path is correct in `vite.config.ts`
- Verify files are uploaded to the correct directory
- Check browser console for 404 errors

### AdSense Not Showing
- Verify the AdSense script is in `index.html`
- Check that your domain is approved in AdSense
- Ensure HTTPS is enabled (AdSense requires HTTPS)
- Check browser console for AdSense errors

### Routing Issues
- Ensure your server is configured for SPA routing (see server config above)
- All routes should redirect to `index.html`

## Quick Deploy Checklist

- [ ] Run `npm run build`
- [ ] Verify `dist/` folder contains all files
- [ ] Upload `dist/` contents to `www.idatagear.com/tttt/`
- [ ] Configure server for SPA routing (if needed)
- [ ] Test the deployed app
- [ ] Verify AdSense is working
- [ ] Test on mobile devices

