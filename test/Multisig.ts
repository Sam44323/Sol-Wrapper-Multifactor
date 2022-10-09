import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Multisig } from "../typechain";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Multisig", function () {
  let multisig: Multisig;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    multisig = await (await ethers.getContractFactory("Multisig"))
      .connect(owner)
      .deploy([owner.address, addr1.address, addr2.address], 3);
    await multisig.deployed();
  });
});
