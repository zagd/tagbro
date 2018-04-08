const Discord = require("discord.js");

const commands = require("./command-functions.js");
const {log} = require("./utils.js");
const constants = require("./constants.js");

const config = require("./config.json");
const prefix = config.prefix;

const bot = new Discord.Client({
    disableEveryone: true
});

bot.destroy();
bot.login(process.env.BOT_TOKEN);

bot.on("ready", function () {
    log("Bot connected.");
    log("Connected to Guilds: " + bot.guilds.array());
    bot.user.setActivity("out for you.", {type: "WATCHING"});

    //TODO: consider moving below code elsewhere to tidy up this main module.
    // Set up server count message updating.
    let oltpGuild;
    let tagbroBotChannel;
    let serverCountsMessage;
    if (bot.guilds.has(constants.oltpDiscId)) {
        oltpGuild = bot.guilds.get(constants.oltpDiscId);
        if (oltpGuild.channels.has(constants.tagbrobotChannelId)) {
            tagbroBotChannel = oltpGuild.channels.get(constants.tagbrobotChannelId);
            tagbroBotChannel.fetchMessage(constants.serverCountsMessageId)
                .then(message => {
                    serverCountsMessage = message;
                    updateServerCountsMessage(serverCountsMessage);
                })
                .catch(console.error);
        }
    }
    let minutes = 2, the_interval = minutes * 60 * 1000;
    setInterval(function() {
        if (serverCountsMessage !== undefined) {
            updateServerCountsMessage(serverCountsMessage);
        }
    }, the_interval);

});

bot.on("message", message => {
    if (message.content.indexOf(config.prefix) !== 0) return;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const argsString = message.content.slice((prefix + command + " ").length);
    const regex = new RegExp("^" + prefix);
    log("Responding to " + prefix + command + ".");

    if (message.content === prefix + "server count" || message.content === prefix + "sc" ) {
        commands.giveServerCounts(message);
    }
    if (new RegExp(regex.source.concat("echo" + " .+")).test(message.content)) {
        commands.echo(message, argsString);
    }
    if (message.content === prefix + "rpugs matchmaking" || message.content === prefix + "rpm" ) {
        commands.giveRankedPugsMatchmakingLink(message);
    }
    if (message.content === prefix + "start typing" ) {
        if (message.author.tag === "Zagd#6682") {
            message.channel.startTyping();
        }
    }
    if (message.content === prefix + "stop typing" ) {
        if (message.author.tag === "Zagd#6682") {
            message.channel.stopTyping(true);
        }
    }
});

function updateServerCountsMessage(serverCountsMessage) {
    log("Updating server counts message.");
    commands.getSortedServerCounts().then(response => {
        let newServerCountsMessage = "Server counts:\n\n";
        let sortedServerCounts = response;
        let largestServerStat = commands.getLargestServerStat(sortedServerCounts);
        newServerCountsMessage = newServerCountsMessage.concat(
            "`" + commands.padServerStats(sortedServerCounts[0], largestServerStat.toString().length) + "` <" +
            constants.serverAddresses[sortedServerCounts[0][0]] + ">\n\n*Other servers:*\n"
        );
        for (let i = 1; i < sortedServerCounts.length; i++) {
            newServerCountsMessage = newServerCountsMessage.concat(
                "`" + commands.padServerStats(sortedServerCounts[i], largestServerStat.toString().length) + "` <" +
                constants.serverAddresses[sortedServerCounts[i][0]] + ">\n"
            );
        }
        newServerCountsMessage = newServerCountsMessage.concat("\n*updated every 2 minutes. use `..sc` to manually check.*");
        serverCountsMessage.edit(newServerCountsMessage);
    }).catch(console.error);
}