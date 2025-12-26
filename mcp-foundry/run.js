#!/usr/bin/env node

// Wrapper script to run the MCP server with better error handling
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = join(__dirname, 'dist', 'index.js');
const serverURL = pathToFileURL(serverPath).href;

try {
  // Import and run the server using file:// URL
  await import(serverURL);
} catch (error) {
  console.error('MCP Error:', error.message);
  process.exit(1);
}
