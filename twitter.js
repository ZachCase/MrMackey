var api = require('axios');
var auth = require('./auth.json');

let bearerTokenCred = "",
    bearerToken = "";

// Generate the bearerTokenCredential string.
const generateBearerTokenCredentials = () => {
  // URL Encode both the Key and Secret
  let keyEncoded = encodeURIComponent(auth.twitterKey),
      secretEncoded = encodeURIComponent(auth.twitterSecret);
  // Concatenate Key and Secret
  bearerTokenCred = `${keyEncoded}:${secretEncoded}`;
  // Base64 encode bearerTokenCred
  bearerTokenCred = Buffer.from(bearerTokenCred).toString('base64');
};

// Request the bearToken from Twitter using the bearTokenCredentials
exports.requestBearerToken = () => {
  // Generate the bearerTokenCred
  generateBearerTokenCredentials();

  let body = "grant_type=client_credentials";
  api.post('https://api.twitter.com/oauth2/token', body, {
      headers: {
        "Authorization": `Basic ${bearerTokenCred}`,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
    .then(response => {
      console.log(`Twitter Auth API Success: ${response.data.access_token}`);
      let data = response.data;
      bearerToken = data.access_token;
    })
    .catch(e => {
      console.log(`Twitter Auth API Error: ${e}`);
    });
};

// Get The Most Recent Tweet By User Screen Name
exports.getMostRecentTweetByScreenName = (screenName, tweetCount, message) => {
  // Make sure tweetCount is between 1 - 5
  if(tweetCount > 5) {
    message.reply(`${tweetCount} tweets is too many, m'kay... Here's the 5 most recent!`);
    tweetCount = 5; 
  } else if(tweetCount < 1) {
    message.reply(`${tweetCount} tweets is impossible, m'kay... Here's the most recent!`);
    tweetCount = 1; 
  }

  api.get(`https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=${screenName}&count=${tweetCount}`, {
      headers: {
        "Authorization": `Bearer ${bearerToken}`
      }
    })
    .then(response => {
      console.log(`Twitter User Timeline GET Success`);
      for(let i = 0; i < response.data.length; i++) {
        let tweet = response.data[i];
        message.channel.send(`https://twitter.com/${screenName}/status/${tweet.id_str}/`);
      }
    })
    .catch(e => {
      console.log(`Twitter User Timeline GET Error: ${e}`);
      message.reply("Twitter ain't tweeting, m'kay. There was an error getting the info.");
    });
};