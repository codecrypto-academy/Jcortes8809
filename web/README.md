# Supply Chain Tracker - Frontend DApp

Decentralized application for blockchain-based supply chain management and traceability.

## 🎯 Overview

This is a complete Next.js 15 frontend application that integrates with the SupplyChain smart contract deployed on blockchain. It provides a modern, responsive, and intuitive interface for managing tokenized supply chain traceability.

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Blockchain**: Ethers.js v6
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui (Radix UI)
- **State Management**: React Context + localStorage

## ✨ Features

### 🔐 Authentication & Authorization
- MetaMask wallet connection
- Persistent session with auto-reconnect
- Role-based access control (Producer, Factory, Retailer, Consumer)
- Admin panel for user management

### 📦 Token Management
- Create tokens with custom metadata
- Parent-child token relationships for traceability
- Balance tracking per user
- Complete token history and origin tracking

### 🔄 Transfer System
- Two-step transfer process (request + accept/reject)
- Role-based transfer flow validation:
  - Producer → Factory
  - Factory → Retailer
  - Retailer → Consumer
- Real-time transfer status tracking
- Pending transfers inbox

### 🔍 Supply Chain Traceability
- Complete product history visualization
- Origin tracking from raw material to final product
- Certifications and quality metadata
- Interactive traceability tree

### 👨‍💼 Admin Features
- User registration approval/rejection
- Status management (approve, reject, cancel)
- System-wide statistics

## 📁 Project Structure

```
web/
├── app/                          # Next.js pages (App Router)
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing page (login/register)
│   ├── dashboard/               # Role-based dashboard
│   ├── tokens/                  # Token management
│   │   ├── page.tsx            # Token list
│   │   ├── create/             # Create token
│   │   └── [id]/               # Token detail & transfer
│   ├── transfers/               # Transfer management
│   ├── admin/                   # Admin panel
│   └── profile/                 # User profile
├── components/
│   ├── ui/                      # Shadcn/ui components
│   ├── Header.tsx               # Navigation
│   ├── ConnectButton.tsx        # Wallet connection
│   ├── TokenCard.tsx            # Token display
│   └── TransferCard.tsx         # Transfer display
├── contexts/
│   └── Web3Context.tsx          # Global Web3 state
├── lib/
│   ├── web3.ts                  # Web3Service class
│   ├── utils.ts                 # Utilities
│   └── constants.ts             # Constants
├── contracts/
│   ├── abi.json                 # Smart contract ABI
│   └── config.ts                # Contract configuration
└── types/
    └── index.ts                 # TypeScript definitions
```

## 🚀 Getting Started

### Prerequisites

1. **Node.js** >= 18.x
2. **MetaMask** browser extension
3. **Anvil** (Foundry) running locally
4. **Smart Contract** deployed on Anvil

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**

