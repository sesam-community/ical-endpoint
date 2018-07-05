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
  return moment(new Date(transitDate.slice(2))).format('YYYYMMDD');
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
    response.write("BEGIN:VCALENDAR\r\n");
    response.write("VERSION:2.0\r\n");
    body.forEach(function (entity) {
      response.write("BEGIN:VEVENT\r\n");
      response.write(`UID:${entity.uid}\r\n`);
      response.write(`SUMMARY:${entity.summary}\r\n`);
      response.write(`DTSTART;VALUE=DATE:${formatIcal(entity.start)}\r\n`);
      response.write(`DTEND;VALUE=DATE:${formatIcal(entity.end)}\r\n`);
      response.write("END:VEVENT\r\n");
    });
    response.end("END:VCALENDAR\r\n");
  });
});

// Listen on port 5000, IP defaults to 127.0.0.1
app.listen(5000, "0.0.0.0", function () {
  console.log("Server running at http://0.0.0.0:5000/");
});
