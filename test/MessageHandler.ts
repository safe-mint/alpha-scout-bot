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

  describe("#twitterHandleMatch", () => {
    let handler:MessageHandler
    let message:string
    before( () => {
      handler = new MessageHandler()
    })  
    it("upper and lowercase", () => {
      message = "https://twitter.com/MoonbirdsXYZ" 
      expect(handler.twitterHandleMatch(message)).to.eq("MoonbirdsXYZ")
    })
    it("numbers and underscores", () => {
      message = "https://twitter.com/_Boonbirds99"
      expect(handler.twitterHandleMatch(message)).to.eq("_Boonbirds99")
    })
    it("http not https", () => {
      message = "http://twitter.com/MoonbirdsXYZ"
      expect(handler.twitterHandleMatch(message)).to.eq("MoonbirdsXYZ")
    })
    it("has no protocol https", () => {
      message = "twitter.com/MoonbirdsXYZ"
      expect(handler.twitterHandleMatch(message)).to.eq("MoonbirdsXYZ")
    })
    it("has mobile/www subdomain", () => {
      message = "mobile.twitter.com/MoonbirdsXYZ"
      expect(handler.twitterHandleMatch(message)).to.eq("MoonbirdsXYZ")
      message = "www.twitter.com/MoonbirdsXYZ"
      expect(handler.twitterHandleMatch(message)).to.eq("MoonbirdsXYZ")
    })
    it("has a comma/period/bar delimiter", () => {
      message = "https://twitter.com/_GoeyGeese1,April 5, 2023"
      expect(handler.twitterHandleMatch(message)).to.eq("_GoeyGeese1")
      message = "https://twitter.com/_GoeyGeese1.April 5, 2023"
      expect(handler.twitterHandleMatch(message)).to.eq("_GoeyGeese1")
      message = "https://twitter.com/_GoeyGeese1|April 5, 2023"
      expect(handler.twitterHandleMatch(message)).to.eq("_GoeyGeese1")
    })
    it("has a query string", () => {
      message = "https://mobile.twitter.com/Moonbirds55_?t=yUnZi2HaVMlwaSGs_Dyzxw&s=09,2023"
      expect(handler.twitterHandleMatch(message)).to.eq("Moonbirds55_")
    })
    it("receives garbage", () => {
      message = "twat.com/NoNadaNothing"
      expect(handler.twitterHandleMatch(message)).to.be.undefined
      message = "twitter.com"
      expect(handler.twitterHandleMatch(message)).to.be.undefined
      message = "twitter.com/"
      expect(handler.twitterHandleMatch(message)).to.be.undefined
      message = "twitter.com/!!!"
      expect(handler.twitterHandleMatch(message)).to.be.undefined
    })
  })

  describe("#urlMatch", () => {
    let handler:MessageHandler
    before( () => {
      handler = new MessageHandler()
    })
    it("with date ending", () => {
      const url = "https://mobile.twitter.com/Moonbirds55_ April 5, 2023"
      expect(handler.urlMatch(url)).to.eq("https://mobile.twitter.com/Moonbirds55_")
    })
    it("with query string and comma delimiter", () => {
      const url = "https://twitter.com/Moonbirds55_?t=yUnZi2HaVMlwaSGs_Dyzxw&s=09,April 5, 2023"
      expect(handler.urlMatch(url)).to.eq("https://twitter.com/Moonbirds55_?t=yUnZi2HaVMlwaSGs_Dyzxw&s=09")
    })
    it("period delimiter will be included in url (unexpected!)", () => {
      const url = "https://www.twitter.com/Moonbirds55_?t=yUnZi2HaVMlwaSGs_Dyzxw&s=09.April 5, 2023"
      expect(handler.urlMatch(url)).to.eq("https://www.twitter.com/Moonbirds55_?t=yUnZi2HaVMlwaSGs_Dyzxw&s=09.April")
    })
  })

  describe("#parseLaunchDate", () => {
    let handler:MessageHandler
    before( () => {
      handler = new MessageHandler()
    })
    it("space delimited", () => {
      const message = "https://twitter.com/_GoeyGeese1 2023"
      expect(handler.parseLaunchDate(message)).to.eq("2023")
    })
    it("space delimited with date with comma", () => {
      const message = "https://twitter.com/_GoeyGeese1 April 5, 2023"
      expect(handler.parseLaunchDate(message)).to.eq("April 5, 2023")
    })
    it("comma delimited", () => {
      const message = "https://twitter.com/_GoeyGeese1,2023"
      expect(handler.parseLaunchDate(message)).to.eq("2023")
    })
    it("url with query string, comma delimited", () => {
      const message = "https://mobile.twitter.com/Moonbirds55_?t=yUnZi2HaVMlwaSGs_Dyzxw&s=09,April 5, 2023"
      expect(handler.parseLaunchDate(message)).to.eq("April 5, 2023")
    })
    it("period delimited", () => {
      // this will capture what's after the period in the url
      const message = "https://mobile.twitter.com/Moonbirds55_?t=yUnZi2HaVMlwaSGs_Dyzxw&s=09.April 5, 2023"
      expect(handler.parseLaunchDate(message)).to.eq("5, 2023")
    })
  })

})