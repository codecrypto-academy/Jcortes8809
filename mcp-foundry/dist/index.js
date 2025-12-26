#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
/**
 * MCP Server for Foundry CLI tools
 * Provides tools to interact with anvil, cast, and forge
 */
// Helper function to execute shell commands
function executeCommand(command) {
    try {
        const stdout = execSync(command, {
            encoding: "utf-8",
            maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        });
        return { stdout, stderr: "" };
    }
    catch (error) {
        return {
            stdout: error.stdout?.toString() || "",
            stderr: error.stderr?.toString() || "",
            error: error.message,
        };
    }
}
// Check if Foundry is installed
function checkFoundryInstalled() {
    try {
        execSync("forge --version", { stdio: "ignore" });
        return true;
    }
    catch {
        return false;
    }
}
// Define available tools
const TOOLS = [
    // ANVIL TOOLS
    {
        name: "anvil_start",
        description: "Start a local Ethereum node using Anvil. Returns the process information.",
        inputSchema: {
            type: "object",
            properties: {
                port: {
                    type: "number",
                    description: "Port to run Anvil on (default: 8545)",
                    default: 8545,
                },
                chain_id: {
                    type: "number",
                    description: "Chain ID (default: 31337)",
                    default: 31337,
                },
                fork_url: {
                    type: "string",
                    description: "Fork from a remote RPC URL (optional)",
                },
                accounts: {
                    type: "number",
                    description: "Number of dev accounts to generate (default: 10)",
                    default: 10,
                },
            },
        },
    },
    {
        name: "anvil_get_accounts",
        description: "Get list of available accounts from Anvil",
        inputSchema: {
            type: "object",
            properties: {
                rpc_url: {
                    type: "string",
                    description: "RPC URL (default: http://localhost:8545)",
                    default: "http://localhost:8545",
                },
            },
        },
    },
    // CAST TOOLS
    {
        name: "cast_call",
        description: "Perform a call to a smart contract without submitting a transaction",
        inputSchema: {
            type: "object",
            properties: {
                contract_address: {
                    type: "string",
                    description: "Contract address to call",
                },
                function_signature: {
                    type: "string",
                    description: "Function signature (e.g., 'balanceOf(address)')",
                },
                args: {
                    type: "array",
                    description: "Function arguments",
                    items: { type: "string" },
                },
                rpc_url: {
                    type: "string",
                    description: "RPC URL (default: http://localhost:8545)",
                    default: "http://localhost:8545",
                },
            },
            required: ["contract_address", "function_signature"],
        },
    },
    {
        name: "cast_send",
        description: "Sign and publish a transaction to the blockchain",
        inputSchema: {
            type: "object",
            properties: {
                contract_address: {
                    type: "string",
                    description: "Contract address",
                },
                function_signature: {
                    type: "string",
                    description: "Function signature (e.g., 'transfer(address,uint256)')",
                },
                args: {
                    type: "array",
                    description: "Function arguments",
                    items: { type: "string" },
                },
                private_key: {
                    type: "string",
                    description: "Private key to sign the transaction",
                },
                rpc_url: {
                    type: "string",
                    description: "RPC URL (default: http://localhost:8545)",
                    default: "http://localhost:8545",
                },
            },
            required: ["contract_address", "function_signature", "private_key"],
        },
    },
    {
        name: "cast_balance",
        description: "Get the balance of an account in wei or ether",
        inputSchema: {
            type: "object",
            properties: {
                address: {
                    type: "string",
                    description: "Address to check balance",
                },
                rpc_url: {
                    type: "string",
                    description: "RPC URL (default: http://localhost:8545)",
                    default: "http://localhost:8545",
                },
                ether: {
                    type: "boolean",
                    description: "Display in ether instead of wei",
                    default: false,
                },
            },
            required: ["address"],
        },
    },
    {
        name: "cast_block_number",
        description: "Get the current block number",
        inputSchema: {
            type: "object",
            properties: {
                rpc_url: {
                    type: "string",
                    description: "RPC URL (default: http://localhost:8545)",
                    default: "http://localhost:8545",
                },
            },
        },
    },
    {
        name: "cast_chain_id",
        description: "Get the chain ID",
        inputSchema: {
            type: "object",
            properties: {
                rpc_url: {
                    type: "string",
                    description: "RPC URL (default: http://localhost:8545)",
                    default: "http://localhost:8545",
                },
            },
        },
    },
    // FORGE TOOLS
    {
        name: "forge_build",
        description: "Build (compile) the smart contracts in the project",
        inputSchema: {
            type: "object",
            properties: {
                project_path: {
                    type: "string",
                    description: "Path to the Foundry project (default: current directory)",
                    default: ".",
                },
                optimizer_runs: {
                    type: "number",
                    description: "Number of optimizer runs",
                },
            },
        },
    },
    {
        name: "forge_test",
        description: "Run tests for the smart contracts",
        inputSchema: {
            type: "object",
            properties: {
                project_path: {
                    type: "string",
                    description: "Path to the Foundry project (default: current directory)",
                    default: ".",
                },
                test_pattern: {
                    type: "string",
                    description: "Pattern to match test names (optional)",
                },
                verbosity: {
                    type: "string",
                    description: "Verbosity level: -v, -vv, -vvv, -vvvv",
                    enum: ["-v", "-vv", "-vvv", "-vvvv"],
                },
                gas_report: {
                    type: "boolean",
                    description: "Display gas report",
                    default: false,
                },
            },
        },
    },
    {
        name: "forge_create",
        description: "Deploy a smart contract",
        inputSchema: {
            type: "object",
            properties: {
                contract_path: {
                    type: "string",
                    description: "Path to contract (e.g., src/MyContract.sol:MyContract)",
                },
                constructor_args: {
                    type: "array",
                    description: "Constructor arguments",
                    items: { type: "string" },
                },
                private_key: {
                    type: "string",
                    description: "Private key to deploy with",
                },
                rpc_url: {
                    type: "string",
                    description: "RPC URL (default: http://localhost:8545)",
                    default: "http://localhost:8545",
                },
                verify: {
                    type: "boolean",
                    description: "Verify contract on Etherscan",
                    default: false,
                },
            },
            required: ["contract_path", "private_key"],
        },
    },
    {
        name: "forge_script",
        description: "Run a Forge script for deployment or interaction",
        inputSchema: {
            type: "object",
            properties: {
                script_path: {
                    type: "string",
                    description: "Path to script (e.g., script/Deploy.s.sol)",
                },
                signature: {
                    type: "string",
                    description: "Function signature to call (default: run())",
                    default: "run()",
                },
                rpc_url: {
                    type: "string",
                    description: "RPC URL",
                    default: "http://localhost:8545",
                },
                private_key: {
                    type: "string",
                    description: "Private key for broadcasting",
                },
                broadcast: {
                    type: "boolean",
                    description: "Broadcast transactions",
                    default: false,
                },
            },
            required: ["script_path"],
        },
    },
    {
        name: "forge_verify_contract",
        description: "Verify a deployed contract on Etherscan",
        inputSchema: {
            type: "object",
            properties: {
                contract_address: {
                    type: "string",
                    description: "Deployed contract address",
                },
                contract_path: {
                    type: "string",
                    description: "Path to contract source",
                },
                etherscan_api_key: {
                    type: "string",
                    description: "Etherscan API key",
                },
                chain: {
                    type: "string",
                    description: "Chain name (e.g., mainnet, goerli, sepolia)",
                },
                constructor_args: {
                    type: "array",
                    description: "Constructor arguments used in deployment",
                    items: { type: "string" },
                },
            },
            required: ["contract_address", "contract_path", "etherscan_api_key"],
        },
    },
    {
        name: "forge_inspect",
        description: "Inspect compiled contract metadata (abi, bytecode, etc.)",
        inputSchema: {
            type: "object",
            properties: {
                contract_path: {
                    type: "string",
                    description: "Path to contract (e.g., src/MyContract.sol:MyContract)",
                },
                field: {
                    type: "string",
                    description: "Field to inspect",
                    enum: ["abi", "bytecode", "deployedBytecode", "assembly", "gasEstimates", "storageLayout", "metadata"],
                },
                project_path: {
                    type: "string",
                    description: "Path to Foundry project",
                    default: ".",
                },
            },
            required: ["contract_path", "field"],
        },
    },
    {
        name: "forge_clean",
        description: "Remove build artifacts and cache directories",
        inputSchema: {
            type: "object",
            properties: {
                project_path: {
                    type: "string",
                    description: "Path to Foundry project",
                    default: ".",
                },
            },
        },
    },
    // PROJECT TOOLS
    {
        name: "get_contract_abi",
        description: "Get the ABI of a compiled contract from the project artifacts",
        inputSchema: {
            type: "object",
            properties: {
                contract_name: {
                    type: "string",
                    description: "Name of the contract",
                },
                project_path: {
                    type: "string",
                    description: "Path to Foundry project",
                    default: ".",
                },
            },
            required: ["contract_name"],
        },
    },
    {
        name: "get_deployment_info",
        description: "Get deployment information from broadcast files",
        inputSchema: {
            type: "object",
            properties: {
                script_name: {
                    type: "string",
                    description: "Name of the deployment script",
                },
                chain_id: {
                    type: "string",
                    description: "Chain ID",
                    default: "31337",
                },
                project_path: {
                    type: "string",
                    description: "Path to Foundry project",
                    default: ".",
                },
            },
            required: ["script_name"],
        },
    },
];
// Create server instance
const server = new Server({
    name: "mcp-foundry",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
});
// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        // Check if Foundry is installed
        if (!checkFoundryInstalled()) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Error: Foundry is not installed. Please install Foundry from https://book.getfoundry.sh/getting-started/installation",
                    },
                ],
            };
        }
        // Type guard for args
        const safeArgs = args || {};
        let result;
        switch (name) {
            // ANVIL COMMANDS
            case "anvil_start": {
                const port = safeArgs.port || 8545;
                const chainId = safeArgs.chain_id || 31337;
                const accounts = safeArgs.accounts || 10;
                let command = `anvil --port ${port} --chain-id ${chainId} --accounts ${accounts}`;
                if (safeArgs.fork_url) {
                    command += ` --fork-url ${safeArgs.fork_url}`;
                }
                result = {
                    message: "Anvil start command (run in background)",
                    command: command,
                    note: "Run this command in a separate terminal: " + command,
                };
                break;
            }
            case "anvil_get_accounts": {
                const rpcUrl = safeArgs.rpc_url || "http://localhost:8545";
                const output = executeCommand(`cast rpc eth_accounts --rpc-url ${rpcUrl}`);
                result = output;
                break;
            }
            // CAST COMMANDS
            case "cast_call": {
                const { contract_address, function_signature, rpc_url = "http://localhost:8545" } = safeArgs;
                const argsStr = safeArgs.args ? safeArgs.args.join(" ") : "";
                const command = `cast call ${contract_address} "${function_signature}" ${argsStr} --rpc-url ${rpc_url}`;
                result = executeCommand(command);
                break;
            }
            case "cast_send": {
                const { contract_address, function_signature, private_key, rpc_url = "http://localhost:8545" } = safeArgs;
                const argsStr = safeArgs.args ? safeArgs.args.join(" ") : "";
                const command = `cast send ${contract_address} "${function_signature}" ${argsStr} --private-key ${private_key} --rpc-url ${rpc_url}`;
                result = executeCommand(command);
                break;
            }
            case "cast_balance": {
                const { address, rpc_url = "http://localhost:8545", ether = false } = safeArgs;
                const etherFlag = ether ? "--ether" : "";
                const command = `cast balance ${address} ${etherFlag} --rpc-url ${rpc_url}`;
                result = executeCommand(command);
                break;
            }
            case "cast_block_number": {
                const rpcUrl = safeArgs.rpc_url || "http://localhost:8545";
                result = executeCommand(`cast block-number --rpc-url ${rpcUrl}`);
                break;
            }
            case "cast_chain_id": {
                const rpcUrl = safeArgs.rpc_url || "http://localhost:8545";
                result = executeCommand(`cast chain-id --rpc-url ${rpcUrl}`);
                break;
            }
            // FORGE COMMANDS
            case "forge_build": {
                const projectPath = safeArgs.project_path || ".";
                let command = `forge build`;
                if (safeArgs.optimizer_runs) {
                    command += ` --optimizer-runs ${safeArgs.optimizer_runs}`;
                }
                result = executeCommand(`cd "${projectPath}" && ${command}`);
                break;
            }
            case "forge_test": {
                const projectPath = safeArgs.project_path || ".";
                let command = `forge test`;
                if (safeArgs.test_pattern) {
                    command += ` --match-test ${safeArgs.test_pattern}`;
                }
                if (safeArgs.verbosity) {
                    command += ` ${safeArgs.verbosity}`;
                }
                if (safeArgs.gas_report) {
                    command += ` --gas-report`;
                }
                result = executeCommand(`cd "${projectPath}" && ${command}`);
                break;
            }
            case "forge_create": {
                const { contract_path, private_key, rpc_url = "http://localhost:8545" } = safeArgs;
                const constructorArgs = safeArgs.constructor_args ? `--constructor-args ${safeArgs.constructor_args.join(" ")}` : "";
                const verifyFlag = safeArgs.verify ? "--verify" : "";
                const command = `forge create ${contract_path} --private-key ${private_key} --rpc-url ${rpc_url} ${constructorArgs} ${verifyFlag}`;
                result = executeCommand(command);
                break;
            }
            case "forge_script": {
                const { script_path, signature = "run()", rpc_url = "http://localhost:8545" } = safeArgs;
                let command = `forge script ${script_path} --sig "${signature}" --rpc-url ${rpc_url}`;
                if (safeArgs.private_key) {
                    command += ` --private-key ${safeArgs.private_key}`;
                }
                if (safeArgs.broadcast) {
                    command += ` --broadcast`;
                }
                result = executeCommand(command);
                break;
            }
            case "forge_verify_contract": {
                const { contract_address, contract_path, etherscan_api_key, chain } = safeArgs;
                const constructorArgs = safeArgs.constructor_args ? `--constructor-args ${safeArgs.constructor_args.join(" ")}` : "";
                let command = `forge verify-contract ${contract_address} ${contract_path} --etherscan-api-key ${etherscan_api_key}`;
                if (chain) {
                    command += ` --chain ${chain}`;
                }
                if (constructorArgs) {
                    command += ` ${constructorArgs}`;
                }
                result = executeCommand(command);
                break;
            }
            case "forge_inspect": {
                const { contract_path, field, project_path = "." } = safeArgs;
                const command = `forge inspect ${contract_path} ${field}`;
                result = executeCommand(`cd "${project_path}" && ${command}`);
                break;
            }
            case "forge_clean": {
                const projectPath = safeArgs.project_path || ".";
                result = executeCommand(`cd "${projectPath}" && forge clean`);
                break;
            }
            // PROJECT TOOLS
            case "get_contract_abi": {
                const { contract_name, project_path = "." } = safeArgs;
                const abiPath = join(project_path, "out", contract_name + ".sol", contract_name + ".json");
                if (!existsSync(abiPath)) {
                    result = {
                        error: `ABI file not found at ${abiPath}. Make sure the contract is compiled (run forge build first).`,
                    };
                }
                else {
                    const artifact = JSON.parse(readFileSync(abiPath, "utf-8"));
                    result = { abi: artifact.abi };
                }
                break;
            }
            case "get_deployment_info": {
                const { script_name, chain_id = "31337", project_path = "." } = safeArgs;
                const broadcastPath = join(project_path, "broadcast", script_name, chain_id, "run-latest.json");
                if (!existsSync(broadcastPath)) {
                    result = {
                        error: `Deployment info not found at ${broadcastPath}. Make sure you've run the deployment script with --broadcast.`,
                    };
                }
                else {
                    const deploymentData = JSON.parse(readFileSync(broadcastPath, "utf-8"));
                    result = { deployment: deploymentData };
                }
                break;
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error executing ${name}: ${error.message}`,
                },
            ],
            isError: true,
        };
    }
});
// Start server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Foundry MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map