#!/bin/bash

echo "🔍 Verifying MCP LeetCode Server Setup..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi
echo "✅ Node.js $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi
echo "✅ npm $(npm --version)"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  Dependencies not installed. Run: npm install"
else
    echo "✅ Dependencies installed"
fi

# Check if build directory exists
if [ ! -d "build" ]; then
    echo "⚠️  Project not built. Run: npm run build"
else
    echo "✅ Project built"
fi

# Check TypeScript files
echo ""
echo "📁 Source files:"
for file in src/*.ts; do
    if [ -f "$file" ]; then
        echo "  ✅ $(basename $file)"
    fi
done

echo ""
echo "📚 Documentation:"
[ -f "README.md" ] && echo "  ✅ README.md"
[ -f "LICENSE" ] && echo "  ✅ LICENSE"
[ -f "CONTRIBUTING.md" ] && echo "  ✅ CONTRIBUTING.md"
[ -f "CHANGELOG.md" ] && echo "  ✅ CHANGELOG.md"

echo ""
echo "🎯 Next steps:"
echo "  1. npm install"
echo "  2. npm run build"
echo "  3. Configure in your MCP client"
echo ""
