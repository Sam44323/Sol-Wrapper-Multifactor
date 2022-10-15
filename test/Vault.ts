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
});
