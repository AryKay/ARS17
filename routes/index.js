var express = require('express');
var favicon = require('serve-favicon');
var path = require('path');
var router = express.Router();
var twit = require('twit');
var sentimental = require('Sentimental');
var config = require("../config");
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Welcome To Twitterverse!' });
});

module.exports = router;
var myInterval;

search = function(req, res) {
  clearInterval(myInterval);
  performSearch(req, res);
  myInterval = setInterval(performSearch, 15000, req, res);
};


function performSearch(req, res) {
    // grab the request from the client
  var choices = JSON.parse(req.body.choices);
  // grab the current date
  var today = new Date();
  // establish the twitter config (grab your keys at dev.twitter.com)
  var twitter = new twit({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token: config.access_token,
    access_token_secret: config.access_token_secret
  });
  // set highest score
  var highestScore = -Infinity;
  // set highest choice
  var highestChoice = null;
  // set score
  var score = 0;
  console.log("----------")

    // grad 10000 tweets from today
    twitter.get('search/tweets', {q: '' + choices[0] + ' since:' + today.getFullYear() + '-' +
      (today.getMonth() + 1) + '-' + today.getDate(), count:10000}, function(err, data) {
        // perform sentiment analysis
        score = performAnalysis(data['statuses']);
        console.log("score:", score)
        console.log("choice:", choices[0])
        //  determine winner
        highestScore = score;
        highestChoice = choices[0];
        console.log("")
        // Write the result in the results file
        fs.writeFile('public/results.html', highestScore.toFixed(3), function (err) {
            if (err) 
                return console.log(err);
            console.log('wrote into results');
        });
      });
  // send response back to the server side; why the need for the timeout?
  setTimeout(function() { res.end(JSON.stringify({'score': highestScore, 'choice': highestChoice})) }, 5000);
}

function performAnalysis(tweetSet) {
  //set a results variable
  var results = 0;
  // iterate through the tweets, pulling the text, retweet count, and favorite count
//  console.log(tweetSet);
  for(var i = 0; i < tweetSet.length; i++) {
    tweet = tweetSet[i]['text'];
    retweets = tweetSet[i]['retweet_count'];
    favorites = tweetSet[i]['favorite_count'];
    // remove the hastag from the tweet text
    tweet = tweet.replace('#', '');
    // perform sentiment on the text
    var score = sentimental.analyze(tweet)['score'];
    // calculate score
    results += score;
    if(score > 0){
      if(retweets > 0) {
        results += (Math.log(retweets)/Math.log(2));
      }
      if(favorites > 0) {
        results += (Math.log(favorites)/Math.log(2));
      }
    }
    else if(score < 0){
      if(retweets > 0) {
        results -= (Math.log(retweets)/Math.log(2));
      }
      if(favorites > 0) {
        results -= (Math.log(favorites)/Math.log(2));
      }
    }
    else {
      results += 0;
    }
  }
  // return score
  results = results / tweetSet.length;
  return results
}