import { Airtabler } from './Airtabler'
import { GoogleSheetReader } from './GoogleSheetReader';

export class MessageHandler {
  
  constructor() {
    this.status = MessageHandler.STATUS.NONE;
  }
  status: MessageHandler.STATUS;

  twitterHandleMatch(message: string) : string | undefined {
    const twitterHandle = message.match(/twitter\.com\/(?<twitterHandle>[a-zA-Z0-9_]+)/)
    return twitterHandle?.groups?.twitterHandle
  }

  urlMatch(url: string) : string | undefined {
    const urlMatch = url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g)
    return urlMatch?.[0]
  }

  parseLaunchDate(message: string, twitterHandle:string|undefined=undefined) : string | undefined {
    if(!twitterHandle) {
      twitterHandle = this.twitterHandleMatch(message)
    }
    const url = this.urlMatch(message)
    if (!url) {
      throw Error(`There is not URL in this message: "${message}"`)
    }
    let launchDate = message.replace(url, '')
    // replace all non-alphanumeric at the start or end of string
    launchDate = launchDate.replace(/^[^a-z\d]*|[^a-z\d]*$/gi, '') 
    return launchDate
  }


  async handle(message: string, author: string) {
    const twitterHandle = this.twitterHandleMatch(message)
    if (!twitterHandle) {
      this.status = MessageHandler.STATUS.BAD_TWITTER_LINK
      return this.status
    }
    const twitterLink = `https://twitter.com/${twitterHandle}`
    const launchDate = this.parseLaunchDate(message, twitterHandle)

    if(!twitterLink) {
      this.status = MessageHandler.STATUS.BAD_TWITTER_LINK
      return this.status
    }

    if (await this.doesRecordExist(twitterLink)) {
      this.status = MessageHandler.STATUS.DUPLICATE_RECORD
      return this.status   
    }
    const airtabler = new Airtabler()
    try {
      const records = await airtabler.createRecord(twitterLink, launchDate, author)
      if(records && records.length > 0) {
        return MessageHandler.STATUS.DB_SUCCESS
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'test') {
        console.log('error saving to DB')
        console.log(err)
      }
      return MessageHandler.STATUS.DB_SAVING_ERROR
    }
    

  }

  async doesRecordExist(twitterLink:string) : Promise<boolean> {
    const airtabler = new Airtabler()
    const records = await airtabler.findRecord(twitterLink)
    if (records && records.length > 0) {
      return true
    }
    const reader = new GoogleSheetReader()
    const lowerCaseTwitter = twitterLink.toLowerCase()
    const sheetEntries = await reader.readData()
    if( sheetEntries?.includes(lowerCaseTwitter) ) {
      return true
    }
    return false
  }
}


export namespace MessageHandler
{
  export enum STATUS
  {
    NONE = 0,
    BAD_TWITTER_LINK,
    DB_SUCCESS,
    DUPLICATE_RECORD,
    DB_SAVING_ERROR
  }
}
