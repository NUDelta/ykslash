var app = require('express')();
var bodyParser = require('body-parser');

var VERIFY_TOKEN = process.env.SLACK_VERIFY_TOKEN
if (!VERIFY_TOKEN) {
  console.error('SLACK_VERIFY_TOKEN is required')
  process.exit(1)
}

// Use Beep Boop provided PORT - 8000 for dev
var PORT = process.env.PORT || 8000

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/sprint', function(req, res) {
  if (req.body.token != VERIFY_TOKEN) {
    return res.status(401).send('Unauthorized');
  }

  console.log('Sprint request made!')

  var message = 'hey!';

  if (req.body.text == 'help') {
    message = 'Helping!';
  }

  res.status(200).send({
    'response_type': 'in_channel',
    'text': message,
  });
});

app.get('/sprint', function(req, res) {
  res.status(200).send('Ok');
});

app.listen(PORT, function(err) {
  if (err) {
    return console.error('Error spinning up', err);
  }

  console.log('Server started');
});
