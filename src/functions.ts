import chalk from "chalk"
import {
    Collection,
    Guild,
    GuildMember,
    Message,
    PermissionFlagsBits,
    PermissionResolvable, Snowflake,
    TextChannel
} from "discord.js"
import GuildDB from "./schemas/Guild"
import { GuildOption } from "./types"
import mongoose from "mongoose";

type colorType = "text" | "variable" | "error"

const themeColors = {
    text: "#ff8e4d",
    variable: "#ff624d",
    error: "#f5426c"
}

export const enum ButtonType {
    Mute = 'mute',
    Unmute = 'unmute'
}

export const getThemeColor = (color: colorType) => Number(`0x${themeColors[color].substring(1)}`)

export const color = (color: colorType, message: any) => {
    return chalk.hex(themeColors[color])(message)
}

export const checkPermissions = (member: GuildMember, permissions: Array<PermissionResolvable>) => {
    let neededPermissions: PermissionResolvable[] = []
    permissions.forEach(permission => {
        if (!member.permissions.has(permission)) neededPermissions.push(permission)
    })
    if (neededPermissions.length === 0) return null
    return neededPermissions.map(p => {
        if (typeof p === "string") return p.split(/(?=[A-Z])/).join(" ")
        else return Object.keys(PermissionFlagsBits).find(k => Object(PermissionFlagsBits)[k] === p)?.split(/(?=[A-Z])/).join(" ")
    })
}

export const sendTimedMessage = (message: string, channel: TextChannel, duration: number) => {
    channel.send(message)
        .then(m => setTimeout(async () => (await channel.messages.fetch(m)).delete(), duration))
    return
}

export const getGuildOption = async (guild: Guild, option: GuildOption) => {
    if (mongoose.connection.readyState === 0) throw new Error("Database not connected.")
    let foundGuild = await GuildDB.findOne({ guildID: guild.id })
    if (!foundGuild) return null;
    return foundGuild.options[option]
}

export const setGuildOption = async (guild: Guild, option: GuildOption, value: any) => {
    if (mongoose.connection.readyState === 0) throw new Error("Database not connected.")
    let foundGuild = await GuildDB.findOne({ guildID: guild.id })
    if (!foundGuild) return null;
    foundGuild.options[option] = value
    foundGuild.save()
}

export const getRelatedMembers = (member: GuildMember) => {
    //get a voice channel id you are currently in
    const voiceChannelId = member.voice.channel?.id;
    //pull all members from specific voice
    return (voiceChannelId ? member.guild?.channels.cache.get(voiceChannelId)?.members : []) as Collection<Snowflake, GuildMember>;
}

export const hasPermissions = (member :GuildMember) =>
    member.permissions.has(PermissionFlagsBits.Administrator) ||
    member.permissions.has(PermissionFlagsBits.MuteMembers)

export const toggleMute = async (member: GuildMember, state: boolean) => {
    if (member && !hasPermissions(member)) {
        member.send(`you don't have permissions for that`)
        return;
    }
    await toggleMuteByMemberList(getRelatedMembers(member), state);
}

export const toggleMuteByMemberList = async (members :Collection<Snowflake, GuildMember>, state: boolean) => {
    members.forEach((member :GuildMember) => {
        if(!hasPermissions(member)) {
            member.voice.setMute(state);
        } else {
            console.log(`can't change: ${member.user.username}`);
        }
    });
}

export const toggleVoiceByButton = async (member: GuildMember, buttonType: ButtonType) => {
    switch (buttonType) {
        case ButtonType.Mute:
            toggleMute(member, true);
            return true;
        case ButtonType.Unmute:
            toggleMute(member, false);
            return false;
        default:
            member.send('An error!');
            return false;
    }
}