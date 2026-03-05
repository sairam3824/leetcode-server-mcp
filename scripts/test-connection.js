#!/usr/bin/env node

/**
 * Simple test script to verify the server can start
 * Run after building: node scripts/test-connection.js
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serverPath = join(__dirname, '..', 'build', 'index.js');

console.log('🧪 Testing MCP LeetCode Server connection...\n');

const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';

server.stdout.on('data', (data) => {
  output += data.toString();
});

server.stderr.on('data', (data) => {
  const message = data.toString();
  if (message.includes('MCP LeetCode Server running')) {
    console.log('✅ Server started successfully!');
    console.log('✅ stdio transport initialized');
    console.log('\n📝 Server is ready to accept MCP requests');
    server.kill();
    process.exit(0);
  }
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});

setTimeout(() => {
  console.error('❌ Server did not start within 5 seconds');
  console.error('Output:', output);
  server.kill();
  process.exit(1);
}, 5000);
