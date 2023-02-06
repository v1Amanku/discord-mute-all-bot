import {ActionRowBuilder, ButtonBuilder, Message, PermissionFlagsBits} from "discord.js";
import { Command } from "../types";

const command : Command = {
    name: "greet",
    execute: (message, args) => {
        buildButton(message);
    },
    cooldown: 300,
    aliases: ["panel", "buttons"],
    permissions: ["Administrator"]
}

export default command

const buildButton = async (message :Message) => {
    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents([
                new ButtonBuilder()
                .setCustomId('mute')
                .setLabel('Mute all')
                .setStyle(4),
                new ButtonBuilder()
                .setCustomId('unmute')
                .setLabel('Unmute all')
                .setStyle(3)
        ]);

    await message.reply({ content: 'What do you want to do in the chat you are currently in?', components: [row] });
};