import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Multisig } from "../typechain";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Multisig", function () {
  let multisig: Multisig,
    owner: SignerWithAddress,
    addr1: SignerWithAddress,
    addr2: SignerWithAddress,
    addr3: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    multisig = await (await ethers.getContractFactory("Multisig"))
      .connect(owner)
      .deploy([owner.address, addr1.address, addr2.address], 3);
    await multisig.deployed();
  });

  it("should return the correct number of owners", async () => {
    const ownersLength = (await multisig.connect(owner).getOwners()).length;
    expect(ownersLength).to.be.equal(3);
  });

  it("should return false for invalid owner", async () => {
    const isOwner = await multisig.isOwner(addr3.address);

    expect(isOwner).to.be.false;
  });
});
