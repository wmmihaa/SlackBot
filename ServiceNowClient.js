
var request = require('request');
var querystring = require('querystring');

function ServiceNowClient() {
    // ServiceNow token
    var token = process.env.SNTOKEN;

    ServiceNowClient.prototype.myTickets = function (email, callback) {

        // Build query parameters
        var params = querystring.stringify({
            "sysparm_display_value": true,
            "sysparm_limit": 10,
            "active": true,
            "caller_id.email": email
        });

        // Build URI options with auth token
        var urlOptions = {
            url: 'https://axprod.service-now.com/api/now/table/task?' + params,
            auth: { 'bearer': token }
        };

        request(urlOptions, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var tickets = JSON.parse(body);
                callback(null, tickets.result);
            }
            else {
                callback({ error: response.statusCode }, null);
            }
        });
    }
    ServiceNowClient.prototype.createIncident = function (incident, callback) {

        // Build URI options with auth token
        var urlOptions = {
            headers: { 'content-type': 'application/json', 'Accept': 'application/json' },
            url: 'https://axprod.service-now.com/api/now/table/u_incident_qnet_import',
            auth: { 'bearer': token },
            body: JSON.stringify(incident)
        };

        var temp = JSON.stringify(incident);

        request.post(urlOptions, function (error, response, body) {
            if (error) {
                callback(error, null);
            }
            else {
                var incident = JSON.parse(body);
                var incidentId = incident.result.sys_target_sys_id.value;
                callback(null, incidentId);
            }
        });
    }
}
module.exports = ServiceNowClient;