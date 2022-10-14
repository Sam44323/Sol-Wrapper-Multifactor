import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { WETH } from "../typechain";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("WETH", () => {
  let weth: WETH, owner: SignerWithAddress, addr1: SignerWithAddress;

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();
    const WETH = await ethers.getContractFactory("WETH");
    weth = await WETH.connect(owner).deploy();
    await weth.deployed();
  });

  it("should return the correct name and symbol", async () => {
    expect(await weth.name()).to.equal("Wrapped Ether");
    expect(await weth.symbol()).to.equal("WETH");
  });

  it("should return the correct decimals", async () => {
    expect(await weth.decimals()).to.equal(18);
  });

  it("Mint some WETH token with locking", async () => {
    await weth.connect(owner).approve(addr1.address, 10);
    await weth.connect(addr1).mint({
      value: 10,
    });
    expect(
      parseFloat((await weth.balanceOf(addr1.address)).toString())
    ).to.equal(10);
  });
});
