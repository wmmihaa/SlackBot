

var botToken = process.env.BOTTOKEN;
//ddd
var Slack = require('slack-node');
var slack = new Slack(botToken); // Slack API
var Bot = require('slackbots'); // Slack bot

// Setting up slack bot
var botSettings = {
    token: botToken,
    name: 'microServiceBus.bot'
};
var bot = new Bot(botSettings);

// The botParams is used to set the bot icon and is used in every call
var botParams = {
    icon_url: "https://avatars.slack-edge.com/2017-01-03/122705470658_243676c956ff5f237ec7_48.png"
};

// Setting up the ServiceNow client
var ServiceNowClient = require('./ServiceNowClient.js');
var serviceNowClient = new ServiceNowClient();

// Event trigged when bot gets started
bot.on('start', function () {
    console.log("Started");
});

// Event trigged when a message is sent to the bot
bot.on('message', function (msg) {
    if (msg.type === 'message' && msg.username != botSettings.name) { // Avoid reading its own messages

        var userId = msg.user; // Internal userid for the bot 
        var command = msg.text; // The acual message sent to the bot

        // First, lets get the user profile (email, name etc).
        slack.api("users.info", { user: userId }, function (err, response) {

            var user = response.user;

            // JUST FOR MIKAEL
            if (user.profile.email == "wmmihaa@hotmail.com") {
                user.profile.email = "mikael.hakansson@axians.se";
            }

            // Which command has been called
            // Get all my tickets
            if ((command.toUpperCase() === "MY TICKETS") || (command.toUpperCase() === "TICKETS")) {

                // Calls using ServiceNow client
                serviceNowClient.myTickets(user.profile.email, function (err, tickets) {

                    if (!err) { // No errors

                        if (tickets.length > 0) { // Has tickets
                            tickets.forEach(function (ticket) {
                                var response = "_" + ticket.number + "_ - *" + ticket.short_description + "*\n\n" + ticket.comments;
                                bot.postMessageToUser(user.name, response, botParams);
                            });
                        }
                        else { // No tickets
                            bot.postMessageToUser(user.name, "You have no open tickets " + user.profile.first_name, botParams);
                        }
                    }
                    else { // Some error occurd
                        bot.postMessageToUser(user.name, "An error occurd trying to get your tickets", botParams);
                    }
                });
            }

            // Create incident (either using "create incident ..." or "ci ...")
            else if (command.toUpperCase().startsWith("CREATE INCIDENT") || command.toUpperCase().startsWith("CI")) {
                // To parse the command I'm using regular expression since users might use quotes. Eg ci "here is one quote" "here is another"
                var args = command.match(/\w+|"(?:\\"|[^"])+"/g);

                // Strip of command ("CREATE INCIDENT" or "CI"). This leaves the actual parameters which should be 3
                args = args[0].toUpperCase() === "CI" ? args.splice(1) : args.splice(2);

                if (args.length != 3) { // Missing parameters
                    bot.postMessageToUser(user.name, 'Incufficient parameters for creating an incident.\n Please try:\n*create incident* _title description category_\nEg:\n_create incident "Account locked" "I seem to have looked my account" Account_', botParams);
                }
                else {
                    var title = args[0];
                    var description = args[1];
                    var category = args[2];

                    // Allowed categories 
                    var categories = ["account", "filesandfolders", "hardware", "mail", "network", "noc", "other", "phone", "printer", "software", "security", "iot"];

                    // Check if the category is known...
                    if (categories.find(function (c) { return c === category }) === undefined) { // Unknown category
                        bot.postMessageToUser(user.name, 'The category (' + category + ') is not valid. The valid ones are:\n*account\n*filesandfolders\n*hardware\n*mail\n*network\n*noc\n*other\n*phone\n*printer\n*software\n*security\n*iot', botParams);
                    }
                    else {
                        // All good. Let's create the incident
                        var incident = {
                            "short_description": title.replaceAll('"', ''), // If user has used quotes, remove them
                            "caller_id": user.profile.email,
                            "category": category,
                            "description": description.replaceAll('"', ''), // If user has used quotes, remove them
                            "priority": 1
                        }

                        // Call ServiceNow
                        serviceNowClient.createIncident(incident, function (err, incidentId) {
                            if (err) {
                                bot.postMessageToUser(user.name, "Sorry " + user.profile.first_name + ", I wasn't able to create the incident", botParams);
                            }
                            else {
                                var uri = "https://axprod.service-now.com/nav_to.do?uri=incident.do?sys_id=" + incidentId;
                                bot.postMessageToUser(user.name, 'Success ' + user.profile.first_name + ". You incident has been created.\nTo view it, click this link: " + uri, botParams);
                            }
                        });
                    }
                }
            }
            // The command is not known
            else {
                var response = 'Hi ' + user.profile.first_name + ', these are the commands I know of:\n -*my tickets*\n -*all tickets*\n -*create incident* _title description category_';
                bot.postMessageToUser(user.name, response, botParams, function (data) {
                    console.log(data);
                });
            }
        });
    }
});

// This prototype adds a replaceAll method to any string. The existing replace method only replaces the first found occurance
String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};