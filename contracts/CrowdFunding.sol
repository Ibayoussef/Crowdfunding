// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

interface IERC20 {
    function transfer(address payable to, uint256 amount)
        external
        returns (bool);

    function balanceOf(address) external returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external;

    function totalSupply() external returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
}

contract CrowdFunding is Initializable {
    address public owner;
    uint256 public goal;
    IERC20 token;
    mapping(IERC20 => uint256) public raised;
    mapping(address => uint256) public pledges;
    event FundTransfer(address from, uint256 amount);
    event GoalReached(address owner);
    event Refund(address to, uint256 amount);

    function initialize(address _tokenAddress, uint256 _goal)
        public
        initializer
    {
        owner = msg.sender;
        token = IERC20(_tokenAddress);
        goal = _goal;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    receive() external payable {
        require(token.balanceOf(msg.sender) > 0, "Insufficient balance");
        require(address(this).balance < goal, "Goal already met.");
        require(msg.value > 0, "Amount must be greater than 0.");
        pledge(msg.value);
    }

    function pledge(uint256 _amount) public {
        token.transferFrom(payable(msg.sender), address(this), _amount);
        pledges[msg.sender] += _amount;
        raised[token] += _amount;
        emit FundTransfer(msg.sender, _amount);
    }

    function claim() public onlyOwner {
        require(raised[token] == goal, "goal not met yet");
        token.transfer(payable(owner), raised[token]);
        emit GoalReached(owner);
    }

    function refund() public {
        require(msg.sender != owner);
        require(raised[token] < goal, "goal is met you can't refund");
        uint256 refundAmount = pledges[msg.sender];
        require(
            token.transfer(payable(msg.sender), refundAmount),
            "Refund failed."
        );
        pledges[msg.sender] = 0;
        raised[token] -= refundAmount;
        emit Refund(msg.sender, refundAmount);
    }
}
