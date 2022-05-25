import {GoogleSheetReader} from '../src/GoogleSheetReader'
import {expect} from 'chai'
import dotenv from 'dotenv'
dotenv.config()


describe('GoogleSheetReader', async () => {
  it('#readData expected', async () => {
    const reader = new GoogleSheetReader()
    const data = await reader.readData()
    console.log(data)
  })
})