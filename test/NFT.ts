import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { NFT } from "../typechain";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("NFT", () => {
  let nft: NFT, owner: SignerWithAddress, addr1: SignerWithAddress;
  beforeEach(async () => {
    const NFT = await ethers.getContractFactory("NFT");
    [owner, addr1] = await ethers.getSigners();
    nft = (await NFT.deploy("Non Fungible Token", "NFT")) as NFT;
  });

  it("Should return the right name and symbol", async () => {
    expect(await nft.name()).to.equal("Non Fungible Token");
    expect(await nft.symbol()).to.equal("NFT");
  });

  it("Should assign the total supply of tokens to the owner", async () => {
    const ownerBalance = await nft.balanceOf(owner.address);
    expect(await nft.totalSupply()).to.equal(ownerBalance);
  });

  it("Minting an NFT for user", async () => {
    await nft.connect(owner).safeMint(addr1.address, 1, "abc");
    expect(await nft.balanceOf(addr1.address)).to.equal(1);
  });

  it("Should transfer tokens between accounts", async () => {
    await nft.connect(owner).safeMint(addr1.address, 1, "abc");
    await nft.connect(addr1).transferFrom(addr1.address, owner.address, 1);
    expect(await nft.balanceOf(addr1.address)).to.equal(0);
    expect(await nft.balanceOf(owner.address)).to.equal(1);
  });

  it("Should fail if sender doesn’t have enough tokens", async () => {
    const initialOwnerBalance = await nft.balanceOf(owner.address);
    await expect(
      nft.connect(addr1).transferFrom(addr1.address, owner.address, 1)
    ).to.be.revertedWith("ERC721: Undersupply for tokens");
    expect(await nft.balanceOf(owner.address)).to.equal(initialOwnerBalance);
  });

  it("Should update balances after transfers", async () => {
    await nft.connect(owner).safeMint(addr1.address, 1, "abc");
    const initialOwnerBalance = parseFloat(
      (await nft.balanceOf(owner.address)).toString()
    );
    await nft.connect(addr1).transferFrom(addr1.address, owner.address, 1);
    expect(await nft.balanceOf(addr1.address)).to.equal(0);
    expect(
      parseFloat((await nft.balanceOf(owner.address)).toString())
    ).to.equal(initialOwnerBalance + 1);
  });

  it("Should fail if sender tries to transfer token that is not owned", async () => {
    await nft.connect(owner).safeMint(addr1.address, 1, "abc");
    await expect(
      nft.connect(owner).transferFrom(addr1.address, owner.address, 1)
    ).to.be.revertedWith("ERC721: You don't own this token");
  });

  it("Support burning for tokens", async () => {
    await nft.connect(owner).safeMint(addr1.address, 1, "abc");
    await nft.connect(addr1).burn(1);
    expect(await nft.balanceOf(addr1.address)).to.equal(0);
  });
});
