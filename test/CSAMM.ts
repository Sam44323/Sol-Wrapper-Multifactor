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
});
