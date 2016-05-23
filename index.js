var Twitter = require('twitter');

var config = require('./config');

var client = new Twitter(config);

var blocked = false;

var SECONDS = 1000;
var MINUTES = 60 * SECONDS;
var DEBOUNCING_THRESHOLD = 5 * MINUTES;

function sendTweetTo(handle, statusId) {
    if (handle.charAt(0) !== '@') {
        return;
    }

    var tweet = {
        status: handle + " Mais si, c'est possible ! https://carte.kiwi/",
        in_reply_to_status_id: statusId
    };

    client.post('statuses/update', tweet, function(err, tweet, response) {
        if (err) {
            console.error('Error when sending tweet to ' + handle + ':', err);
            return;
        }
        console.log('Tweet sent to ' + handle + ' at ', (new Date()).toLocaleString());

        blocked = true;
        setTimeout(function() {
            blocked = false;
        }, DEBOUNCING_THRESHOLD);
    });
}

var stream = client.stream('statuses/filter', {track: "c'est pas possible"});

stream.on('data', function(tweet) {
    console.log(tweet.user.screen_name + ': ' + tweet.text);
    var handle = '@' + tweet.user.screen_name;

    if (tweet.text.indexOf('RT ') === 0) {
        console.log('ABORT: retweet.');
        return;
    }

    if (blocked) {
        console.log('ABORT: debouncing.');
        return;
    }

    var tweetId = tweet.id_str;
    sendTweetTo(handle, tweetId);
});

stream.on('error', function(err) {
    console.error('Streaming error:', err, err.message, err.stack);
});
