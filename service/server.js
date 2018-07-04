var express = require('express');
var morgan = require('morgan');
var url = require('url');
var request = require('request');
var moment = require('moment');

var dataset = process.env.URL;
var jwt = process.env.JWT || '';

var app = express();

app.use(morgan('tiny'));

function formatIcal(transitDate) {
  return moment(new Date(transitDate.slice(2))).utc().format('YYYYMMDDTHHmmss') + 'Z';
}

// Configure router to respond with a list of entities to /entities
app.get("/ical", function (req, response) {
  var since = url.parse(req.url, true).query.since;
  var options = {
    json: true,
    headers: {
      'Authorization': `bearer ${jwt}`
    }
  };
  request(dataset, options, function(error, r, body){
    if (error) {
      response.status(500).send(err);
      return;
    }
    response.writeHead(200, {"Content-Type": "text/calendar"});
    response.write("BEGIN:VCALENDARDo \n");
    response.write("VERSION:2.0\n");
    body.forEach(function (entity) {
      response.write("BEGIN:VEVENT\n");
      response.write(`UID:${entity.uid}\n`);
      response.write(`SUMMARY:${entity.summary}\n`);
      response.write(`DTSTART:${formatIcal(entity.start)}\n`);
      response.write(`DTEND:${formatIcal(entity.end)}\n`);
      response.write("END:VEVENT\n");
    });
    response.end("END:VCALENDAR\n");
  });
});

// Listen on port 5000, IP defaults to 127.0.0.1
app.listen(5000, "0.0.0.0", function () {
  console.log("Server running at http://0.0.0.0:5000/");
});
