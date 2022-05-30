import { Airtabler } from './Airtabler'
import { GoogleSheetReader } from './GoogleSheetReader';

export class MessageHandler {
  
  constructor() {
    this.status = MessageHandler.STATUS.NONE;
  }
  status: MessageHandler.STATUS;

  splitMessage(message: string) : string[] {
    let split = message.split(',')
    const twitterLink = split[0]?.trim()?.toLowerCase()
    const launchDate = split[1]?.trim()
    return [twitterLink, launchDate]
  }



  async handle(message: string, author: string) {
    const [twitterLink, launchDate] = this.splitMessage(message)

    if (!launchDate) {
      this.status = MessageHandler.STATUS.NO_LAUNCH_DATE
      return this.status;
    }

    if (!twitterLink.startsWith("https://twitter.com/")) {
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
      console.log('error saving to DB')
      console.log(err)
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
    const sheetEntries = await reader.readData()
    console.log(sheetEntries)
    if( sheetEntries?.includes(twitterLink) ) {
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
    NO_LAUNCH_DATE,
    BAD_TWITTER_LINK,
    DB_SUCCESS,
    DUPLICATE_RECORD,
    DB_SAVING_ERROR
  }
}
