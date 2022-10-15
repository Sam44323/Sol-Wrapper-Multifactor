import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Vault, ChainToken } from "../typechain";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Vault", () => {
  let vault: Vault,
    chainToken: ChainToken,
    addr1: SignerWithAddress,
    addr2: SignerWithAddress;

  beforeEach(async () => {
    const Vault = await ethers.getContractFactory("Vault");
    const ChainToken = await ethers.getContractFactory("ChainToken");
    chainToken = await ChainToken.deploy();
    await chainToken.deployed();
    [addr1, addr2] = await ethers.getSigners();
    vault = await Vault.deploy(chainToken.address);
    await vault.deployed();
  });

  it("Token address set is correct for vault", async () => {
    expect(await vault.token()).to.equal(chainToken.address);
  });

  it("Total supply for vault is 1000", async () => {
    await chainToken.connect(addr1).mint(1000);
    await chainToken.connect(addr1).approve(vault.address, 1000);
    await vault.connect(addr1).deposit(1000);
    expect(await vault.totalSupply()).to.equal(1000);
  });

  it("Should revert with an error if deposit amount is 0", async () => {
    await chainToken.connect(addr1).mint(1000);
    await chainToken.connect(addr1).approve(vault.address, 1000);
    await expect(vault.connect(addr1).deposit(0)).to.be.revertedWith(
      "Amount must be greater than 0"
    );
  });

  it("Should revert if withdraw shares is 0 or doesnt exist", async () => {
    await expect(vault.connect(addr1).withdraw(100)).to.be.revertedWith(
      "Not enough shares"
    );
  });

  it("Withdraw amount should be more than deposit", async () => {
    await chainToken.connect(addr1).mint(2000);
    await chainToken.connect(addr1).approve(vault.address, 2000);
    await vault.connect(addr1).deposit(1000);
    await chainToken.connect(addr1).transfer(vault.address, 1000);
    await vault.connect(addr1).withdraw(1000);
    expect(await chainToken.balanceOf(addr1.address)).to.be.eq(2000);
  });
});
