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
});
