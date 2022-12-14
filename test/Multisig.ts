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

  it("should return true for valid owner", async () => {
    const isOwner = await multisig.isOwner(owner.address);
    expect(isOwner).to.be.true;
  });

  it("should return the current balance of the wallet", async () => {
    await owner.sendTransaction({
      to: multisig.address,
      value: ethers.utils.parseEther("100"),
    });
    const balance = await multisig.balance();
    expect(parseFloat(ethers.utils.formatEther(balance))).to.be.equal(100);
  });

  it("submit transaction event is working", async () => {
    await expect(
      multisig.submitTransaction(
        multisig.address,
        0,
        ethers.utils.formatBytes32String("test")
      )
    ).to.emit(multisig, "SubmitTransaction");
  });

  it("transactions should be greater than 0", async () => {
    for (let i = 0; i < 3; i++) {
      await multisig.submitTransaction(
        multisig.address,
        i,
        ethers.utils.formatBytes32String("test")
      );
    }
    const txId = await multisig.transactions(2);
    expect(parseInt(txId.value.toString())).to.be.equal(2);
  });

  it("approve a transaction", async () => {
    await multisig.submitTransaction(
      multisig.address,
      0,
      ethers.utils.formatBytes32String("test")
    );
    await multisig.connect(addr1).approveTransaction(0);
    const tx = await multisig.approvals(0, addr1.address);
    expect(tx).to.be.true;
  });

  it("revoke a transaction", async () => {
    await multisig.submitTransaction(
      multisig.address,
      0,
      ethers.utils.formatBytes32String("test")
    );
    await multisig.connect(addr1).approveTransaction(0);
    await multisig.connect(addr1).revokeApproval(0);
    const tx = await multisig.approvals(0, addr1.address);
    expect(tx).to.be.false;
  });

  it("should execute a transaction", async () => {
    await owner.sendTransaction({
      to: addr1.address,
      value: ethers.utils.parseEther("10"),
    });
    await multisig.submitTransaction(
      owner.address,
      0,
      ethers.utils.formatBytes32String("test")
    );
    await multisig.connect(owner).approveTransaction(0);
    await multisig.connect(addr1).approveTransaction(0);
    await multisig.connect(addr2).approveTransaction(0);
    await expect(multisig.executeTransaction(0, 1)).to.emit(
      multisig,
      "ExecuteTransaction"
    );
    expect((await multisig.transactions(0)).executed).to.be.true;
  });
});
