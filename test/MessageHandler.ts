import {MessageHandler} from '../src/MessageHandler'
import {expect} from 'chai'
import {faker} from '@faker-js/faker'

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

  describe("#handle", () => {
    let handler:MessageHandler
    const author = 'mcMinty'
    before( () => {
      handler = new MessageHandler()
    })
    it("NO_LAUNCH_DATE", async () => {
      const str = "https://twitter.com/moonbirds"
      const result = await handler.handle(str, author)
      expect(result).to.eq(MessageHandler.STATUS.NO_LAUNCH_DATE)
    })
    it("BAD_TWITTER_LINK", async () => {
      const str = "moonbirds, 2022"
      const result = await handler.handle(str, author)
      expect(result).to.eq(MessageHandler.STATUS.BAD_TWITTER_LINK)
    })
    it("DUPLICATE_RECORD", async () => {
      const str = `${DUPLICATE_TWITTER_LINK}, 2022`
      const result = await handler.handle(str, author)
      expect(result).to.eq(MessageHandler.STATUS.DUPLICATE_RECORD)
    })
    it("DB_SUCCESS", async () => {
      const twitterLink = "https://twitter.com/" + faker.random.words(6).replace(' ', '-')
      const str = `${twitterLink}, 2022`
      const result = await handler.handle(str, author)
      expect(result).to.eq(MessageHandler.STATUS.DB_SUCCESS)
    })
    
  })

  describe("#splitMessage", () => {
    let handler:MessageHandler
    before( () => {
      handler = new MessageHandler()
    })
    it('#splitMessage expected', () => {
      const message = "https://twitter.com/moonbirds,2022"
      const [twitterLink, launchDate] = handler.splitMessage(message)
      expect(twitterLink).to.eq("https://twitter.com/moonbirds")
      expect(launchDate).to.eq('2022')
    })
    it('#splitMessage extra spaces', () => {
      const message = "   https://twitter.com/moonbirds  ,   2022 "
      const [twitterLink, launchDate] = handler.splitMessage(message)
      expect(twitterLink).to.eq("https://twitter.com/moonbirds")
      expect(launchDate).to.eq('2022')   
    })
    it('#splitMessage no launch date', () => {
      const message = "https://twitter.com/moonbirds"
      const [twitterLink, launchDate] = handler.splitMessage(message)
      expect(twitterLink).to.eq("https://twitter.com/moonbirds")
      expect(launchDate).to.eq(undefined)   
    })
    it('#splitMessage garbage input', () => {
      const message = "thisisgarbage!@#"
      const [twitterLink, launchDate] = handler.splitMessage(message)
      expect(twitterLink).to.eq(message)
      expect(launchDate).to.eq(undefined)   
    })
  })

})