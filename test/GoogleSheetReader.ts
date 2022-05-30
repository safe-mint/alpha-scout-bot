import {GoogleSheetReader} from '../src/GoogleSheetReader'
import {expect} from 'chai'


describe('GoogleSheetReader', async () => {
  it('#readData expected', async () => {
    const reader = new GoogleSheetReader()
    const data = await reader.readData()
    expect(data!.includes("https://twitter.com/LonelyPopNFT")).to.be.false // case does not match
    expect(data!.includes("https://twitter.com/lonelypopnft")).to.be.true
    expect(data!.includes("https://twitter.com/metapeeps")).to.be.true
  })
})