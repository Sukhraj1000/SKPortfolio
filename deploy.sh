#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process for your portfolio..."

# Security Check: Check for outdated packages with known vulnerabilities
echo "🔒 Running security audit on dependencies..."
npm audit --production
if [ $? -ne 0 ]; then
  echo "⚠️  Security vulnerabilities detected. Consider fixing them before deployment."
  echo "   Run 'npm audit fix' to attempt automatic fixes."
  read -p "Continue deployment anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment aborted."
    exit 1
  fi
fi

# Clean previous builds
echo "🧹 Cleaning up previous builds..."
rm -rf out .next

# Build the project
echo "🏗️ Building your Next.js project..."
npm run build

echo "✨ Build completed successfully!"

# Security Check: Verify all required security files exist
echo "🔒 Verifying security files..."
if [ ! -f "public/robots.txt" ]; then
  echo "⚠️  Warning: robots.txt is missing"
fi
if [ ! -f "public/.htaccess" ]; then
  echo "⚠️  Warning: .htaccess is missing"
fi
if [ ! -f "public/js/cursor-effect.js" ]; then
  echo "⚠️  Warning: cursor-effect.js is missing"
fi

# Verify the output directory exists
if [ -d "out" ]; then
  echo "📁 Static files generated in the 'out' directory"
  echo "📊 Files ready for upload to Hostinger:"
  find out -type f | wc -l
else
  echo "❌ Build failed: 'out' directory was not created"
  exit 1
fi

echo ""
echo "✅ Deployment preparation complete!"
echo "🌍 To deploy to Hostinger:"
echo "   1. Log in to your Hostinger account"
echo "   2. Navigate to File Manager or use FTP"
echo "   3. Upload all contents from the 'out' directory to your hosting root (public_html)"
echo "" 