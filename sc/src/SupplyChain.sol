// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SupplyChain
 * @author Supply Chain Tracker Team
 * @notice Contrato para gestión de trazabilidad en cadena de suministro
 * @dev Implementa sistema de roles, tokenización y transferencias controladas
 */
contract SupplyChain {
    // ========== CUSTOM ERRORS ==========
    error Unauthorized();
    error InvalidRole();
    error InsufficientBalance();
    error InvalidTransferFlow();
    error TransferAlreadyProcessed();
    error UserAlreadyRegistered();
    error UserNotFound();
    error InvalidStatus();
    error CannotChangeOwnStatus();
    error TokenNotFound();
    error InvalidAmount();
    error TransferNotFound();
    error NotTransferRecipient();
    error InvalidParentToken();
    error ConsumerCannotCreateTokens();
    error RetailerCannotCreateTokens();
    error ProducerMustCreateRawMaterial();
    error FactoryNeedsParent();
    error ParentArraysMismatch();
    error SelfTransferNotAllowed();
    error RecipientNotApproved();
    error UserNotApproved();
    error FactoryCanOnlyTransferOwnTokens();

    // ========== ENUMS ==========
    enum UserStatus {
        Pending,    // Usuario registrado esperando aprobación
        Approved,   // Usuario aprobado para operar
        Rejected,   // Solicitud rechazada por admin
        Canceled    // Usuario cancelado por el sistema
    }

    enum TransferStatus {
        Pending,    // Transferencia iniciada, esperando aceptación
        Accepted,   // Transferencia aceptada y completada
        Rejected    // Transferencia rechazada por el destinatario
    }

    // ========== STRUCTS ==========
    struct User {
        uint256 id;              // ID único del usuario
        address userAddress;     // Dirección wallet del usuario
        string role;             // Rol: "Producer", "Factory", "Retailer", "Consumer"
        UserStatus status;       // Estado actual del usuario
    }

    struct Token {
        uint256 id;              // ID único del token
        address creator;         // Creador del token
        string name;             // Nombre del producto/materia prima
        uint256 totalSupply;     // Cantidad total creada
        string features;         // Metadatos JSON con características
        uint256[] parentIds;     // IDs de tokens padre (vacío si es materia prima)
        uint256[] parentAmounts; // Cantidades consumidas de cada padre
        uint256 dateCreated;     // Timestamp de creación
        mapping(address => uint256) balance;  // Balance por usuario
    }

    struct Transfer {
        uint256 id;              // ID único de transferencia
        address from;            // Remitente
        address to;              // Destinatario
        uint256 tokenId;         // Token a transferir
        uint256 dateCreated;     // Timestamp de creación
        uint256 amount;          // Cantidad a transferir
        TransferStatus status;   // Estado de la transferencia
    }

    // ========== STATE VARIABLES ==========
    address public admin;

    // Contadores para IDs autoincrementales
    uint256 public nextTokenId = 1;
    uint256 public nextTransferId = 1;
    uint256 public nextUserId = 1;

    // Mappings principales
    mapping(uint256 => Token) public tokens;
    mapping(uint256 => Transfer) public transfers;
    mapping(uint256 => User) public users;
    mapping(address => uint256) public addressToUserId;

    // Arrays auxiliares para tracking
    uint256[] private allTokenIds;
    uint256[] private allUserIds;
    mapping(address => uint256[]) private userTokenIds;
    mapping(address => uint256[]) private userTransferIds;

    // ========== EVENTS ==========
    event TokenCreated(
        uint256 indexed tokenId,
        address indexed creator,
        string name,
        uint256 totalSupply
    );

    event TransferRequested(
        uint256 indexed transferId,
        address indexed from,
        address indexed to,
        uint256 tokenId,
        uint256 amount
    );

    event TransferAccepted(uint256 indexed transferId);

    event TransferRejected(uint256 indexed transferId);

    event UserRoleRequested(
        address indexed user,
        string role
    );

    event UserStatusChanged(
        address indexed user,
        UserStatus status
    );

    // ========== MODIFIERS ==========
    modifier onlyAdmin() {
        if (msg.sender != admin) revert Unauthorized();
        _;
    }

    modifier onlyApproved() {
        uint256 userId = addressToUserId[msg.sender];
        if (userId == 0 || users[userId].status != UserStatus.Approved) {
            revert UserNotApproved();
        }
        _;
    }

    modifier validRole(string memory role) {
        bytes32 roleHash = keccak256(abi.encodePacked(role));
        if (
            roleHash != keccak256(abi.encodePacked("Producer")) &&
            roleHash != keccak256(abi.encodePacked("Factory")) &&
            roleHash != keccak256(abi.encodePacked("Retailer")) &&
            roleHash != keccak256(abi.encodePacked("Consumer"))
        ) {
            revert InvalidRole();
        }
        _;
    }

    // ========== CONSTRUCTOR ==========
    constructor() {
        admin = msg.sender;

        // Registrar admin como usuario aprobado
        users[nextUserId] = User({
            id: nextUserId,
            userAddress: msg.sender,
            role: "Admin",
            status: UserStatus.Approved
        });

        addressToUserId[msg.sender] = nextUserId;
        allUserIds.push(nextUserId);

        unchecked {
            ++nextUserId;
        }
    }

    // ========== USER MANAGEMENT FUNCTIONS ==========

    /**
     * @notice Solicita un rol de usuario en el sistema
     * @param role El rol solicitado: "Producer", "Factory", "Retailer", o "Consumer"
     */
    function requestUserRole(string memory role) public validRole(role) {
        uint256 existingUserId = addressToUserId[msg.sender];
        
        // Si ya está registrado, solo permite cambiar rol si fue rechazado
        if (existingUserId != 0) {
            if (users[existingUserId].status != UserStatus.Rejected) {
                revert UserAlreadyRegistered();
            }
            // Actualizar rol y resetear estado a Pending
            users[existingUserId].role = role;
            users[existingUserId].status = UserStatus.Pending;
            emit UserRoleRequested(msg.sender, role);
            return;
        }

        // Nuevo registro
        users[nextUserId] = User({
            id: nextUserId,
            userAddress: msg.sender,
            role: role,
            status: UserStatus.Pending
        });

        addressToUserId[msg.sender] = nextUserId;
        allUserIds.push(nextUserId);

        emit UserRoleRequested(msg.sender, role);

        unchecked {
            ++nextUserId;
        }
    }

    /**
     * @notice Cambia el estado de un usuario (solo admin)
     * @param userAddress Dirección del usuario
     * @param newStatus Nuevo estado
     */
    function changeStatusUser(address userAddress, UserStatus newStatus) public onlyAdmin {
        uint256 userId = addressToUserId[userAddress];
        if (userId == 0) revert UserNotFound();
        if (userAddress == admin) revert CannotChangeOwnStatus();

        users[userId].status = newStatus;

        emit UserStatusChanged(userAddress, newStatus);
    }

    /**
     * @notice Obtiene información de un usuario
     * @param userAddress Dirección del usuario
     * @return User struct con toda la información
     */
    function getUserInfo(address userAddress) public view returns (User memory) {
        uint256 userId = addressToUserId[userAddress];
        if (userId == 0) revert UserNotFound();
        return users[userId];
    }

    /**
     * @notice Verifica si una dirección es el admin
     * @param userAddress Dirección a verificar
     * @return true si es admin
     */
    function isAdmin(address userAddress) public view returns (bool) {
        return userAddress == admin;
    }

    /**
     * @notice Obtiene todos los IDs de usuarios registrados
     * @return Array de IDs de usuarios
     */
    function getAllUserIds() public view returns (uint256[] memory) {
        return allUserIds;
    }

    /**
     * @notice Obtiene información de múltiples usuarios
     * @param userIds Array de IDs de usuarios
     * @return Array de structs User
     */
    function getUsersByIds(uint256[] memory userIds) public view returns (User[] memory) {
        User[] memory result = new User[](userIds.length);
        for (uint256 i = 0; i < userIds.length; i++) {
            result[i] = users[userIds[i]];
        }
        return result;
    }

    // ========== TOKEN MANAGEMENT FUNCTIONS ==========

    /**
     * @notice Crea un nuevo token
     * @param name Nombre del producto/materia prima
     * @param totalSupply Cantidad total a crear
     * @param features Metadatos JSON
     * @param parentIds IDs de tokens padre (array vacío para materias primas)
     * @param parentAmounts Cantidades a consumir de cada token padre
     */
    function createToken(
        string memory name,
        uint256 totalSupply,
        string memory features,
        uint256[] memory parentIds,
        uint256[] memory parentAmounts
    ) public onlyApproved {
        if (totalSupply == 0) revert InvalidAmount();
        if (parentIds.length != parentAmounts.length) revert ParentArraysMismatch();

        uint256 userId = addressToUserId[msg.sender];
        string memory role = users[userId].role;
        bytes32 roleHash = keccak256(abi.encodePacked(role));

        // Validaciones según rol
        if (roleHash == keccak256(abi.encodePacked("Consumer"))) {
            revert ConsumerCannotCreateTokens();
        }

        if (roleHash == keccak256(abi.encodePacked("Retailer"))) {
            revert RetailerCannotCreateTokens();
        }

        if (roleHash == keccak256(abi.encodePacked("Producer"))) {
            if (parentIds.length > 0) revert ProducerMustCreateRawMaterial();
        } else if (roleHash == keccak256(abi.encodePacked("Factory"))) {
            if (parentIds.length == 0) revert FactoryNeedsParent();

            // Validar cada parent token
            for (uint256 i = 0; i < parentIds.length; i++) {
                if (tokens[parentIds[i]].id == 0) revert InvalidParentToken();
                if (parentAmounts[i] == 0) revert InvalidAmount();
                if (tokens[parentIds[i]].balance[msg.sender] < parentAmounts[i]) {
                    revert InsufficientBalance();
                }
            }
        }

        // Crear token
        Token storage newToken = tokens[nextTokenId];
        newToken.id = nextTokenId;
        newToken.creator = msg.sender;
        newToken.name = name;
        newToken.totalSupply = totalSupply;
        newToken.features = features;
        newToken.parentIds = parentIds;
        newToken.parentAmounts = parentAmounts;
        newToken.dateCreated = block.timestamp;

        // Asignar balance inicial al creador
        newToken.balance[msg.sender] = totalSupply;

        // Si es Factory, restar del balance de cada parent token
        if (parentIds.length > 0) {
            for (uint256 i = 0; i < parentIds.length; i++) {
                tokens[parentIds[i]].balance[msg.sender] -= parentAmounts[i];
            }
        }

        allTokenIds.push(nextTokenId);
        userTokenIds[msg.sender].push(nextTokenId);

        emit TokenCreated(nextTokenId, msg.sender, name, totalSupply);

        unchecked {
            ++nextTokenId;
        }
    }

    /**
     * @notice Obtiene información de un token (sin mapping de balances)
     * @param tokenId ID del token
     * @return id ID del token
     * @return creator Creador del token
     * @return name Nombre del token
     * @return totalSupply Cantidad total creada
     * @return features Metadatos en formato JSON
     * @return parentIds IDs de tokens padre
     * @return parentAmounts Cantidades consumidas de cada padre
     * @return dateCreated Timestamp de creación
     */
    function getToken(uint256 tokenId) public view returns (
        uint256 id,
        address creator,
        string memory name,
        uint256 totalSupply,
        string memory features,
        uint256[] memory parentIds,
        uint256[] memory parentAmounts,
        uint256 dateCreated
    ) {
        Token storage token = tokens[tokenId];
        if (token.id == 0) revert TokenNotFound();

        return (
            token.id,
            token.creator,
            token.name,
            token.totalSupply,
            token.features,
            token.parentIds,
            token.parentAmounts,
            token.dateCreated
        );
    }

    /**
     * @notice Obtiene el balance de un usuario para un token específico
     * @param tokenId ID del token
     * @param userAddress Dirección del usuario
     * @return Balance del usuario
     */
    function getTokenBalance(uint256 tokenId, address userAddress) public view returns (uint256) {
        if (tokens[tokenId].id == 0) revert TokenNotFound();
        return tokens[tokenId].balance[userAddress];
    }

    /**
     * @notice Obtiene todos los tokens donde el usuario tiene balance > 0
     * @param userAddress Dirección del usuario
     * @return Array de IDs de tokens
     */
    function getUserTokens(address userAddress) public view returns (uint256[] memory) {
        uint256[] memory userTokens = new uint256[](allTokenIds.length);
        uint256 count = 0;

        for (uint256 i = 0; i < allTokenIds.length; i++) {
            uint256 tokenId = allTokenIds[i];
            if (tokens[tokenId].balance[userAddress] > 0) {
                userTokens[count] = tokenId;
                unchecked {
                    ++count;
                }
            }
        }

        // Crear array del tamaño correcto
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = userTokens[i];
        }

        return result;
    }

    // ========== TRANSFER FUNCTIONS ==========

    /**
     * @notice Inicia una transferencia de tokens
     * @param to Destinatario
     * @param tokenId Token a transferir
     * @param amount Cantidad a transferir
     */
    function transfer(address to, uint256 tokenId, uint256 amount) public onlyApproved {
        if (amount == 0) revert InvalidAmount();
        if (to == msg.sender) revert SelfTransferNotAllowed();
        if (tokens[tokenId].id == 0) revert TokenNotFound();
        if (tokens[tokenId].balance[msg.sender] < amount) revert InsufficientBalance();

        uint256 recipientUserId = addressToUserId[to];
        if (recipientUserId == 0 || users[recipientUserId].status != UserStatus.Approved) {
            revert RecipientNotApproved();
        }

        // Validar flujo de roles
        _validateTransferFlow(msg.sender, to);

        // Factory solo puede transferir tokens que ellos mismos crearon (no materias primas recibidas)
        uint256 senderUserId = addressToUserId[msg.sender];
        string memory senderRole = users[senderUserId].role;
        if (keccak256(abi.encodePacked(senderRole)) == keccak256(abi.encodePacked("Factory"))) {
            if (tokens[tokenId].creator != msg.sender) {
                revert FactoryCanOnlyTransferOwnTokens();
            }
        }

        // Crear transferencia
        transfers[nextTransferId] = Transfer({
            id: nextTransferId,
            from: msg.sender,
            to: to,
            tokenId: tokenId,
            dateCreated: block.timestamp,
            amount: amount,
            status: TransferStatus.Pending
        });

        userTransferIds[msg.sender].push(nextTransferId);
        userTransferIds[to].push(nextTransferId);

        emit TransferRequested(nextTransferId, msg.sender, to, tokenId, amount);

        unchecked {
            ++nextTransferId;
        }
    }

    /**
     * @notice Acepta una transferencia pendiente
     * @param transferId ID de la transferencia
     */
    function acceptTransfer(uint256 transferId) public onlyApproved {
        Transfer storage t = transfers[transferId];
        if (t.id == 0) revert TransferNotFound();
        if (t.to != msg.sender) revert NotTransferRecipient();
        if (t.status != TransferStatus.Pending) revert TransferAlreadyProcessed();

        // Verificar balance actual
        if (tokens[t.tokenId].balance[t.from] < t.amount) revert InsufficientBalance();

        // Actualizar estado
        t.status = TransferStatus.Accepted;

        // Actualizar balances
        unchecked {
            tokens[t.tokenId].balance[t.from] -= t.amount;
            tokens[t.tokenId].balance[t.to] += t.amount;
        }

        // Actualizar tracking de tokens del destinatario si es su primer balance
        bool hasToken = false;
        uint256[] storage recipientTokens = userTokenIds[t.to];
        for (uint256 i = 0; i < recipientTokens.length; i++) {
            if (recipientTokens[i] == t.tokenId) {
                hasToken = true;
                break;
            }
        }
        if (!hasToken) {
            userTokenIds[t.to].push(t.tokenId);
        }

        emit TransferAccepted(transferId);
    }

    /**
     * @notice Rechaza una transferencia pendiente
     * @param transferId ID de la transferencia
     */
    function rejectTransfer(uint256 transferId) public onlyApproved {
        Transfer storage t = transfers[transferId];
        if (t.id == 0) revert TransferNotFound();
        if (t.to != msg.sender) revert NotTransferRecipient();
        if (t.status != TransferStatus.Pending) revert TransferAlreadyProcessed();

        t.status = TransferStatus.Rejected;

        emit TransferRejected(transferId);
    }

    /**
     * @notice Obtiene información de una transferencia
     * @param transferId ID de la transferencia
     * @return Transfer struct
     */
    function getTransfer(uint256 transferId) public view returns (Transfer memory) {
        if (transfers[transferId].id == 0) revert TransferNotFound();
        return transfers[transferId];
    }

    /**
     * @notice Obtiene todas las transferencias de un usuario
     * @param userAddress Dirección del usuario
     * @return Array de IDs de transferencias
     */
    function getUserTransfers(address userAddress) public view returns (uint256[] memory) {
        return userTransferIds[userAddress];
    }

    // ========== INTERNAL FUNCTIONS ==========

    /**
     * @dev Valida el flujo de transferencia según roles
     * Producer → Factory
     * Factory → Retailer
     * Retailer → Consumer
     * Consumer NO puede transferir
     */
    function _validateTransferFlow(address from, address to) internal view {
        uint256 fromUserId = addressToUserId[from];
        uint256 toUserId = addressToUserId[to];

        string memory fromRole = users[fromUserId].role;
        string memory toRole = users[toUserId].role;

        bytes32 fromRoleHash = keccak256(abi.encodePacked(fromRole));
        bytes32 toRoleHash = keccak256(abi.encodePacked(toRole));

        bool validFlow = false;

        if (fromRoleHash == keccak256(abi.encodePacked("Producer"))) {
            validFlow = toRoleHash == keccak256(abi.encodePacked("Factory"));
        } else if (fromRoleHash == keccak256(abi.encodePacked("Factory"))) {
            validFlow = toRoleHash == keccak256(abi.encodePacked("Retailer"));
        } else if (fromRoleHash == keccak256(abi.encodePacked("Retailer"))) {
            validFlow = toRoleHash == keccak256(abi.encodePacked("Consumer"));
        }

        if (!validFlow) revert InvalidTransferFlow();
    }
}
