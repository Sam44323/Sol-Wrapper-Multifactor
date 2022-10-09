import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ChainToken } from "../typechain";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ChainToken", function () {
  let user1: SignerWithAddress,
    user2: SignerWithAddress,
    chainToken: ChainToken;

  beforeEach(async () => {
    [user1, user2] = await ethers.getSigners();
    const ChainToken = await ethers.getContractFactory("ChainToken");
    chainToken = await ChainToken.deploy();
    await chainToken.deployed();
  });

  it("Should mint 1000 tokens to user1", async () => {
    await chainToken.mint(1000);
    expect(await chainToken.balanceOf(user1.address)).to.equal(1000);
  });
});
