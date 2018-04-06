const axios = require("axios");

const constants = require("./constants.js");
const utils = require("./utils.js");
const {log} = require("./utils.js");

const config = require("./config.json");
const prefix = config.prefix;

exports.echo = function(message, command, argsString) {
    if (message.author.tag === "Zagd#6682") {
        message.delete().catch(O_o=>{});
        message.channel.send(argsString);
    }
};

exports.giveServerCounts = function(message, command) {
    let serverCounts = "";
    let count = 0;  // Amount of completed axios gets.
    for (let i = 0; i < constants.servers.length; i++) {
        let server = constants.servers[i];
        let address = constants.serverAddresses[server];
        axios.get(address + "stats").then(function (response) {
            count++;
            let data = response.data;
            serverCounts = serverCounts.concat(
                utils.pad(" ".repeat(10), server + ":", false) +
                utils.pad("00", data.players, true) +
                " players and " +
                utils.pad("00", data.games, true) +
                " games.\n"
            );
            if (count === constants.servers.length) {
                message.channel.send("```" + serverCounts + "```");
            }
        }).catch(function (error) {
            log(error);
        });
    }
};