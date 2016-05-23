var Twitter = require('twitter');

var config = require('./config');

var client = new Twitter(config);

function sendTweetTo(handle) {
    if (handle.charAt(0) !== '@') {
        return;
    }

    var tweet = { status: handle + " Mais si, c'est possible ! https://carte.kiwi/" };

    client.post('statuses/update', tweet, function(err, tweet, response) {
        if (err) {
            console.error('Error when sending tweet to ' + handle + ':', err);
            return;
        }
        console.log('Tweet sent to ' + handle + ' at ', (new Date()).toLocaleString());
    });
}

var stream = client.stream('statuses/filter', {track: "c'est pas possible"});

stream.on('data', function(tweet) {
    console.log(tweet.user.screen_name + ': ' + tweet.text);
    var handle = '@' + tweet.user.screen_name;
    sendTweetTo(handle);
});

stream.on('error', function(err) {
    console.error('Streaming error:', err, err.message, err.stack);
});
