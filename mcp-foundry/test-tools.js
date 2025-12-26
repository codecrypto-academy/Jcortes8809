#!/usr/bin/env node

/**
 * Script de prueba para usar el MCP de Foundry directamente
 * Útil para testing y debugging
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

async function testMCP() {
  console.log('🔨 Testing Foundry MCP Server...\n');

  // Iniciar el servidor MCP
  const serverProcess = spawn('node', ['run.js'], {
    stdio: ['pipe', 'pipe', 'inherit'],
  });

  // Crear cliente
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['run.js'],
  });

  const client = new Client(
    {
      name: 'foundry-test-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  try {
    // Conectar al servidor
    await client.connect(transport);
    console.log('✅ Connected to MCP server\n');

    // Listar herramientas disponibles
    const { tools } = await client.listTools();
    console.log(`📋 Available tools (${tools.length}):\n`);

    tools.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.name}`);
      console.log(`   ${tool.description}\n`);
    });

    // Ejemplo: Verificar chain ID
    console.log('🧪 Testing cast_chain_id...\n');
    const result = await client.callTool({
      name: 'cast_chain_id',
      arguments: {
        rpc_url: 'http://localhost:8545',
      },
    });

    console.log('Result:', result);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    serverProcess.kill();
  }
}

// Ejecutar
testMCP().catch(console.error);
