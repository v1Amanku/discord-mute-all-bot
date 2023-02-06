import { Client, GatewayIntentBits, Collection, Events } from "discord.js";
const { Guilds, MessageContent, GuildMessages, GuildMembers, GuildVoiceStates } = GatewayIntentBits
import { Command, SlashCommand } from "./types";
import { config } from "dotenv";
import { readdirSync } from "fs";
import { join } from "path";
config()

const client = new Client({intents:[Guilds, MessageContent, GuildMessages, GuildMembers, GuildVoiceStates]})
client.slashCommands = new Collection<string, SlashCommand>()
client.commands = new Collection<string, Command>()
client.cooldowns = new Collection<string, number>()

const handlersDir = join(__dirname, "./handlers")
readdirSync(handlersDir).forEach(handler => {
    require(`${handlersDir}/${handler}`)(client)
})

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(process.env.TOKEN)
