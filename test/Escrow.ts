import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Escrow } from "../typechain";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Escrow", function () {
  let escrow: Escrow,
    admin: SignerWithAddress,
    depositor1: SignerWithAddress,
    depositor2: SignerWithAddress;
  beforeEach(async () => {
    [admin, depositor1, depositor2] = await ethers.getSigners();
    escrow = await (await ethers.getContractFactory("Escrow"))
      .connect(admin)
      .deploy();
  });

  it("check the admin authority of the contract", async () => {
    expect(await escrow.escrowOwner()).to.equal(admin.address);
  });

  it("check the deposit function", async () => {
    await depositor1.sendTransaction({
      to: escrow.address,
      value: 100,
    });
    expect(
      await escrow.connect(depositor1).deposits(depositor1.address)
    ).to.equal(100);
  });
});
