const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
  const CustomToken = await ethers.getContractFactory("CustomToken");
  const customtoken = await CustomToken.deploy(50000000, 60000000);
  const crowdfunding = await CrowdFunding.deploy(customtoken.address, 10000000);
  console.log("Token Address: ", customtoken.address);
  console.log("CrowdFunding Address: ", crowdfunding.address);
  console.log("Deployer Address: ", deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
