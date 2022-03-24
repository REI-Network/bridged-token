const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BridgedERC20", async function () {
  let TestUSDT;
  let testUSDT;
  let signerAddress;
  TestUSDT = await ethers.getContractFactory("BridgedERC20");
  testUSDT = await TestUSDT.deploy("TestUSDT", "TestUSDT", 6);
  signerAddress = await ethers.getSigner().address;
  await testUSDT.deployed();
  // TODO
});
