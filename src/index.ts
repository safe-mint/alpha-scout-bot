import DiscordJS, { Intents } from 'discord.js'
import dotenv from 'dotenv'
import Airtable, { FieldSet, Records } from 'airtable'
dotenv.config()





const { AIRTABLE_API_KEY, AIRTABLE_BASE } = process.env; 
const AIRTABLE_TABLE_NAME = "Alpha Spam"
var base = new Airtable({apiKey: AIRTABLE_API_KEY}).base(AIRTABLE_BASE!);

function createRecord(twitterLink:string, launchDate:string, author:string) {
  console.log("createRecord()")
  base(AIRTABLE_TABLE_NAME).create([
    {
      "fields": {
        "Twitter Link": twitterLink,
        "Author": author,
        "Launch Date": launchDate
      }
    },
  ], function(err, records) {
    if (err) {
      console.error(err);
      return;
    }
    records?.forEach(function (record) {
      console.log(record.getId());
    });
  });
}

function findRecord(twitterLink:string) : Promise<Records<FieldSet> | undefined> {
  return new Promise((resolve, reject) => {
    base(AIRTABLE_TABLE_NAME).select({
      view: 'Grid view',
      filterByFormula: `({Twitter Link} = '${twitterLink}')`
    }).firstPage(function(err, records) {
        if (err) { console.error(err); reject(err); }
        resolve(records)
    });
  });
}





const client = new DiscordJS.Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ]
})


// const r = findRecord("https://twitter.com/a_new_nft_project")
// r.then((records) => console.log(records))

client.on("ready", () => {
  console.log("the bot is ready")
})

function messageUsername(message:DiscordJS.Message<boolean>) {
  return message.author.username + "#" + message.author.discriminator
}

const EXAMPLES = "for example\nhttps://twitter.com/a_new_nft_project , Q3\nor\nhttps://twitter.com/a_new_nft_project , April 17, 2020"
const INVALID_FORMAT = `invalid format: please use \n[twitter_link],[launch date]\n${EXAMPLES}`

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  //console.log(message.author)
  const result = await handleMessage(message.content, messageUsername(message))
  if (result === MESSAGE.NO_LAUNCH_DATE) {
    message.reply({ content: INVALID_FORMAT })
  } else if (result == MESSAGE.BAD_TWITTER_LINK) {
    message.reply({ content: `invalid format: first parameter should be Twitter link (i.e. it should start with https://www.twitter.com/)\n${EXAMPLES}`})
  } else if (result === MESSAGE.DB_SUCCESS) {
    message.reply({ content: "thank you! successfully saved" })
  } else if (result === MESSAGE.DUPLICATE_RECORD) {
    message.reply({ content: "that NFT project has already been added"})
  }

})

client.login(process.env.DISCORD_BOT_TOKEN)