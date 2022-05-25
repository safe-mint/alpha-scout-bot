

export class MessageHandler {
  
  constructor() {
    this.error = MessageHandler.ERROR.NONE;
  }
  error: MessageHandler.ERROR;

  splitMessage(message: string) : string[] {
    let split = message.split(',')
    const twitterLink = split[0]?.trim()
    const launchDate = split[1]?.trim()
    return [twitterLink, launchDate]
  }

  async handle(message: string, author: string) {
    const [twitterLink, launchDate] = this.splitMessage(message)

    if (!launchDate) {
      this.error = MessageHandler.ERROR.NO_LAUNCH_DATE; 
      return this.error;
    }

    if (!twitterLink.startsWith("https://twitter.com/")) {
      this.error = MessageHandler.ERROR.BAD_TWITTER_LINK;
      return this.error
    }

    // const records = await findRecord(twitterLink)
    // console.log(records)
    // console.log(records!.length)
    // if(records!.length > 0) {
    //   return MESSAGE.DUPLICATE_RECORD
    // }
    // createRecord(twitterLink, launchDate, author)
    // return MESSAGE.DB_SUCCESS
  }
}

export namespace MessageHandler
{
  export enum ERROR
  {
    NONE = 0,
    NO_LAUNCH_DATE,
    BAD_TWITTER_LINK,
    DB_SUCCESS,
    DUPLICATE_RECORD
  }
}
