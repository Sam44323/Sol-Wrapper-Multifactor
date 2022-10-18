import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { CSAMM, Token0, Token1 } from "../typechain";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("CSAMM", () => {
  let csamm: CSAMM, token0: Token0, token1: Token1, addr1: SignerWithAddress;

  beforeEach(async () => {
    const signer = await ethers.getSigners();
    addr1 = signer[0];

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

  it("Mint shares for the providers", async () => {
    await token0.connect(addr1).mint({
      value: 100,
    });

    await token1.connect(addr1).mint({
      value: 100,
    });

    await token0.connect(addr1).approve(csamm.address, 100);
    await token1.connect(addr1).approve(csamm.address, 100);

    await csamm.connect(addr1).addLiquidity(100, 100);
    expect(await csamm.balanceOf(addr1.address)).to.equal(200);
  });

  it("Check liquidity removal data", async () => {
    await token0.connect(addr1).mint({
      value: 100,
    });

    await token1.connect(addr1).mint({
      value: 100,
    });

    await token0.connect(addr1).approve(csamm.address, 100);
    await token1.connect(addr1).approve(csamm.address, 100);

    await csamm.connect(addr1).addLiquidity(100, 100);
    expect(await csamm.balanceOf(addr1.address)).to.equal(200);
    const tx = await csamm.removeLiquidity(200);
    const event = (await tx.wait()).events?.find(
      (e) => e.event === "RemoveLiquidity"
    );
    const shares = await csamm.balanceOf(addr1.address);
    console.log(shares);
    expect(event?.args![1]).to.equal(100);
    expect(event?.args![2]).to.equal(100);
    expect(shares).to.equal(0);
  });
});
