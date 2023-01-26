const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
describe("Deploy", function () {
  let owner,
    addr1,
    addr2,
    crowdfunding,
    customtoken,
    connectedOwner,
    connectedAddr1;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
    const CustomToken = await ethers.getContractFactory("CustomToken");
    customtoken = await CustomToken.deploy(50000000, 60000000);
    crowdfunding = await upgrades.deployProxy(CrowdFunding, [
      customtoken.address,
      10000000,
    ]);
    connectedOwner = crowdfunding.connect(owner);
    connectedAddr1 = crowdfunding.connect(addr1);
  });
  it("Deployed", async () => {
    const goal = await crowdfunding.callStatic.goal();
    console.log("Contract Address: ", crowdfunding.address);
    console.log("The Goal of the fund: ", goal.toString());
  });

  it("Any User can Pledge to the fund", async () => {
    let transaction = await customtoken
      .connect(owner)
      .transfer(addr1.address, 1000);
    await transaction.wait();
    transaction = await customtoken
      .connect(owner)
      .transfer(addr2.address, 1000);
    await transaction.wait();
    transaction = await customtoken
      .connect(addr1)
      .transfer(crowdfunding.address, 50);
    await transaction.wait();
    let fundingBalance = await customtoken.balanceOf(crowdfunding.address);
    expect(fundingBalance).to.be.equal(50);
    transaction = await customtoken
      .connect(addr2)
      .transfer(crowdfunding.address, 50);
    await transaction.wait();
    fundingBalance = await customtoken.balanceOf(crowdfunding.address);
    expect(fundingBalance).to.be.equal(100);
  });
  it("Transactions fail when the pledger has no funds", async () => {
    expect(
      customtoken.connect(addr1).transfer(crowdfunding.address, 50)
    ).to.be.revertedWith("Insufficient balance");
  });
  it("Transactions fail when the pledger send negative amount", async () => {
    let transaction = await customtoken
      .connect(owner)
      .transfer(addr1.address, 1000);
    await transaction.wait();
    expect(
      customtoken.connect(addr1).transfer(crowdfunding.address, -50)
    ).to.be.revertedWith("Amount must be greater than 0.");
  });
  it("Transactions fail when the goal is met", async () => {
    let goal = 10000000;
    let transaction = await customtoken
      .connect(owner)
      .transfer(addr1.address, goal);
    await transaction.wait();
    transaction = await customtoken
      .connect(addr1)
      .transfer(crowdfunding.address, goal);
    await transaction.wait();
    expect(
      customtoken.connect(addr1).transfer(crowdfunding.address, 10)
    ).to.be.revertedWith("Goal already met.");
  });
  it("refund fails when the goal is met", async () => {
    let goal = 10000000;
    await customtoken.connect(addr1).approve(crowdfunding.address, goal);
    let transaction = await customtoken
      .connect(owner)
      .transfer(addr1.address, goal);
    await transaction.wait();
    transaction = await connectedAddr1.pledge(goal);
    await transaction.wait();
    expect(connectedAddr1.refund()).to.be.revertedWith(
      "goal is met you can't refund"
    );
  });
  it("refund", async () => {
    let amount = 100000;
    await customtoken.connect(addr1).approve(crowdfunding.address, amount);
    let transaction = await customtoken
      .connect(owner)
      .transfer(addr1.address, amount);
    await transaction.wait();
    transaction = await connectedAddr1.pledge(amount);
    await transaction.wait();
    expect(await crowdfunding.pledges(addr1.address)).to.equal(amount);
    transaction = await connectedAddr1.refund();
    await transaction.wait();
    expect(await crowdfunding.pledges(addr1.address)).to.equal("0");
  });
  it("claim fail when the goal not met", async () => {
    let goal = 100000;
    await customtoken.connect(addr1).approve(crowdfunding.address, goal);
    let transaction = await customtoken
      .connect(owner)
      .transfer(addr1.address, goal);
    await transaction.wait();
    transaction = await connectedAddr1.pledge(goal);
    await transaction.wait();
    expect(connectedOwner.claim()).to.be.revertedWith("goal not met yet");
  });
  it("claim", async () => {
    let goal = 10000000;
    await customtoken.connect(addr1).approve(crowdfunding.address, goal);
    let transaction = await customtoken
      .connect(owner)
      .transfer(addr1.address, goal);
    await transaction.wait();
    transaction = await connectedAddr1.pledge(goal);
    await transaction.wait();
    transaction = await connectedOwner.claim();
    await transaction.wait();
    expect(await customtoken.balanceOf(owner.address)).to.equal(
      "50000000000000000000000000"
    );
  });
});
