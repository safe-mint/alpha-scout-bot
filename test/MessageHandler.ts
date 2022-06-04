import {MessageHandler} from '../src/MessageHandler'
import {expect} from 'chai'
import {faker} from '@faker-js/faker'
import sinon from 'sinon'
import {Airtabler} from '../src/Airtabler'

const DUPLICATE_TWITTER_LINK = "https://twitter.com/a_new_nft_project44"

describe('MessageHandler', () => {

  describe("#doesRecordExist", () => {
    it("finds exists", async () => {
      const handler = new MessageHandler()
      let exists = await handler.doesRecordExist(DUPLICATE_TWITTER_LINK)
      expect(exists).to.be.true
      exists = await handler.doesRecordExist("https://twitter.com/LonelyPopNFT")
      expect(exists).to.be.true
    })
  })

  describe("convertTwitterToValidLink", () => {
    let handler:MessageHandler
    const expectedResult = "https://twitter.com/BillyBobNFT"
    before( () => {
      handler = new MessageHandler()
    })
    it("return correct string", () => {
      const protocol = ["https://", "http://", ""]
      const subdomain = ["mobile.", "www.", ""]
      const queryStr = ["?t=yUnZi2HaVMlwaSGs_Dyzxw&s=09", ""]
      protocol.forEach(p => {
        subdomain.forEach(s => {
          queryStr.forEach(q => {
            const twitter = `${p}${s}twitter.com/BillyBobNFT${q}`
            //console.log(twitter)
            const result = handler.convertTwitterToValidLink(twitter)
            expect(result).to.eq(expectedResult)
          })
        })
      })
    })

    it("when string is not twitter.com", () => {
      expect(handler.convertTwitterToValidLink("boba.com")).to.be.undefined
      expect(handler.convertTwitterToValidLink("https://bliken.twitter.com?abs")).to.be.undefined
      expect(handler.convertTwitterToValidLink("mobile.ABCDEFG")).to.be.undefined
    })
  })

  describe("#handle", () => {
    let handler:MessageHandler
    const author = 'mcMinty'
    before( () => {
      handler = new MessageHandler()
    })
    it("BAD_TWITTER_LINK", async () => {
      const str = "moonbirds 2022"
      const result = await handler.handle(str, author)
      expect(result).to.eq(MessageHandler.STATUS.BAD_TWITTER_LINK)
    })
    it("DUPLICATE_RECORD", async () => {
      const str = `${DUPLICATE_TWITTER_LINK} 2022`
      const result = await handler.handle(str, author)
      expect(result).to.eq(MessageHandler.STATUS.DUPLICATE_RECORD)
    })
    it("DB_SUCCESS", async () => {
      const twitterLink = "https://twitter.com/" + faker.random.words(6).replace(' ', '-')
      const str = `${twitterLink} 2022`
      const result = await handler.handle(str, author)
      expect(result).to.eq(MessageHandler.STATUS.DB_SUCCESS)
    })
    it("DB_SAVING_ERROR", async () => {
      sinon.stub(Airtabler.prototype, 'createRecord').callsFake( () => { throw Error("intentionally generated TEST Error") })
      const twitterLink = "https://twitter.com/" + faker.random.words(6).replace(' ', '-')
      const str = `${twitterLink} 2022`
      const result = await handler.handle(str, author)
      expect(result).to.eq(MessageHandler.STATUS.DB_SAVING_ERROR)
    })
    
  })

  describe("#parseMessage", () => {
    let handler:MessageHandler
    before( () => {
      handler = new MessageHandler()
    })
    it('happy path', () => {
      const message = "https://twitter.com/moonbirds 2022"
      const [twitterLink, launchDate] = handler.parseMessage(message)
      expect(twitterLink).to.eq("https://twitter.com/moonbirds")
      expect(launchDate).to.eq('2022')
    })
    it('extra spaces', () => {
      const message = "   https://twitter.com/moonbirds      2022 "
      const [twitterLink, launchDate] = handler.parseMessage(message)
      expect(twitterLink).to.eq("https://twitter.com/moonbirds")
      expect(launchDate).to.eq('2022')   
    })
    it('no launch date', () => {
      const message = "https://twitter.com/moonbirds"
      const [twitterLink, launchDate] = handler.parseMessage(message)
      expect(twitterLink).to.eq("https://twitter.com/moonbirds")
      expect(launchDate).to.eq(undefined)   
    })
    it('garbage input', () => {
      const message = "thisisgarbage!@#"
      const [twitterLink, launchDate] = handler.parseMessage(message)
      expect(twitterLink).to.eq(message)
      expect(launchDate).to.eq(undefined)   
    })
    it('long launch date', () => {
      const message = "https://twitter.com/moonbirds April 15, 2023"
      const [twitterLink, launchDate] = handler.parseMessage(message)
      expect(twitterLink).to.eq("https://twitter.com/moonbirds")
      expect(launchDate).to.eq("April 15, 2023")   
    })
    it('delimited with comma and space', () => {
      const message = "https://twitter.com/moonbirds, 2023"
      const [twitterLink, launchDate] = handler.parseMessage(message)
      expect(twitterLink).to.eq("https://twitter.com/moonbirds")
      expect(launchDate).to.eq("2023")   
    })
  })

})