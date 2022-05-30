import {Airtabler} from '../src/Airtabler'
import {expect} from 'chai'
import dotenv from 'dotenv'
dotenv.config()


describe('Airtabler', async () => {
  it('#createRecord', async () => {
    const airtabler = new Airtabler("Alpha Scout (test)")
    const twitterLink = "https://twitter.com/a_new_nft_project44"
    const launchDate = "March 2023"
    const author = "mintyMcMintable#9999"
    const records = await airtabler.createRecord(twitterLink, launchDate, author)
    expect(records!.length).to.eq(1)
    const record = records![0]
    expect(record.fields['Twitter Link']).to.eq(twitterLink)
    expect(record.fields['Launch Date']).to.eq(launchDate)
    expect(record.fields['Author']).to.eq(author)
  })

  it('#findRecord', async () => {
    const airtabler = new Airtabler("Alpha Scout (test)")
    const twitterLink = "https://twitter.com/a_new_nft_project44"
    const records = await airtabler.findRecord(twitterLink)
    expect(records!.length).to.be.greaterThan(1)
    expect(records![0].fields["Twitter Link"]).to.eq(twitterLink)
  })
})