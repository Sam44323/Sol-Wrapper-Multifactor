import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TimeLock, TimeLockTargetCaller } from "../typechain";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("TimeLock", () => {
  let timeLock: TimeLock,
    timelockTester: TimeLockTargetCaller,
    owner: SignerWithAddress;

  beforeEach(async () => {
    [owner] = await ethers.getSigners();

    const TimeLock = await ethers.getContractFactory("TimeLock");
    timeLock = (await TimeLock.deploy()) as TimeLock;
    await timeLock.deployed();

    const TimeLockTargetCaller = await ethers.getContractFactory(
      "TimeLockTargetCaller"
    );
    timelockTester = (await TimeLockTargetCaller.deploy(
      timeLock.address
    )) as TimeLockTargetCaller;
    await timelockTester.deployed();
  });

  it("Timelock contract address for tester should be equal to the actual address", async () => {
    expect(await timelockTester.timelock()).to.equal(timeLock.address);
  });

  it("Should return and error if the tester is not called by the timelock", async () => {
    await expect(timelockTester.testCaller()).to.be.revertedWith(
      "caller needs to be a timelock contract"
    );
  });

  it("Creating a transaction queue", async () => {
    expect(
      await timeLock.queue(
        timelockTester.address,
        0,
        "testCaller()",
        "0x",
        (await ethers.provider.getBlock("latest")).timestamp + 100
      )
    ).to.emit(timeLock, "Queue");
  });

  it("Check the existence of the transactionId", async () => {
    const tx = await timeLock.queue(
      timelockTester.address,
      0,
      "testCaller()",
      "0x",
      (await ethers.provider.getBlock("latest")).timestamp + 100
    );
    const receipt = await tx.wait();
    const event = receipt.events?.find((e) => e.event === "Queue");

    expect(await timeLock.connect(owner).cancel(event?.args!["txId"])).to.emit(
      timeLock,
      "Cancel"
    );
  });
});
