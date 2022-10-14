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
});
