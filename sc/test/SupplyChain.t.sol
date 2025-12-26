// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/SupplyChain.sol";

contract SupplyChainTest is Test {
    SupplyChain public supplyChain;

    // Test accounts
    address admin;
    address producer;
    address factory;
    address retailer;
    address consumer;
    address unauthorized;

    function setUp() public {
        // Create test accounts
        admin = address(this);
        producer = makeAddr("producer");
        factory = makeAddr("factory");
        retailer = makeAddr("retailer");
        consumer = makeAddr("consumer");
        unauthorized = makeAddr("unauthorized");

        // Deploy contract
        supplyChain = new SupplyChain();
    }

    // Helper functions for array creation
    function emptyUintArray() internal pure returns (uint256[] memory) {
        return new uint256[](0);
    }

    function singleUintArray(uint256 value) internal pure returns (uint256[] memory) {
        uint256[] memory arr = new uint256[](1);
        arr[0] = value;
        return arr;
    }

    function doubleUintArray(uint256 val1, uint256 val2) internal pure returns (uint256[] memory) {
        uint256[] memory arr = new uint256[](2);
        arr[0] = val1;
        arr[1] = val2;
        return arr;
    }

    function tripleUintArray(uint256 val1, uint256 val2, uint256 val3) internal pure returns (uint256[] memory) {
        uint256[] memory arr = new uint256[](3);
        arr[0] = val1;
        arr[1] = val2;
        arr[2] = val3;
        return arr;
    }

    // ========== USER REGISTRATION TESTS ==========

    function testUserRegistration() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");

        SupplyChain.User memory user = supplyChain.getUserInfo(producer);
        assertEq(user.userAddress, producer);
        assertEq(user.role, "Producer");
        assertEq(uint8(user.status), uint8(SupplyChain.UserStatus.Pending));
    }

    function testInvalidRole() public {
        vm.prank(producer);
        vm.expectRevert(SupplyChain.InvalidRole.selector);
        supplyChain.requestUserRole("InvalidRole");
    }

    function testDoubleRegistration() public {
        vm.startPrank(producer);
        supplyChain.requestUserRole("Producer");

        vm.expectRevert(SupplyChain.UserAlreadyRegistered.selector);
        supplyChain.requestUserRole("Factory");
        vm.stopPrank();
    }

    function testAdminApproveUser() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");

        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        SupplyChain.User memory user = supplyChain.getUserInfo(producer);
        assertEq(uint8(user.status), uint8(SupplyChain.UserStatus.Approved));
    }

    function testAdminRejectUser() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");

        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Rejected);

        SupplyChain.User memory user = supplyChain.getUserInfo(producer);
        assertEq(uint8(user.status), uint8(SupplyChain.UserStatus.Rejected));
    }

    function testOnlyAdminCanChangeStatus() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");

        vm.prank(unauthorized);
        vm.expectRevert(SupplyChain.Unauthorized.selector);
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
    }

    function testCannotChangeOwnStatus() public {
        vm.expectRevert(SupplyChain.CannotChangeOwnStatus.selector);
        supplyChain.changeStatusUser(admin, SupplyChain.UserStatus.Rejected);
    }

    function testGetUserInfo() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");

        SupplyChain.User memory user = supplyChain.getUserInfo(producer);
        assertEq(user.userAddress, producer);
        assertEq(user.role, "Producer");
        assertTrue(user.id > 0);
    }

    function testGetUserInfoNotFound() public {
        vm.expectRevert(SupplyChain.UserNotFound.selector);
        supplyChain.getUserInfo(unauthorized);
    }

    function testIsAdmin() public {
        assertTrue(supplyChain.isAdmin(admin));
        assertFalse(supplyChain.isAdmin(producer));
    }

    // ========== TOKEN CREATION TESTS ==========

    function testCreateTokenByProducer() public {
        // Register and approve producer
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        // Create raw material
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, '{"origin":"Farm A"}', emptyUintArray(), emptyUintArray());

        (
            uint256 id,
            address creator,
            string memory name,
            uint256 totalSupply,
            string memory features,
            uint256[] memory parentIds,
            uint256[] memory parentAmounts,
            uint256 dateCreated
        ) = supplyChain.getToken(1);

        assertEq(id, 1);
        assertEq(creator, producer);
        assertEq(name, "Wheat");
        assertEq(totalSupply, 1000);
        assertEq(features, '{"origin":"Farm A"}');
        assertEq(parentIds.length, 0);
        assertEq(parentAmounts.length, 0);
        assertGt(dateCreated, 0);

        // Check balance
        assertEq(supplyChain.getTokenBalance(1, producer), 1000);
    }

    function testProducerCannotCreateWithParent() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(producer);
        vm.expectRevert(SupplyChain.ProducerMustCreateRawMaterial.selector);
        supplyChain.createToken("Invalid", 100, "{}", singleUintArray(1), singleUintArray(100));
    }

    function testCreateTokenByFactory() public {
        // Setup producer and factory
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        // Producer creates raw material
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, '{"origin":"Farm"}', emptyUintArray(), emptyUintArray());

        // Transfer to factory
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);

        // Factory accepts
        vm.prank(factory);
        supplyChain.acceptTransfer(1);

        // Factory creates product
        vm.prank(factory);
        supplyChain.createToken("Flour", 400, '{"processed":"Mill"}', singleUintArray(1), singleUintArray(400));

        (, address creator, string memory name, uint256 totalSupply, , uint256[] memory parentIds, , ) = supplyChain.getToken(2);
        assertEq(creator, factory);
        assertEq(name, "Flour");
        assertEq(totalSupply, 400);
        assertEq(parentIds.length, 1);
        assertEq(parentIds[0], 1);
    }

    function testFactoryNeedsParent() public {
        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        vm.expectRevert(SupplyChain.FactoryNeedsParent.selector);
        supplyChain.createToken("Invalid", 100, "{}", emptyUintArray(), emptyUintArray());
    }

    function testConsumerCannotCreateTokens() public {
        vm.prank(consumer);
        supplyChain.requestUserRole("Consumer");
        supplyChain.changeStatusUser(consumer, SupplyChain.UserStatus.Approved);

        vm.prank(consumer);
        vm.expectRevert(SupplyChain.ConsumerCannotCreateTokens.selector);
        supplyChain.createToken("Invalid", 100, "{}", emptyUintArray(), emptyUintArray());
    }

    function testRetailerCannotCreateTokens() public {
        // Setup producer, factory and retailer
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        vm.prank(retailer);
        supplyChain.requestUserRole("Retailer");
        supplyChain.changeStatusUser(retailer, SupplyChain.UserStatus.Approved);

        // Producer creates and transfers to factory
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", emptyUintArray(), emptyUintArray());

        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);

        vm.prank(factory);
        supplyChain.acceptTransfer(1);

        // Factory creates product and transfers to retailer
        vm.prank(factory);
        supplyChain.createToken("Flour", 400, "{}", singleUintArray(1), singleUintArray(400));

        vm.prank(factory);
        supplyChain.transfer(retailer, 2, 300);

        vm.prank(retailer);
        supplyChain.acceptTransfer(2);

        // Retailer tries to create token (should fail)
        vm.prank(retailer);
        vm.expectRevert(SupplyChain.RetailerCannotCreateTokens.selector);
        supplyChain.createToken("Bread", 200, "{}", singleUintArray(2), singleUintArray(200));
    }

    function testFactoryCreateTokenWithMultipleParents() public {
        // Setup
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        // Producer creates multiple raw materials
        vm.startPrank(producer);
        supplyChain.createToken("Wheat", 1000, '{"origin":"Farm A"}', emptyUintArray(), emptyUintArray());
        supplyChain.createToken("Water", 2000, '{"origin":"Well B"}', emptyUintArray(), emptyUintArray());
        supplyChain.createToken("Yeast", 500, '{"origin":"Factory C"}', emptyUintArray(), emptyUintArray());
        vm.stopPrank();

        // Transfer all to factory
        vm.startPrank(producer);
        supplyChain.transfer(factory, 1, 600); // Wheat
        supplyChain.transfer(factory, 2, 400); // Water
        supplyChain.transfer(factory, 3, 50);  // Yeast
        vm.stopPrank();

        // Factory accepts all transfers
        vm.startPrank(factory);
        supplyChain.acceptTransfer(1);
        supplyChain.acceptTransfer(2);
        supplyChain.acceptTransfer(3);
        vm.stopPrank();

        // Verify factory balances
        assertEq(supplyChain.getTokenBalance(1, factory), 600);
        assertEq(supplyChain.getTokenBalance(2, factory), 400);
        assertEq(supplyChain.getTokenBalance(3, factory), 50);

        // Factory creates product using multiple parents
        vm.prank(factory);
        supplyChain.createToken(
            "Bread",
            100,
            '{"recipe":"Artisan Bread"}',
            tripleUintArray(1, 2, 3),
            tripleUintArray(500, 300, 20)
        );

        // Verify product creation
        (
            uint256 id,
            address creator,
            string memory name,
            uint256 totalSupply,
            string memory features,
            uint256[] memory parentIds,
            uint256[] memory parentAmounts,
            uint256 dateCreated
        ) = supplyChain.getToken(4);

        assertEq(id, 4);
        assertEq(creator, factory);
        assertEq(name, "Bread");
        assertEq(totalSupply, 100);
        assertEq(features, '{"recipe":"Artisan Bread"}');
        assertGt(dateCreated, 0);

        // Verify parent arrays
        assertEq(parentIds.length, 3);
        assertEq(parentIds[0], 1); // Wheat
        assertEq(parentIds[1], 2); // Water
        assertEq(parentIds[2], 3); // Yeast

        assertEq(parentAmounts.length, 3);
        assertEq(parentAmounts[0], 500);
        assertEq(parentAmounts[1], 300);
        assertEq(parentAmounts[2], 20);

        // Verify factory balances were reduced
        assertEq(supplyChain.getTokenBalance(1, factory), 100); // 600 - 500
        assertEq(supplyChain.getTokenBalance(2, factory), 100); // 400 - 300
        assertEq(supplyChain.getTokenBalance(3, factory), 30);  // 50 - 20

        // Verify factory has new product
        assertEq(supplyChain.getTokenBalance(4, factory), 100);
    }

    function testCreateTokenZeroSupply() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(producer);
        vm.expectRevert(SupplyChain.InvalidAmount.selector);
        supplyChain.createToken("Invalid", 0, "{}", emptyUintArray(), emptyUintArray());
    }

    function testUnapprovedUserCannotCreateToken() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");

        vm.prank(producer);
        vm.expectRevert(SupplyChain.UserNotApproved.selector);
        supplyChain.createToken("Invalid", 100, "{}", emptyUintArray(), emptyUintArray());
    }

    function testGetTokenNotFound() public {
        vm.expectRevert(SupplyChain.TokenNotFound.selector);
        supplyChain.getToken(999);
    }

    function testGetUserTokens() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.startPrank(producer);
        supplyChain.createToken("Token1", 100, "{}", emptyUintArray(), emptyUintArray());
        supplyChain.createToken("Token2", 200, "{}", emptyUintArray(), emptyUintArray());
        vm.stopPrank();

        uint256[] memory tokens = supplyChain.getUserTokens(producer);
        assertEq(tokens.length, 2);
        assertEq(tokens[0], 1);
        assertEq(tokens[1], 2);
    }

    // ========== TRANSFER TESTS ==========

    function testTransferFromProducerToFactory() public {
        // Setup
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", emptyUintArray(), emptyUintArray());

        // Transfer
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);

        SupplyChain.Transfer memory t = supplyChain.getTransfer(1);
        assertEq(t.from, producer);
        assertEq(t.to, factory);
        assertEq(t.tokenId, 1);
        assertEq(t.amount, 500);
        assertEq(uint8(t.status), uint8(SupplyChain.TransferStatus.Pending));
    }

    function testInvalidRoleTransfer() public {
        // Setup producer and consumer
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(consumer);
        supplyChain.requestUserRole("Consumer");
        supplyChain.changeStatusUser(consumer, SupplyChain.UserStatus.Approved);

        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", emptyUintArray(), emptyUintArray());

        // Try invalid transfer (Producer -> Consumer)
        vm.prank(producer);
        vm.expectRevert(SupplyChain.InvalidTransferFlow.selector);
        supplyChain.transfer(consumer, 1, 500);
    }

    function testTransferInsufficientBalance() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        vm.prank(producer);
        supplyChain.createToken("Wheat", 100, "{}", emptyUintArray(), emptyUintArray());

        vm.prank(producer);
        vm.expectRevert(SupplyChain.InsufficientBalance.selector);
        supplyChain.transfer(factory, 1, 200);
    }

    function testTransferZeroAmount() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        vm.prank(producer);
        supplyChain.createToken("Wheat", 100, "{}", emptyUintArray(), emptyUintArray());

        vm.prank(producer);
        vm.expectRevert(SupplyChain.InvalidAmount.selector);
        supplyChain.transfer(factory, 1, 0);
    }

    function testSelfTransferNotAllowed() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(producer);
        supplyChain.createToken("Wheat", 100, "{}", emptyUintArray(), emptyUintArray());

        vm.prank(producer);
        vm.expectRevert(SupplyChain.SelfTransferNotAllowed.selector);
        supplyChain.transfer(producer, 1, 50);
    }

    function testTransferToUnapprovedUser() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        // Don't approve factory

        vm.prank(producer);
        supplyChain.createToken("Wheat", 100, "{}", emptyUintArray(), emptyUintArray());

        vm.prank(producer);
        vm.expectRevert(SupplyChain.RecipientNotApproved.selector);
        supplyChain.transfer(factory, 1, 50);
    }

    function testAcceptTransfer() public {
        // Setup
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", emptyUintArray(), emptyUintArray());

        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);

        uint256 balanceBefore = supplyChain.getTokenBalance(1, producer);

        // Accept transfer
        vm.prank(factory);
        supplyChain.acceptTransfer(1);

        // Verify balances updated
        assertEq(supplyChain.getTokenBalance(1, producer), balanceBefore - 500);
        assertEq(supplyChain.getTokenBalance(1, factory), 500);

        // Verify transfer status
        SupplyChain.Transfer memory t = supplyChain.getTransfer(1);
        assertEq(uint8(t.status), uint8(SupplyChain.TransferStatus.Accepted));
    }

    function testRejectTransfer() public {
        // Setup
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", emptyUintArray(), emptyUintArray());

        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);

        // Reject transfer
        vm.prank(factory);
        supplyChain.rejectTransfer(1);

        // Verify status
        SupplyChain.Transfer memory t = supplyChain.getTransfer(1);
        assertEq(uint8(t.status), uint8(SupplyChain.TransferStatus.Rejected));

        // Verify balances unchanged
        assertEq(supplyChain.getTokenBalance(1, producer), 1000);
        assertEq(supplyChain.getTokenBalance(1, factory), 0);
    }

    function testOnlyRecipientCanAccept() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", emptyUintArray(), emptyUintArray());

        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);

        // Try to accept from wrong account
        vm.prank(producer);
        vm.expectRevert(SupplyChain.NotTransferRecipient.selector);
        supplyChain.acceptTransfer(1);
    }

    function testCannotAcceptTwice() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", emptyUintArray(), emptyUintArray());

        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);

        vm.prank(factory);
        supplyChain.acceptTransfer(1);

        // Try to accept again
        vm.prank(factory);
        vm.expectRevert(SupplyChain.TransferAlreadyProcessed.selector);
        supplyChain.acceptTransfer(1);
    }

    function testGetUserTransfers() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", emptyUintArray(), emptyUintArray());

        vm.startPrank(producer);
        supplyChain.transfer(factory, 1, 300);
        supplyChain.transfer(factory, 1, 200);
        vm.stopPrank();

        uint256[] memory producerTransfers = supplyChain.getUserTransfers(producer);
        assertEq(producerTransfers.length, 2);

        uint256[] memory factoryTransfers = supplyChain.getUserTransfers(factory);
        assertEq(factoryTransfers.length, 2);
    }

    // ========== COMPLETE FLOW TESTS ==========

    function testCompleteSupplyChainFlow() public {
        // 1. Register all users
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        vm.prank(retailer);
        supplyChain.requestUserRole("Retailer");
        supplyChain.changeStatusUser(retailer, SupplyChain.UserStatus.Approved);

        vm.prank(consumer);
        supplyChain.requestUserRole("Consumer");
        supplyChain.changeStatusUser(consumer, SupplyChain.UserStatus.Approved);

        // 2. Producer creates raw material
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, '{"origin":"Farm A"}', emptyUintArray(), emptyUintArray());

        // 3. Producer -> Factory
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 800);

        vm.prank(factory);
        supplyChain.acceptTransfer(1);

        assertEq(supplyChain.getTokenBalance(1, factory), 800);

        // 4. Factory creates finished product
        vm.prank(factory);
        supplyChain.createToken("Flour", 600, '{"processed":"Mill B"}', singleUintArray(1), singleUintArray(400));

        // 5. Factory -> Retailer
        vm.prank(factory);
        supplyChain.transfer(retailer, 2, 500);

        vm.prank(retailer);
        supplyChain.acceptTransfer(2);

        assertEq(supplyChain.getTokenBalance(2, retailer), 500);

        // 6. Retailer -> Consumer
        vm.prank(retailer);
        supplyChain.transfer(consumer, 2, 100);

        vm.prank(consumer);
        supplyChain.acceptTransfer(3);

        assertEq(supplyChain.getTokenBalance(2, consumer), 100);

        // Verify traceability
        uint256[] memory consumerTokens = supplyChain.getUserTokens(consumer);
        assertEq(consumerTokens.length, 1);

        (, , , , , uint256[] memory parentIds, , ) = supplyChain.getToken(consumerTokens[0]);
        assertEq(parentIds.length, 1);
        assertEq(parentIds[0], 1); // Traces back to wheat
    }

    function testConsumerCannotTransfer() public {
        // Setup complete chain
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        vm.prank(retailer);
        supplyChain.requestUserRole("Retailer");
        supplyChain.changeStatusUser(retailer, SupplyChain.UserStatus.Approved);

        vm.prank(consumer);
        supplyChain.requestUserRole("Consumer");
        supplyChain.changeStatusUser(consumer, SupplyChain.UserStatus.Approved);

        // Get product to consumer
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", emptyUintArray(), emptyUintArray());

        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);

        vm.prank(factory);
        supplyChain.acceptTransfer(1);

        vm.prank(factory);
        supplyChain.createToken("Flour", 400, "{}", singleUintArray(1), singleUintArray(400));

        vm.prank(factory);
        supplyChain.transfer(retailer, 2, 300);

        vm.prank(retailer);
        supplyChain.acceptTransfer(2);

        vm.prank(retailer);
        supplyChain.transfer(consumer, 2, 100);

        vm.prank(consumer);
        supplyChain.acceptTransfer(3);

        // Try to transfer from consumer (should fail to anyone)
        address someone = makeAddr("someone");
        vm.prank(someone);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(someone, SupplyChain.UserStatus.Approved);

        vm.prank(consumer);
        vm.expectRevert(SupplyChain.InvalidTransferFlow.selector);
        supplyChain.transfer(someone, 2, 50);
    }

    function testMultipleTokensAndTransfers() public {
        // Setup users
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        // Create multiple tokens
        vm.startPrank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", emptyUintArray(), emptyUintArray());
        supplyChain.createToken("Corn", 2000, "{}", emptyUintArray(), emptyUintArray());
        supplyChain.createToken("Barley", 1500, "{}", emptyUintArray(), emptyUintArray());
        vm.stopPrank();

        // Multiple transfers
        vm.startPrank(producer);
        supplyChain.transfer(factory, 1, 300);
        supplyChain.transfer(factory, 2, 500);
        supplyChain.transfer(factory, 3, 400);
        vm.stopPrank();

        uint256[] memory producerTokens = supplyChain.getUserTokens(producer);
        assertEq(producerTokens.length, 3);

        uint256[] memory producerTransfers = supplyChain.getUserTransfers(producer);
        assertEq(producerTransfers.length, 3);
    }

    // ========== GAS OPTIMIZATION VERIFICATION ==========

    function testGasCreateToken() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(producer);
        uint256 gasBefore = gasleft();
        supplyChain.createToken("Wheat", 1000, '{"origin":"Farm"}', emptyUintArray(), emptyUintArray());
        uint256 gasUsed = gasBefore - gasleft();

        emit log_named_uint("Gas used for createToken", gasUsed);
    }

    function testGasAcceptTransfer() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        supplyChain.changeStatusUser(factory, SupplyChain.UserStatus.Approved);

        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", emptyUintArray(), emptyUintArray());

        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);

        vm.prank(factory);
        uint256 gasBefore = gasleft();
        supplyChain.acceptTransfer(1);
        uint256 gasUsed = gasBefore - gasleft();

        emit log_named_uint("Gas used for acceptTransfer", gasUsed);
    }
}
