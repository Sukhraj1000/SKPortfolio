# Deployment Guide for Hostinger

This guide explains how to deploy your Next.js portfolio to Hostinger as a static site.

## Prerequisites

- A Hostinger account with web hosting
- FTP client (like FileZilla) or Hostinger's File Manager
- Node.js and npm installed on your local machine

## Step 1: Prepare your project for deployment

The project is already configured for static site generation with the following settings:

- `next.config.ts`: Configured with `output: 'export'` and `images.unoptimized: true`
- Added a `.htaccess` file in the public directory
- Created a deployment script (`deploy.sh`)

## Step 2: Build your static site

Run the deployment script to generate your static site:

```bash
./deploy.sh
```

This will:
1. Clean previous builds
2. Build your Next.js project as static HTML/CSS/JS files
3. Output files to the `out` directory

## Step 3: Upload to Hostinger

### Option 1: Using File Manager

1. Log in to your Hostinger Control Panel
2. Navigate to **File Manager**
3. Navigate to the `public_html` directory (or your desired subdirectory)
4. Upload all contents from your local `out` directory to this directory

### Option 2: Using FTP

1. Connect to your Hostinger server using an FTP client with credentials from your Hostinger control panel
2. Navigate to the `public_html` directory on the remote server 
3. Upload all contents from your local `out` directory to this directory

## Step 4: Verify your deployment

1. Visit your domain to ensure the site is working properly
2. Test navigation to different pages
3. Check that all images and assets are loading correctly

## Troubleshooting

- **404 errors**: Make sure the `.htaccess` file was properly uploaded
- **Missing assets**: Check paths and verify all files were uploaded
- **Image loading issues**: Ensure all image paths are correct

## Updating your site

When you want to update your site:

1. Make changes to your code locally
2. Run `./deploy.sh` to rebuild your site
3. Upload the new contents of the `out` directory to Hostinger, replacing the old files

## Additional Notes

- The site is configured as a static export, which means it doesn't need a Node.js server to run
- Dynamic routes in Next.js are pre-rendered at build time for static deployment
- Your site should load quickly as it's fully static HTML/CSS/JS 