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
    const event = (await tx.wait()).events?.find((e) => e.event === "Queue");

    expect(await timeLock.connect(owner).cancel(event?.args!["txId"])).to.emit(
      timeLock,
      "Cancel"
    );
  });

  it("Should return an error if the transactionId does not exist", async () => {
    await expect(
      timeLock.connect(owner).cancel(ethers.utils.formatBytes32String("test"))
    ).to.be.revertedWith("TimeLock: transaction not queued");
  });

  it("Should execute a queued transaction", async () => {
    const txTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
    await timeLock.queue(
      timelockTester.address,
      0,
      "testCaller()",
      "0x",
      txTimestamp + 100
    );

    await ethers.provider.send("evm_increaseTime", [100]);
    await ethers.provider.send("evm_mine", []);

    expect(
      await timeLock
        .connect(owner)
        .execute(
          timelockTester.address,
          0,
          "testCaller()",
          "0x",
          txTimestamp + 100
        )
    ).to.emit(timeLock, "Execute");
  });

  it("Should return an error of TimestampNotPassedError", async () => {
    const txTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
    await timeLock.queue(
      timelockTester.address,
      0,
      "testCaller()",
      "0x",
      txTimestamp + 100
    );

    await expect(
      timeLock
        .connect(owner)
        .execute(
          timelockTester.address,
          0,
          "testCaller()",
          "0x",
          txTimestamp + 100
        )
    ).to.be.revertedWithCustomError(timeLock, "TimestampNotPassedError");
  });

  it("Should return an error of TimestampExpiredError", async () => {
    const txTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
    await timeLock.queue(
      timelockTester.address,
      0,
      "testCaller()",
      "0x",
      txTimestamp + 100
    );

    await ethers.provider.send("evm_increaseTime", [1500]);
    await ethers.provider.send("evm_mine", []);

    await expect(
      timeLock
        .connect(owner)
        .execute(
          timelockTester.address,
          0,
          "testCaller()",
          "0x",
          txTimestamp + 100
        )
    ).to.be.revertedWithCustomError(timeLock, "TimestampExpiredError");
  });
});