The `.env.local` file is already configured with default values:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_ADMIN_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
NEXT_PUBLIC_RPC_URL=http://localhost:8545
```

**Important:** Update `NEXT_PUBLIC_CONTRACT_ADDRESS` with your actual deployed contract address.

3. **Start the development server:**
```bash
npm run dev
```

4. **Open your browser:**
```
http://localhost:3000
```

## 🔧 Configuration

### Smart Contract Setup

Before running the frontend, ensure:

1. **Anvil is running:**
```bash
anvil
```

2. **Smart contract is deployed:**
```bash
cd ../sc
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
```

3. **Update contract address in `.env.local`** with the deployed address.

### MetaMask Configuration

1. **Add Anvil Local Network to MetaMask:**
   - Network Name: Anvil Local
   - RPC URL: http://localhost:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

2. **Import test accounts:**
   - Use the private keys provided by Anvil
   - First account (0xf39F...) is the admin by default

## 👥 User Roles & Flow

### Producer 👨‍🌾
- Creates raw materials (parentId = 0)
- Transfers to Factories only
- Examples: Wheat, Cotton, Wood

### Factory 🏭
- Receives raw materials from Producers
- Creates products (must have parent token)
- Transfers to Retailers only
- Examples: Flour from Wheat, Fabric from Cotton

### Retailer 🏪
- Receives products from Factories
- Creates retail packages if needed
- Transfers to Consumers only
- Examples: Packaged products

### Consumer 🛒
- Receives products from Retailers
- Views complete traceability
- Cannot create or transfer tokens
- End of the supply chain

### Admin 👑
- Approves/rejects user registrations
- Manages user status
- System-wide oversight

## 🎮 Usage Guide

### 1. Connect Wallet

1. Click "Connect Wallet" button
2. Approve MetaMask connection
3. Ensure you're on Anvil Local network

### 2. Register as User

1. Select your role (Producer, Factory, Retailer, Consumer)
2. Submit registration request
3. Wait for admin approval

### 3. Admin Approval (Admin Only)

1. Switch to admin account in MetaMask (0xf39F...)
2. Navigate to Admin → Users
3. Enter user address to lookup
4. Approve or reject registration

### 4. Create Token

**For Producer:**
```
1. Go to Dashboard → Create Raw Material
2. Enter token name (e.g., "Organic Wheat")
3. Set total supply (e.g., 1000)
4. Add description and origin
5. Add certifications (optional)
6. Submit transaction
```

**For Factory/Retailer:**
```
1. Ensure you have received tokens first
2. Go to Dashboard → Create Product
3. Select parent token from dropdown
4. Enter product details
5. Submit transaction
```

### 5. Transfer Token

```
1. Go to Tokens → Select token → Transfer
2. Enter recipient address (0x...)
3. System validates:
   - Recipient is registered and approved
   - Recipient has correct role for transfer flow
   - You have sufficient balance
4. Enter amount to transfer
5. Submit transaction
```

### 6. Accept/Reject Transfer

```
1. Go to Transfers → Pending tab
2. Review transfer details
3. Click "Accept" or "Reject"
4. Confirm transaction in MetaMask
```

### 7. View Traceability

```
1. Go to any token detail page
2. Scroll to "Supply Chain Traceability" section
3. View complete history from origin to current state
4. Click on parent tokens to navigate up the chain
```

## 🐛 Troubleshooting

### "MetaMask not found"
**Solution:** Install MetaMask browser extension

### "Wrong network"
**Solution:** Switch to Anvil Local (Chain ID: 31337)

### "User not approved"
**Solution:** Wait for admin approval or contact admin

### "Invalid transfer flow"
**Solution:** Check recipient role matches your allowed transfer targets

### "Insufficient balance"
**Solution:** Ensure you have enough token balance to transfer

### "Transaction failed"
**Solution:**
- Check MetaMask has enough ETH for gas
- Ensure contract address is correct
- Verify Anvil is running

## 🔒 Security Features

- ✅ Client-side validation before blockchain calls
- ✅ Role-based access control
- ✅ Transfer flow enforcement
- ✅ Address validation (checksum format)
- ✅ Balance verification
- ✅ Two-step transfer process
- ✅ Admin privilege verification

## 🎨 UI/UX Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode support
- ✅ Loading states
- ✅ Error handling with toast notifications
- ✅ Success feedback
- ✅ Intuitive navigation

## 📦 Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🧪 Testing Checklist

### Complete Flow Test:

1. **Setup (Admin):**
   - [ ] Connect with admin account (0xf39F...)
   - [ ] Admin is recognized automatically

2. **Producer Flow:**
   - [ ] Register as Producer
   - [ ] Admin approves Producer
   - [ ] Create raw material token (Wheat)
   - [ ] View token details and traceability
   - [ ] Transfer to Factory

3. **Factory Flow:**
   - [ ] Register as Factory
   - [ ] Admin approves Factory
   - [ ] Accept transfer from Producer
   - [ ] Create product token with parent (Flour from Wheat)
   - [ ] Transfer to Retailer

4. **Retailer Flow:**
   - [ ] Register as Retailer
   - [ ] Admin approves Retailer
   - [ ] Accept transfer from Factory
   - [ ] Transfer to Consumer

5. **Consumer Flow:**
   - [ ] Register as Consumer
   - [ ] Admin approves Consumer
   - [ ] Accept transfer from Retailer
   - [ ] View complete traceability chain

## 📄 License

MIT

---

**Built with ❤️ using Next.js, TypeScript, and Ethereum**
