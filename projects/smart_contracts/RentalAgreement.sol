
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title RentalAgreement
 * @dev Advanced blockchain-based rental property management contract
 * Features: Secure deposits, automated rent tracking, maintenance requests, dispute resolution
 */
contract RentalAgreement {
    
    // ============ State Variables ============
    address public landlord;
    address public tenant;
    uint public monthlyRent;
    uint public securityDeposit;
    uint public leaseStartDate;
    uint public leaseEndDate;
    bool public leaseActive;
    
    uint public totalRentPaid;
    uint public depositBalance;
    
    // Rent payment tracking
    mapping(uint => bool) public rentPaidForMonth;
    
    // Maintenance requests
    struct MaintenanceRequest {
        uint id;
        string description;
        uint estimatedCost;
        string urgency;
        uint createdAt;
        bool resolved;
    }
    
    MaintenanceRequest[] public maintenanceRequests;
    uint public maintenanceRequestCounter;
    
    // Dispute tracking
    struct Dispute {
        uint id;
        address initiator;
        string reason;
        uint createdAt;
        bool resolved;
    }
    
    Dispute[] public disputes;
    
    // Payment history
    struct PaymentRecord {
        uint amount;
        uint timestamp;
        string paymentType; // "rent" or "deposit"
    }
    
    PaymentRecord[] public paymentHistory;
    
    // ============ Events ============
    event LeaseCreated(address indexed landlord, address indexed tenant, uint startDate, uint endDate);
    event DepositPaid(address indexed tenant, uint amount);
    event RentPaid(address indexed tenant, uint month, uint amount);
    event RentRefunded(address indexed tenant, uint month, uint amount);
    event MaintenanceRequested(uint indexed requestId, string description, uint cost);
    event MaintenanceResolved(uint indexed requestId, uint cost);
    event DisputeFiled(uint indexed disputeId, string reason);
    event DisputeResolved(uint indexed disputeId);
    event LeaseEnded(address indexed tenant, uint refundAmount);
    
    // ============ Constructor ============
    constructor(
        address _tenant,
        uint _monthlyRent,
        uint _leaseMonths
    ) {
        require(_tenant != address(0), "Invalid tenant address");
        require(_monthlyRent > 0, "Rent must be positive");
        require(_leaseMonths > 0, "Lease months must be positive");
        
        landlord = msg.sender;
        tenant = _tenant;
        monthlyRent = _monthlyRent;
        securityDeposit = _monthlyRent * 2; // 2 months security deposit
        leaseStartDate = block.timestamp;
        leaseEndDate = block.timestamp + (_leaseMonths * 30 days);
        leaseActive = false;
        maintenanceRequestCounter = 0;
    }
    
    // ============ Modifiers ============
    modifier onlyLandlord() {
        require(msg.sender == landlord, "Only landlord can call this");
        _;
    }
    
    modifier onlyTenant() {
        require(msg.sender == tenant, "Only tenant can call this");
        _;
    }
    
    modifier leaseIsActive() {
        require(leaseActive, "Lease is not active");
        _;
    }
    
    modifier leaseStarted() {
        require(block.timestamp >= leaseStartDate, "Lease has not started");
        _;
    }
    
    // ============ Deposit Management ============
    
    function paySecurityDeposit() public payable onlyTenant {
        require(msg.value == securityDeposit, "Incorrect deposit amount");
        require(!leaseActive, "Lease already active");
        
        depositBalance = msg.value;
        leaseActive = true;
        
        paymentHistory.push(PaymentRecord({
            amount: msg.value,
            timestamp: block.timestamp,
            paymentType: "deposit"
        }));
        
        emit DepositPaid(tenant, msg.value);
        emit LeaseCreated(landlord, tenant, leaseStartDate, leaseEndDate);
    }
    
    // ============ Rent Payment ============
    
    function getCurrentMonth() public view returns (uint) {
        require(block.timestamp >= leaseStartDate, "Lease not started");
        return (block.timestamp - leaseStartDate) / (30 days);
    }
    
    function payMonthlyRent(uint _month) public payable onlyTenant leaseIsActive {
        require(msg.value == monthlyRent, "Incorrect rent amount");
        require(!rentPaidForMonth[_month], "Rent already paid for this month");
        require(_month <= getCurrentMonth(), "Cannot pay for future months");
        
        rentPaidForMonth[_month] = true;
        totalRentPaid += msg.value;
        
        paymentHistory.push(PaymentRecord({
            amount: msg.value,
            timestamp: block.timestamp,
            paymentType: "rent"
        }));
        
        emit RentPaid(tenant, _month, msg.value);
    }
    
    function payCurrentMonthRent() public payable onlyTenant leaseIsActive {
        uint currentMonth = getCurrentMonth();
        payMonthlyRent(currentMonth);
    }
    
    // ============ Maintenance Requests ============
    
    function requestMaintenance(
        string memory _description,
        uint _estimatedCost,
        string memory _urgency
    ) public onlyTenant leaseIsActive {
        require(_estimatedCost > 0, "Cost must be positive");
        require(
            keccak256(bytes(_urgency)) == keccak256(bytes("low")) ||
            keccak256(bytes(_urgency)) == keccak256(bytes("medium")) ||
            keccak256(bytes(_urgency)) == keccak256(bytes("high")) ||
            keccak256(bytes(_urgency)) == keccak256(bytes("critical")),
            "Invalid urgency level"
        );
        
        maintenanceRequests.push(MaintenanceRequest({
            id: maintenanceRequestCounter,
            description: _description,
            estimatedCost: _estimatedCost,
            urgency: _urgency,
            createdAt: block.timestamp,
            resolved: false
        }));
        
        emit MaintenanceRequested(maintenanceRequestCounter, _description, _estimatedCost);
        maintenanceRequestCounter++;
    }
    
    function resolveMaintenance(uint _requestId) public onlyLandlord {
        require(_requestId < maintenanceRequests.length, "Invalid request ID");
        MaintenanceRequest storage request = maintenanceRequests[_requestId];
        require(!request.resolved, "Already resolved");
        
        request.resolved = true;
        
        // Deduct cost from deposit if needed
        if (request.estimatedCost > 0) {
            depositBalance -= request.estimatedCost;
        }
        
        emit MaintenanceResolved(_requestId, request.estimatedCost);
    }
    
    function getMaintenanceRequests() public view returns (MaintenanceRequest[] memory) {
        return maintenanceRequests;
    }
    
    // ============ Dispute Resolution ============
    
    function fileLease(string memory _reason) public {
        require(msg.sender == tenant || msg.sender == landlord, "Only parties can file");
        
        disputes.push(Dispute({
            id: disputes.length,
            initiator: msg.sender,
            reason: _reason,
            createdAt: block.timestamp,
            resolved: false
        }));
        
        emit DisputeFiled(disputes.length - 1, _reason);
    }
    
    function resolveDispute(uint _disputeId, uint _refundAmount) public onlyLandlord {
        require(_disputeId < disputes.length, "Invalid dispute ID");
        Dispute storage dispute = disputes[_disputeId];
        require(!dispute.resolved, "Already resolved");
        require(_refundAmount <= depositBalance, "Insufficient balance");
        
        dispute.resolved = true;
        depositBalance -= _refundAmount;
        
        emit DisputeResolved(_disputeId);
    }
    
    // ============ Lease Termination ============
    
    function endLease() public onlyLandlord leaseIsActive {
        require(block.timestamp >= leaseEndDate, "Lease period not complete");
        
        leaseActive = false;
        uint refund = depositBalance;
        depositBalance = 0;
        
        payable(tenant).transfer(refund);
        
        emit LeaseEnded(tenant, refund);
    }
    
    function earlyTermination() public onlyTenant leaseIsActive {
        // Tenant can terminate early, but may forfeit deposit
        leaseActive = false;
        uint refund = (depositBalance * 50) / 100; // 50% refund if early termination
        depositBalance = 0;
        
        payable(tenant).transfer(refund);
        
        emit LeaseEnded(tenant, refund);
    }
    
    // ============ Payment History ============
    
    function getPaymentHistory() public view returns (PaymentRecord[] memory) {
        return paymentHistory;
    }
    
    function getTotalPayments() public view returns (uint) {
        return totalRentPaid + depositBalance;
    }
    
    // ============ Lease Status ============
    
    function getLeaseStatus() public view returns (
        bool active,
        uint monthsElapsed,
        uint monthsRemaining,
        uint monthlyRentAmount,
        uint depositRemaining
    ) {
        uint currentMonth = leaseActive ? getCurrentMonth() : 0;
        uint totalMonths = (leaseEndDate - leaseStartDate) / (30 days);
        uint remaining = totalMonths > currentMonth ? totalMonths - currentMonth : 0;
        
        return (
            leaseActive,
            currentMonth,
            remaining,
            monthlyRent,
            depositBalance
        );
    }
    
    // ============ Emergency Functions ============
    
    receive() external payable {
        // Allow direct deposits
    }
    
    function getContractBalance() public view returns (uint) {
        return address(this).balance;
    }
}
