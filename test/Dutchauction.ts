import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Dutchauction, NFT } from "../typechain";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Dutchauction", function () {
  let dutchauction: Dutchauction,
    nft: NFT,
    owner: SignerWithAddress,
    addr1: SignerWithAddress,
    addr2: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const NFT = await ethers.getContractFactory("NFT");
    nft = (await NFT.deploy("Dutchauction", "DTK", {
      gasLimit: 10000000,
    })) as NFT;
    await nft.deployed();

    const Dutchauction = await ethers.getContractFactory("Dutchauction");
    dutchauction = (await Dutchauction.connect(owner).deploy(
      nft.address,
      10000000,
      1
    )) as Dutchauction;
    await dutchauction.deployed();
  });

  it("Checks the token id auctioned for", async () => {
    await nft.connect(owner).safeMint(addr1.address, 1, "abc");
    await nft.connect(addr1).approve(dutchauction.address, 1);
    await dutchauction.connect(addr1).startAuction(1);
    expect(
      parseFloat((await dutchauction.getAuctionedTokenId()).toString())
    ).to.equal(1);
  });

  it("Ends the auction and transfers the nft to the owner", async () => {
    await nft.connect(owner).safeMint(owner.address, 1, "abc");
    await nft.connect(owner).approve(dutchauction.address, 1);
    await dutchauction.connect(owner).startAuction(1);
    await dutchauction.connect(owner).endAuction();
    expect(await nft.ownerOf(1)).to.equal(owner.address);
  });

  it("Transfer for NFT's and funds when buying", async () => {
    await nft.connect(owner).safeMint(owner.address, 1, "abc");
    await nft.connect(owner).approve(dutchauction.address, 1);
    await dutchauction.connect(owner).startAuction(1);
    await dutchauction.connect(addr2).buy({ value: 10000000 });
    expect(await nft.ownerOf(1)).to.equal(addr2.address);
  });

  it("Should return error if auction is not active", async () => {
    await nft.connect(owner).safeMint(owner.address, 1, "abc");
    await nft.connect(owner).approve(dutchauction.address, 1);
    await expect(dutchauction.connect(owner).endAuction()).to.be.revertedWith(
      "Auction is not active"
    );
  });
});
