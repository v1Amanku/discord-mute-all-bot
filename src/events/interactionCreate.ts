import { GuildMember, Interaction} from "discord.js";
import { BotEvent } from "../types";
import {ButtonType, toggleVoiceByButton} from "../functions";

const event : BotEvent = {
    name: "interactionCreate",
    execute: async (interaction: Interaction) => {
        if(interaction.isButton()) {
            try {
                const member = interaction.member as GuildMember;
                if(!member.voice.channel?.id) {
                    await interaction.reply({ content: 'Jump into a channel first :)', ephemeral: true});
                } else {
                    const isMutedClicked = await toggleVoiceByButton(
                        member,
                        interaction.customId as ButtonType
                    );
                    const messageReply = isMutedClicked ?
                        'You`ve just muted everyone! ' :
                        'Let them speak while then can...';
                    await interaction.reply({ content: messageReply, ephemeral: true });
                }
            } catch (e) {
                console.error(e);
            }

        } else if (interaction.isChatInputCommand()) {
            let command = interaction.client.slashCommands.get(interaction.commandName)
            let cooldown = interaction.client.cooldowns.get(`${interaction.commandName}-${interaction.user.username}`)
            if (!command) return;
            if (command.cooldown && cooldown) {
                if (Date.now() < cooldown) {
                    interaction.reply(`You have to wait ${Math.floor(Math.abs(Date.now() - cooldown) / 1000)} second(s) to use this command again.`)
                    setTimeout(() => interaction.deleteReply(), 5000)
                    return
                }
                interaction.client.cooldowns.set(`${interaction.commandName}-${interaction.user.username}`, Date.now() + command.cooldown * 1000)
                setTimeout(() => {
                    interaction.client.cooldowns.delete(`${interaction.commandName}-${interaction.user.username}`)
                }, command.cooldown * 1000)
            } else if (command.cooldown && !cooldown) {
                interaction.client.cooldowns.set(`${interaction.commandName}-${interaction.user.username}`, Date.now() + command.cooldown * 1000)
            }
            command.execute(interaction)
        } else if (interaction.isAutocomplete()) {
            const command = interaction.client.slashCommands.get(interaction.commandName);
            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }
            try {
                if(!command.autocomplete) return;
                command.autocomplete(interaction);
            } catch (error) {
                console.error(error);
            }
        }
    }
}

export default event;