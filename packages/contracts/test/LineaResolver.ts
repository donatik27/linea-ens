import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { constants } from "ethers";

describe("LineaResolver", function () {
  async function deployContractsFixture() {
    const [owner, unknown] = await ethers.getSigners();

    const domain = "julink.lineatest.eth";
    const hash = ethers.utils.namehash(domain);

    const undefinedDomain = "undefined.lineatest.eth";
    const undefinedHash = ethers.utils.namehash(undefinedDomain);

    // Deploy Resolver
    const LineaResolver = await ethers.getContractFactory("LineaResolver");
    const nftName = "Lineatest";
    const symbol = "LTST";
    const baseUri = "http://localhost:3000/metadata/";
    const lineaResolver = await LineaResolver.deploy(nftName, symbol, baseUri);
    await lineaResolver.deployed();

    // Mint domain
    await lineaResolver.mintSubdomain(domain, owner.address);

    return {
      owner,
      unknown,
      domain,
      baseUri,
      lineaResolver,
      hash,
      undefinedHash,
    };
  }

  describe("mintSubdomain", async () => {
    it("Should format the domain to lowercase", async function () {
      const { lineaResolver, owner } = await loadFixture(deployContractsFixture);

      const domain = "JULINK42.lineatest.eth";
      await lineaResolver.mintSubdomain(domain, owner.address);
      const name = await lineaResolver.tokenName(2);

      expect(name).to.be.equal(domain.toLowerCase());
    });
  });

  describe("resolve", async () => {
    it("Should be able to resolve an address given a hashname", async function () {
      const { lineaResolver, hash, owner } = await loadFixture(deployContractsFixture);

      expect(await lineaResolver.resolve(hash)).to.be.equal(owner.address);
    });

    it("Resolve should send address(0) if the hash has not been minted", async function () {
      const { lineaResolver, undefinedHash } = await loadFixture(deployContractsFixture);

      expect(await lineaResolver.resolve(undefinedHash)).to.be.equal(constants.AddressZero);
    });
  });

  describe("exists", async () => {
    it("Should be able to check if an tokenId exists", async function () {
      const { lineaResolver } = await loadFixture(deployContractsFixture);

      expect(await lineaResolver.exists(1)).to.be.equal(true);
      expect(await lineaResolver.exists(10)).to.be.equal(false);
    });
  });

  describe("setBaseTokenURI", async () => {
    it("Should be able to change the base URI for tokens", async function () {
      const newBaseUri = "http://localhost:3001/metadata/";
      const tokenId = 1;
      const { lineaResolver } = await loadFixture(deployContractsFixture);

      await lineaResolver.setBaseTokenURI(newBaseUri);
      const tokenURI = await lineaResolver.tokenURI(tokenId);

      expect(tokenURI).to.be.equal(new URL(tokenId.toString(), newBaseUri).toString());
    });
    it("Should revert if Base URI is empty", async function () {
      const tokenId = 1;
      const { lineaResolver, baseUri } = await loadFixture(deployContractsFixture);

      await expect(lineaResolver.setBaseTokenURI("")).to.be.revertedWith("Base URI cannot be empty");
    });
    it("Should only be used by owner", async function () {
      const { lineaResolver, unknown } = await loadFixture(deployContractsFixture);
      const newBaseUri = "http://localhost:3001/metadata/";

      await expect(lineaResolver.connect(unknown).setBaseTokenURI(newBaseUri)).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("tokenURI", async () => {
    it("Should return token uri", async function () {
      const tokenId = 1;
      const { lineaResolver, baseUri } = await loadFixture(deployContractsFixture);

      const expectedUri = new URL(tokenId.toString(), baseUri).toString();
      const tokenUri = await lineaResolver.tokenURI(tokenId);

      await expect(tokenUri).to.be.equal(expectedUri);
    });
    it("Should revert if token does not exists", async function () {
      const tokenId = 0;
      const { lineaResolver } = await loadFixture(deployContractsFixture);

      await expect(lineaResolver.tokenURI(tokenId)).to.be.revertedWith("ERC721: invalid token ID");
    });
    it("Should revert if token does not exists", async function () {
      const tokenId = 0;
      const { lineaResolver } = await loadFixture(deployContractsFixture);

      await expect(lineaResolver.tokenURI(tokenId)).to.be.revertedWith("ERC721: invalid token ID");
    });
    it("Should return only tokenId when Base URI is empty", async function () {
      const { domain, owner } = await loadFixture(deployContractsFixture);

      // Deploy Resolver
      const LineaResolver = await ethers.getContractFactory("LineaResolver");
      const nftName = "Lineatest";
      const symbol = "LTST";
      const baseUri = "";
      const lineaResolver = await LineaResolver.deploy(nftName, symbol, baseUri);
      await lineaResolver.deployed();

      const tokenId = 1;
      // Mint domain
      await lineaResolver.mintSubdomain(domain, owner.address);

      const tokenUri = await lineaResolver.tokenURI(tokenId);

      await expect(tokenUri).to.be.equal(tokenId.toString());
    });
  });

  describe("tokenName", async () => {
    it("Should return token name", async function () {
      const tokenId = 1;
      const { lineaResolver, domain } = await loadFixture(deployContractsFixture);

      const name = await lineaResolver.tokenName(tokenId);

      await expect(name).to.be.equal(domain);
    });
  });

  describe("burn", async () => {
    it("Should burn a token", async function () {
      const tokenId = 1;
      const { lineaResolver } = await loadFixture(deployContractsFixture);

      await lineaResolver.burn(tokenId);

      await expect(lineaResolver.ownerOf(tokenId)).to.be.revertedWith("ERC721: invalid token ID");
    });
    it("Should revert if not token owner", async function () {
      const tokenId = 1;
      const { lineaResolver, unknown } = await loadFixture(deployContractsFixture);

      await expect(lineaResolver.connect(unknown).burn(tokenId)).to.be.revertedWith("Caller is not owner or approved");
    });
  });

  describe("supportsInterface", async () => {
    // Test supportsInterface for success
    it("should return true for ERC721Enumerable interface", async () => {
      const { lineaResolver } = await loadFixture(deployContractsFixture);
      // Interface ID for ERC721Enumerable
      const interfaceId = "0x780e9d63";

      // Check if supportsInterface returns true for ERC721Enumerable interface
      const result = await lineaResolver.supportsInterface(interfaceId);
      expect(result).to.be.true;
    });

    // Test supportsInterface for fail
    it("should return false for non-existing interface", async () => {
      const { lineaResolver } = await loadFixture(deployContractsFixture);
      // Interface ID for an arbitrary non-existing interface
      const interfaceId = "0x12345678";

      // Check if supportsInterface returns false for non-existing interface
      const result = await lineaResolver.supportsInterface(interfaceId);
      expect(result).to.be.false;
    });
  });
});
