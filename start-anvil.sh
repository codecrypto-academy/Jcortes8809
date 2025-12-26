#!/bin/bash
# start-anvil.sh - Script para iniciar Anvil con configuración adecuada
# Ejecutar en Git Bash

echo "🔥 Iniciando Anvil (Ethereum Local Node)..."
echo "==========================================="
echo ""
echo "⚠️  IMPORTANTE: Deja esta terminal abierta mientras desarrollas"
echo ""
echo "Cuentas disponibles:"
echo "  Admin:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
echo "  Account1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
echo "  Account2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
echo "  Account3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906"
echo "  Account4: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
echo ""
echo "Chain ID: 31337"
echo "RPC URL: http://localhost:8545"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Iniciar Anvil
anvil
