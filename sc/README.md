# SupplyChain Smart Contract

A gas-optimized Solidity smart contract for managing supply chain traceability with tokenization, role-based access control, and controlled transfers between actors.

## 🚀 Quick Start

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)

### Installation

```bash
# Install dependencies
forge install

# Compile contracts
forge build

# Run tests
forge test

# Run tests with gas report
forge test --gas-report
```

### Local Deployment

```bash
# Terminal 1: Start local blockchain
anvil

# Terminal 2: Deploy contract
forge script script/Deploy.s.sol \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast
```

## 📋 Features

- ✅ **Role-Based Access Control**: 5 distinct roles (Admin, Producer, Factory, Retailer, Consumer)
- ✅ **Token System**: Custom tokenization for products and raw materials
- ✅ **Controlled Transfers**: Strict flow enforcement (Producer → Factory → Retailer → Consumer)
- ✅ **Two-Step Transfers**: Recipients must accept transfers
- ✅ **Full Traceability**: Track products from origin to consumer via parent tokens
- ✅ **Gas Optimized**: Custom errors, unchecked math, efficient storage
- ✅ **Comprehensive Tests**: 35 tests, 100% passing

## 🏗️ Architecture

### Roles

1. **Admin** - Contract deployer, approves users
2. **Producer** - Creates raw materials, transfers to Factory
3. **Factory** - Creates products from materials, transfers to Retailer
4. **Retailer** - Distributes to Consumers
5. **Consumer** - Final recipient, can view traceability

### Transfer Flow

```
Producer → Factory → Retailer → Consumer
   ↓          ↓         ↓          ↓
Raw Mat.   Products  Products   Final
```

## 📊 Contract Interface

### User Management

```solidity
function requestUserRole(string memory role) external;
function changeStatusUser(address userAddress, UserStatus newStatus) external;
function getUserInfo(address userAddress) external view returns (User memory);
function isAdmin(address userAddress) external view returns (bool);
```

### Token Management

```solidity
function createToken(
    string memory name,
    uint256 totalSupply,
    string memory features,
    uint256 parentId
) external;

function getToken(uint256 tokenId) external view returns (
    uint256 id,
    address creator,
    string memory name,
    uint256 totalSupply,
    string memory features,
    uint256 parentId,
    uint256 dateCreated
);

function getTokenBalance(uint256 tokenId, address userAddress) external view returns (uint256);
function getUserTokens(address userAddress) external view returns (uint256[] memory);
```

### Transfer Management

```solidity
function transfer(address to, uint256 tokenId, uint256 amount) external;
function acceptTransfer(uint256 transferId) external;
function rejectTransfer(uint256 transferId) external;
function getTransfer(uint256 transferId) external view returns (Transfer memory);
function getUserTransfers(address userAddress) external view returns (uint256[] memory);
```

## 🧪 Testing

### Run All Tests

```bash
forge test
```

### Run Specific Test

```bash
forge test --match-test testCompleteSupplyChainFlow -vvv
```

### Generate Coverage Report

```bash
forge coverage
```

### Gas Report

```bash
forge test --gas-report
```

## 📈 Gas Costs (Average)

| Function | Average Gas |
|----------|-------------|
| createToken | 239,162 |
| transfer | 207,458 |
| acceptTransfer | 116,375 |
| requestUserRole | 118,210 |
| changeStatusUser | 49,171 |
| rejectTransfer | 53,693 |

## 💡 Usage Examples

### 1. Register as Producer

```solidity
// User registers
supplyChain.requestUserRole("Producer");

// Admin approves
supplyChain.changeStatusUser(userAddress, UserStatus.Approved);
```

### 2. Create Raw Material

```solidity
supplyChain.createToken(
    "Wheat",
    1000,
    '{"origin":"Farm A","organic":true}',
    0  // parentId = 0 for raw materials
);
```

### 3. Transfer to Factory

```solidity
// Producer initiates transfer
supplyChain.transfer(factoryAddress, tokenId, 500);

// Factory accepts
supplyChain.acceptTransfer(transferId);
```

### 4. Create Finished Product

```solidity
// Factory creates product from raw material
supplyChain.createToken(
    "Flour",
    400,
    '{"processed":"Mill B","grade":"A"}',
    1  // parentId references the Wheat token
);
```

### 5. Query Traceability

```solidity
// Get user's tokens
uint256[] memory tokens = supplyChain.getUserTokens(userAddress);

// Get token details
(uint256 id, address creator, string memory name, , , uint256 parentId, )
    = supplyChain.getToken(tokenId);

// Trace to parent
if (parentId > 0) {
    getToken(parentId); // Get raw material details
}
```

## 🔒 Security Features

- **Role Validation**: Enforces correct actor flow
- **Status Checks**: Only approved users can operate
- **Balance Verification**: Checked before and during transfers
- **Two-Step Transfers**: Prevents unwanted token delivery
- **Admin Protection**: Admin cannot change own status
- **Custom Errors**: Gas-efficient error handling

## 🎯 Design Decisions

### Why Custom Token Model?

- Support for product parentage (parent-child relationships)
- Supply chain specific metadata
- Controlled transfer flow unique to supply chains
- Not bound by ERC-20/ERC-721 constraints

### Why Two-Step Transfers?

- Recipient consent required
- Allows quality verification
- Creates complete audit trail
- Prevents token spam

## 📚 Project Structure

```
sc/
├── src/
│   └── SupplyChain.sol          # Main contract
├── test/
│   └── SupplyChain.t.sol        # Test suite (35 tests)
├── script/
│   └── Deploy.s.sol             # Deployment script
├── foundry.toml                 # Foundry configuration
├── README.md                    # This file
└── IMPLEMENTATION_NOTES.md      # Detailed implementation notes
```

## 🐛 Known Limitations

1. No partial transfer fills
2. No sender cancellation of pending transfers
3. Not compatible with ERC-20/ERC-721 standards
4. No pause/emergency stop mechanism
5. Non-upgradeable (immutable)

## 🔮 Future Enhancements

- Batch operations (create/transfer multiple tokens)
- Transfer cancellation by sender
- Token metadata URIs
- Product expiration dates
- Quality rating system
- Multi-admin support
- Pausable functionality
- Upgradeable proxy pattern

## 📄 License

MIT

## 🤝 Contributing

This is an educational project for learning blockchain development.

## 📞 Support

For issues or questions, please refer to the project README.md in the root directory.

---

**Version**: 1.0.0
**Solidity**: ^0.8.19
**Framework**: Foundry
