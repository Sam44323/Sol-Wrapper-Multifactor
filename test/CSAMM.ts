import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { CSAMM, Token0, Token1 } from "../typechain";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("CSAMM", () => {
  let csamm: CSAMM, token0: Token0, token1: Token1, addr1: SignerWithAddress;

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    addr1 = signers[1];

    const Token0 = await ethers.getContractFactory("Token0");
    token0 = await Token0.deploy();
    await token0.deployed();

    const Token1 = await ethers.getContractFactory("Token1");
    token1 = await Token1.deploy();
    await token1.deployed();

    const CSAMM = await ethers.getContractFactory("CSAMM");
    csamm = await CSAMM.deploy(token0.address, token1.address);
    await csamm.deployed();
  });

  it("Check the address of the LP tokens", async () => {
    expect(await csamm.token0()).to.equal(token0.address);
    expect(await csamm.token1()).to.equal(token1.address);
  });

  it("Start with zero reserves", async () => {
    const reserve0 = await csamm.reserve0();
    const reserve1 = await csamm.reserve1();
    const totalSupply = await csamm.totalSupply();

    expect(reserve0).to.equal(0);
    expect(reserve1).to.equal(0);
    expect(totalSupply).to.equal(0);
  });
});
