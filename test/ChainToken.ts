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

  it("Should burn 1000 tokens from user1", async () => {
    await chainToken.mint(1000);
    await chainToken.burn(1000);
    expect(await chainToken.balanceOf(user1.address)).to.equal(0);
  });

  it("Should approve 1000 tokens for user1", async () => {
    await chainToken.mint(1000);
    await chainToken.approve(user2.address, 1000);
    expect(await chainToken.allowance(user1.address, user2.address)).to.equal(
      1000
    );
    expect(await chainToken.approve(user2.address, 1000)).to.emit(
      chainToken,
      "Approval"
    );
  });

  it("Should transfer 1000 tokens from user1 to user2", async () => {
    await chainToken.mint(1000);
    await chainToken.transfer(user2.address, 1000);
    await chainToken.mint(1000);
    expect(await chainToken.balanceOf(user2.address)).to.equal(1000);
    expect(await chainToken.transfer(user2.address, 1000)).to.emit(
      chainToken,
      "Transfer"
    );
  });
});
