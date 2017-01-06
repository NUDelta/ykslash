var app = require('express')();
var bodyParser = require('body-parser');
var request = require('request');
var sprint_keys = require('./sprint_keys.js');

var VERIFY_TOKEN = process.env.SLACK_VERIFY_TOKEN
if (!VERIFY_TOKEN) {
  console.error('SLACK_VERIFY_TOKEN is required');
  process.exit(1);
}

var SLACK_TOKEN = process.env.SLACK_TOKEN
if (!SLACK_TOKEN) {
  console.error('SLACK_TOKEN is required')
  process.exit(1);
}

// Use Beep Boop provided PORT - 8000 for dev
var PORT = process.env.PORT || 8000

// Slack team names:ids
var user_ids = {};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function getSprints(username, base_response) {
  var response_text;

  if (username in sprint_keys) {
    var urls = sprint_keys[username];

    response_text = base_response;
    for (var sprint in urls) {
      response_text += 'http://drive.google.com/open?id=' + urls[sprint] + '\n';
    }
  }
  else {
    response_text = 'Sorry, I don\'t recognize you!'
  }

  return response_text;
}

app.post('/sprint', function(req, res) {
  if (req.body.token != VERIFY_TOKEN) {
    return res.status(401).send('Unauthorized');
  }

  var stella_response = {
    username: "Stella",
    icon_emoji: ":stella:"
  }

  var sent_text = req.body.text;
  var sender = req.body.user_name;
  var response_text;
  var response_type = 'in_channel';

  if (sent_text == '') {
    response_text = getSprints(sender, 'Your sprint(s): ');
  }
  else if (sent_text == 'help') {
    response_text = 'Type `/sprint` to get your own sprint, or `/sprint @<username> to get a teammates!`';
    response_type = 'ephemeral';
  }
  else if (sent_text.slice(1) in sprint_keys) {
    response_text = getSprints(sent_text.slice(1), sent_text + "'s sprint(s): ");
  }
  else {
    console.log(sent_text);
    response_text = 'Sorry, I didn\'t understand that!';
  }

  res.status(200).send(Object.assign(stella_response, {
    text: response_text,
    response_type: response_type,
  }));
});

app.get('/sprint', function(req, res) {
  res.status(200).send('Ok');
});

app.listen(PORT, function(err) {
  if (err) {
    return console.error('Error spinning up', err);
  }

  var url = 'https://slack.com/api/users.list';
  var propertiesObject = {
    token: SLACK_TOKEN
  };

  console.log('Fetching team members...');
  request({url:url, qs:propertiesObject}, function(err, response, body) {
    if (err) {
      return console.error('Unable to fetch team members!', err);
    }
    else {
      JSON.parse(body).members.forEach(function(e, i, a) {
        user_ids[e.name] = e.id;
      });
    }
  });

  console.log('Server started...');
});
