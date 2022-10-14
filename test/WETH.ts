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
});
