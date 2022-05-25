import {MessageHandler} from '../src/MessageHandler'
import {expect} from 'chai'

describe('MessageHandler', () => {
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