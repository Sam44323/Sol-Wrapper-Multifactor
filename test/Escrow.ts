import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Escrow } from "../typechain";
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
      value: ethers.utils.parseEther("100"),
    });
    expect(
      parseFloat(
        ethers.utils.formatEther(
          await escrow.connect(depositor1).deposits(depositor1.address)
        )
      )
    ).to.equal(100);
  });

  it("check the withdraw function", async () => {
    await depositor1.sendTransaction({
      to: escrow.address,
      value: ethers.utils.parseEther("100"),
    });
    await escrow.connect(admin).withdraw();
    const adminBalance = parseFloat(
      ethers.utils.formatEther(await admin.getBalance())
    );
    expect(adminBalance).to.greaterThanOrEqual(10090);
  });
});
