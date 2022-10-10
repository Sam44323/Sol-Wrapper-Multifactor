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
    nft = (await NFT.deploy()) as NFT;
    await nft.deployed();
    // const mintedNft = await nft.

    const Dutchauction = await ethers.getContractFactory("Dutchauction");
    dutchauction = (await Dutchauction.deploy(
      nft.address,
      1,
      100,
      10,
      new Date().getTime()
    )) as Dutchauction;
    await dutchauction.deployed();
  });
});
