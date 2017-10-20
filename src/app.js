var configTwitter = require("./components/config.twitter.js");
var configBitly = require("./components/config.bitly.js");

var Bitly = require('bitly');
var bitly = new Bitly(configBitly.accessToken, configBitly );

var shortURL = ''; 

var longURL = 'https://www.amazon.com/gp/mpc/A2R6K02CLXB829/?tag=goldboxdeals-info-20';

var category = 'Furniture';

var description = '128SIMPSHTVS - $128 off Simpli Home sawhorse media stand, grey. Available now through 10/27, while supplies last.';

// Start process
shortenURL(longURL);

function shortenURL(longURL){

  bitly.shorten(longURL)
  .then(function(response) {
    // Do something with data 
    shortURL = response.data.url;
    
    tweet();

  }, function(error) {
    throw error;
  });

}

function tweet(){

    var Twit = require('twit');

    var T = new Twit(configTwitter);

    var tweet = { status: statusUpdate( category, description, shortURL ) } // this is the tweet message

    // T.post('statuses/update', tweet, tweeted) // this is how we actually post a tweet ,again takes three params 'statuses/update' , tweet message and a call back function

    console.log(statusUpdate( category, description, shortURL ));

    function tweeted(err, data, response) {

    if(err){

    console.log("Something went wrong!");

    console.log(err);

    }

    else{

    console.log("Voila It worked!");

    }

    } // this is the call back function which does something if the post was successful or unsuccessful.

} // end tweet

function statusUpdate( category, description, shortURL ){

  var statusUpdate = '';

  var maxLength = 139 - ( category.length + 2 + shortURL.length + 1 );

  statusUpdate = category + ': ' + description.substring(0, maxLength) + ' ' + shortURL;

  return statusUpdate;
}


