/*
 * Simplified lottery contract
 * which is modified PoolTogether
 *
 */
pragma solidity ^0.5.16;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Roles.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./compound/ICErc20.sol";
import "./DrawLib.sol";

contract BasePool is ReentrancyGuard {

    using SafeMath for uint256;
    using Roles for Roles.Role;
    using DrawLib for DrawLib.DrawTree;

    DrawLib.DrawTree drawTree;

    struct Draw {
        uint256 openedBlock;
        bytes32 secretHash;
        bytes32 entropy; // 난수 seed
        address winner; // 당첨자
        uint256 netWinnings; // 상금
    }

    mapping(uint256 => Draw) internal draws;

    uint256 public accountedBalance;
    mapping (address => uint256) internal balances;

    uint256 drawIndex;
    ICErc20 public cToken;

    Roles.Role internal admins; // 관리자 role 을 만든다.

    event Opened(uint256 indexed drawId, bytes32 secretHash);
    event Deposited(address indexed sender, uint256 amount);
    event Rewarded(uint256 indexed drawId, address indexed winner, bytes32 entropy, uint256 netWinnings);
    event RewardFailed(uint256 indexed drawId);
    event Withdrawn(address indexed sender, uint256 amount);

    constructor(address _cToken) public {

        require(_cToken != address(0), "cToken address is required");
        cToken = ICErc20(_cToken);
        _addAdmin(msg.sender);
    }


    function openDraw(bytes32 _secretHash) public onlyAdmin {

        require(currentOpenDrawId() == 0, "There is an open draw already");

        drawTree.open();

        draws[drawTree.drawId] = Draw(
            block.number,
            _secretHash,
            bytes32(0),
            address(0),
            uint256(0)
        );

        emit Opened(drawTree.drawId, _secretHash);
    }


    function buyTicket(uint256 _amount) public requireOpenDraw nonReentrant {
        // Transfer the tokens into this contract
        require(token().transferFrom(msg.sender, address(this), _amount), "Transfer DAI failed");
        addTreeNode(msg.sender, _amount);

        _depositFrom(msg.sender, _amount);
        emit Deposited(msg.sender, _amount);
    }

    function _depositFrom(address _sender, uint256 _amount) internal {

        // Update the user's balance
        balances[_sender] = balances[_sender].add(_amount);

        // Update the total of this contract
        accountedBalance = accountedBalance.add(_amount);

        // Deposit into Compound
        require(token().approve(address(cToken), _amount), "Failed to approve sending token");
        require(cToken.mint(_amount) == 0, "Failed to mint cToken"); // 0 = success
    }

    function addTreeNode(address _sender, uint256 _amount) public requireOpenDraw onlyNonZero(_sender) {

        bytes32 userId = bytes32(uint256(_sender));
        bytes32 openDrawId = bytes32(currentOpenDrawId());

        uint256 currentAmount = drawTree.getDepositBalance(openDrawId, userId);
        currentAmount = currentAmount.add(_amount);
        drawTree.drawSet(openDrawId, currentAmount, userId);
    }

    function withdrawDepositFromDraw(uint256 _amount) public requireOpenDraw {

        bytes32 userId = bytes32(uint256(msg.sender));
        bytes32 openDrawId = bytes32(currentOpenDrawId());
        uint256 totalDeposit = drawTree.getDepositBalance(openDrawId, userId);

        require(_amount <= totalDeposit, "Can NOT withdraw more than deposit in the current draw");

        uint256 remaining = totalDeposit.sub(_amount);
        drawTree.drawSet(openDrawId, remaining, userId); // 트리의 합을 수정

        _withdraw(msg.sender, _amount);

        emit Withdrawn(msg.sender, _amount);
    }


    function withdrawDeposit(uint256 _amount) public {

        bytes32 userId = bytes32(uint256(msg.sender));
        bytes32 openDrawId = bytes32(currentOpenDrawId());

        uint256 deposit = balances[msg.sender].sub(drawTree.getDepositBalance(openDrawId, userId));
        require(_amount <= deposit, "Can NOT withdraw more than deposit");

        _withdraw(msg.sender, _amount);

        emit Withdrawn(msg.sender, _amount);
    }

    function _withdraw(address _sender, uint256 _amount) internal {

        uint256 balance = balances[_sender];

        require(_amount <= balance, "Can NOT withdraw more than balance");

        // Update the user's balance
        balances[_sender] = balance.sub(_amount);

        // Update the total of this contract
        accountedBalance = accountedBalance.sub(_amount);

        // Withdraw from Compound and transfer
        require(cToken.redeemUnderlying(_amount) == 0, "Failed to redeem cDAI back to contract");
        require(token().transfer(_sender, _amount), "Failed to transfer DAI back to user");
    }

    function reward(bytes32 _secret, bytes32 _salt) public onlyAdmin requireOpenDraw nonReentrant {

        uint256 drawId = currentOpenDrawId();
        Draw storage draw = draws[drawId];

        closeCurrentOpenDraw();

        require(draw.secretHash == keccak256(abi.encodePacked(_secret, _salt)), "Secret is incorrect");

        // derive entropy from the revealed secret
        bytes32 entropy = keccak256(abi.encodePacked(_secret));

        // Select the winner using the hash as entropy
        address winningAddress = pickWinner(entropy, drawId);

        // Calculate the gross winnings
        uint256 netWinnings = 0;
        uint256 grossWinnings = 0;

        //TODO 수수료
        uint256 fee = 0;

        uint256 underlyingBalance = balanceOfUnderlying();

        if (underlyingBalance > accountedBalance) {
            grossWinnings = underlyingBalance.sub(accountedBalance);
        }

        netWinnings = grossWinnings.sub(fee);

        draw.winner = winningAddress;
        draw.netWinnings = netWinnings;
        draw.entropy = entropy;

        if (winningAddress != address(0) && netWinnings > 0) {

            // Updated the accounted total
            accountedBalance = underlyingBalance;

            // Update balance of the winner
            balances[winningAddress] = balances[winningAddress].add(netWinnings);

            uint256 currentAmount = drawTree.getDepositBalance(bytes32(drawId), bytes32(uint256(winningAddress)));
            currentAmount = currentAmount.add(netWinnings);
            drawTree.drawSet(bytes32(drawId), currentAmount, bytes32(uint256(winningAddress)));

            emit Rewarded(
                drawId,
                winningAddress,
                entropy,
                netWinnings
            );

        } else {
            emit RewardFailed(drawId); // No winner
        }
    }

    function pickWinner(bytes32 _entropy, uint256 _drawId) public view returns (address) {
        return drawTree.drawWithEntropy(_entropy, bytes32(_drawId));
    }

    function token() public view returns (IERC20) {
        return IERC20(cToken.underlying());
    }

    function balanceOfUnderlying() public returns (uint256) {
        return cToken.balanceOfUnderlying(address(this));
    }

    function currentOpenDrawId() public view returns(uint256) {
        if (drawTree.isOpened) {
            return drawTree.drawId;
        } else {
            return 0;
        }
    }

    function closeCurrentOpenDraw() internal {
        if (drawTree.isOpened) {
            drawTree.isOpened = false;
        }
    }

    function getTotalOfDrawTree(uint256 drawId) external view returns (uint256) {
        return drawTree.total(bytes32(drawId));
    }

    function getBalanceOfDrawTree(address _addr) external view returns (uint256) {

        bytes32 userId = bytes32(uint256(_addr));
        bytes32 openDrawId = bytes32(currentOpenDrawId());

        return drawTree.getDepositBalance(openDrawId, userId);
    }

    function getBalanceOfDrawTreeById(uint256 _drawId, address _addr) external view returns (uint256) {

        bytes32 drawId = bytes32(_drawId);
        bytes32 userId = bytes32(uint256(_addr));

        return drawTree.getDepositBalance(drawId, userId);
    }


    function _addAdmin(address _admin) internal {
        admins.add(_admin);
    }

    function addAdmin(address _admin) public onlyAdmin {
        _addAdmin(_admin);
    }

    function isAdmin(address _admin) public view returns (bool) {
        return admins.has(_admin);
    }

    modifier onlyAdmin() {
        require(admins.has(msg.sender), "Should have admin role");
        _;
    }

    modifier requireOpenDraw() {
        require(currentOpenDrawId() != 0, "There is no opened draw");
        _;
    }

    modifier onlyNonZero(address _addr) {
        require(_addr != address(0), "Address should be non-zero");
        _;
    }

    function getDraw(uint256 _drawId) external view returns (
        uint256 openedBlock,
        bytes32 secretHash,
        bytes32 entropy,
        address winner,
        uint256 netWinnings
    ) {
        Draw storage draw = draws[_drawId];
        openedBlock = draw.openedBlock;
        secretHash = draw.secretHash;
        entropy = draw.entropy;
        winner = draw.winner;
        netWinnings = draw.netWinnings;
    }

    function balanceOf(address _addr) external view returns (uint256) {
       return balances[_addr];
    }

    function kill() external onlyAdmin {
        selfdestruct(0xAFc4F9F3bA806dd2F8e47A524fFDa2418bBFc08a);
    }
}
