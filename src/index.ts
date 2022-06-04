import DiscordJS, { Intents } from 'discord.js'
import { MessageHandler } from './MessageHandler'

const client = new DiscordJS.Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ]
})


client.on("ready", () => {
  console.log("the bot is ready")
})

function messageUsername(message:DiscordJS.Message<boolean>) {
  return message.author.username + "#" + message.author.discriminator
}

const EXAMPLES = "for example\nhttps://twitter.com/ChunkyChihuahuas\nor\nhttps://mobile.twitter.com/GrumpyGremplins\n\nif you know the estimated launch date, you can add it after the twitter link, like \nhttps://mobile.twitter.com/PuffyPandas September 14, 2023"

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const handler = new MessageHandler()
  const result = await handler.handle(message.content, messageUsername(message))
  if (result == MessageHandler.STATUS.BAD_TWITTER_LINK) {
    message.reply({ content: `invalid format: please start with a Twitter link (i.e. it should start with https://www.twitter.com/)\n${EXAMPLES}`})
  } else if (result === MessageHandler.STATUS.DB_SUCCESS) {
    message.reply({ content: "thank you! successfully saved" })
  } else if (result === MessageHandler.STATUS.DUPLICATE_RECORD) {
    message.reply({ content: "that NFT project has already been added"})
  } else if (result == MessageHandler.STATUS.DB_SAVING_ERROR) {
    message.reply({ content: "ERROR saving to the database, please contact admin"})
  }

})

client.login(process.env.DISCORD_BOT_TOKEN)