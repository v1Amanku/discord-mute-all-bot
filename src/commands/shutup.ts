import {
    ChannelType,
    PermissionFlagsBits
} from "discord.js";
import {Command} from "../types";
import {toggleMute} from "../functions";

const command: Command = {
    name: "shutup",
    execute: (message, args) => {
        if(message.member) {
            switch (args[1]) {
                case 'офф':
                case 'оф':
                case 'of':
                case 'off':
                    toggleMute(message.member, true);
                    break;
                case 'вкл':
                case 'он':
                case 'on':
                    toggleMute(message.member, false);
                    break;
                default:
                    message.reply(
                        `Hey, ${message.member?.user.username}! Available params are: \`off|of|офф|оф\` \`on|вкл|он\``
                    )
                    break;
            }
        }
    },
    cooldown: 0,
    aliases: ['voice'],
    permissions: []
}
export default command