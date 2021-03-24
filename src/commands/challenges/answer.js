const fs = require("fs");
const file = require(`${process.cwd()}/src/data/challenge.json`);

const cooldown = new Set();

module.exports = {
    name: "answer",
    aliases: ["ans"],
    desc: "set and guess answer/role for math challenge",
    syntax: "ans <guess>, ans role <role>, ans set <answer>",
    execute(msg, args, client) {

        // Print syntax
        if (!args[0]) {
            return msg.channel.send(`Syntax: ${this.syntax}`);
        }

        // Get command
        if (args[0] == "set") {
            // Check if in server
            if (msg.channel.type == "dm") {
                return;
            }

            // Only administrators can execute this command
            if (!msg.member.hasPermission("ADMINISTRATOR") && msg.author.id != msg.guild.ownerID) {
                return msg.channel.send("Only administrators can run this command.");
            }

            // Print syntax
            if (!args[1]) {
                return msg.channel.send(`Syntax: ${this.syntax}`);
            }

            // Check if integer
            if (isNaN(args[1])) {
                return msg.channel.send("The answer has to be an integer.");
            }

            file.answer = Number.parseInt(args[1]);

            fs.writeFile(`${process.cwd()}/src/data/challenge.json`, JSON.stringify(file, null, "\t"), function writeJSON(e) {
                if (e) {
                    console.log(e);
                }
            });

            // Send confirmation
            return msg.channel.send(`Successfully set answer as ${Number.parseInt(args[1])}.`);
        } else if (args[0] == "role") {
            // Check if in server
            if (msg.channel.type == "dm") {
                return;
            }

            // Only administrators can execute this command
            if (!msg.member.hasPermission("ADMINISTRATOR") && msg.author.id != msg.guild.ownerID) {
                return msg.channel.send("Only administrators can run this command.");
            }

            // Print syntax
            if (!args[1]) {
                return msg.channel.send(`Syntax: ${this.syntax}`);
            }

            // Parse role mention
            let role_id = (args[1].startsWith("<@&") && args[1].endsWith(">")) ? args[1].slice(3, -1) : args[1];

            // Make sure role exists
            let role = msg.guild.roles.cache.get(role_id);

            if (!role) {
                return msg.channel.send("That role does not exist.");
            }

            file.role = role_id;

            fs.writeFile(`${process.cwd()}/src/data/challenge.json`, JSON.stringify(file, null, "\t"), function writeJSON(e) {
                if (e) {
                    console.log(e);
                }
            });

            // Send confirmation
            return msg.channel.send(`Successfully set solver role as <@&${role_id}>.`);
        } else {
            // Check if dm
            if (msg.channel.type != "dm") {
                return;
            }

            // Print syntax
            if (!args[0]) {
                return msg.channel.send(`Syntax: ${this.syntax}`);
            }

            // Check if integer
            if (isNaN(args[0])) {
                return msg.channel.send("The answer has to be an integer.");
            }

            // If still on cooldown
            if (cooldown.has(msg.author.id)) {
                return msg.react("⏳");
            }

            // If correct
            if (args[0] == file.answer) {
                msg.react("✅");

                let guild = client.guilds.cache.get("732787972780589137"); // Guild

                return guild.members.cache.get(msg.author.id).roles.add(guild.roles.cache.get(file.role));
            }


            // If wrong
            msg.react("❌");

            // Add cooldown
            cooldown.add(msg.author.id);
            
            return setTimeout(() => cooldown.delete(msg.author.id), 60000);
        }
    }
}
