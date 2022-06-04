import { Airtabler } from './Airtabler'
import { GoogleSheetReader } from './GoogleSheetReader';

export class MessageHandler {
  
  constructor() {
    this.status = MessageHandler.STATUS.NONE;
  }
  status: MessageHandler.STATUS;

  parseMessage(message: string) : string[] {
    const split = message.trim().split(/ (.*)/s) // split only on the first space
    const twitterLink = split[0]?.trim().replace(/\,$/, '') // if ends in a comma, delete comma
    const launchDate = split[1]?.trim()
    return [twitterLink, launchDate]
  }


  convertTwitterToValidLink(twitterMessage: string) : string | undefined {
    const split = twitterMessage.split('?')
    let twitterLink = split[0]?.trim() // remove query string
    if (twitterLink.startsWith("https://")) {
      twitterLink = twitterLink.replace("https://", "")
    } else if (twitterLink.startsWith("http://")) {
      twitterLink = twitterLink.replace("http://", "")
    }

    if (twitterLink.startsWith("mobile.twitter.com")) {
      twitterLink = twitterLink.replace("mobile.", "")
    } else if (twitterLink.startsWith("www.twitter.com")) {
      twitterLink = twitterLink.replace("www.", "")
    }

    if (!twitterLink.startsWith("twitter.com/")) {
      return
    }
    return `https://${twitterLink}`
  }



  async handle(message: string, author: string) {
    const [twitterPart, launchDate] = this.parseMessage(message) 

    const twitterLink = this.convertTwitterToValidLink(twitterPart)

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
