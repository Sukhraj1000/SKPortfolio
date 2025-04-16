#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process for your portfolio..."

# Clean previous builds
echo "🧹 Cleaning up previous builds..."
rm -rf out .next

# Build the project
echo "🏗️ Building your Next.js project..."
npm run build

echo "✨ Build completed successfully!"

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