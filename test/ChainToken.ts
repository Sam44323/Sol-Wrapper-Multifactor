import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ChainToken } from "../typechain";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ChainToken", function () {
  let admin: SignerWithAddress,
    user1: SignerWithAddress,
    user2: SignerWithAddress,
    chainToken: ChainToken;

  beforeEach(async () => {
    [admin, user1, user2] = await ethers.getSigners();
    const ChainToken = await ethers.getContractFactory("ChainToken");
    chainToken = await ChainToken.deploy();
    await chainToken.deployed();
  });
});
