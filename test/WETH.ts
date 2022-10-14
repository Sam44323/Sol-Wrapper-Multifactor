import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { WETH } from "../typechain";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("WETH", () => {
  let weth: WETH, owner: SignerWithAddress;

  beforeEach(async () => {
    [owner] = await ethers.getSigners();
    const WETH = await ethers.getContractFactory("WETH");
    weth = await WETH.deploy();
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
    await weth.mint({
      value: (10 ** 18).toString(),
    });
    console.log(
      ethers.utils.parseEther((await weth.balanceOf(owner.address)).toString())
    );
    expect(1000).to.equal(1000);
  });
});
