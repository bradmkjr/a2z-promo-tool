var configTwitter = require("./components/config.twitter.js");
var configBitly = require("./components/config.bitly.js");
var configGeneral = require("./components/config.general.js");

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./src/data/database.db');



var category = 'Pets';

var description = '20PETCHEER - 20% off PetCheer cat scratcher lounge bed with catnip. Available now through 11/13, while supplies last. ';

var amazonURL = 'https://www.amazon.com/gp/mpc/ACIC0SIKH7K6X';

var Bitly = require('bitly');
var bitly = new Bitly(configBitly.accessToken, configBitly );

var shortURL = ''; 

var longURL = amazonURL + '/?tag='+configGeneral.amazon_tracking_id;

// Start process
verify();

function verify(){

  var query = "SELECT * FROM promotions WHERE `longURL` = '"+longURL+"'";

  // console.log(query);

  db.get(query, function(err, row) {
      
      if (err){
        console.log(err);   
        return;     
      }

      if( row != undefined  && row.tweet_status == 'OK' ){
        console.log('Skipping Entry, already complete');
        // console.log(row);
        return;
      }else if( row != undefined  && row.shortURL == '' ){
        console.log('Skipping Entry, trying shorten again');
        // console.log(row);
        // try tweeting again
        shortenURL();
      }else if( row != undefined  && row.tweet_status != 'OK' ){
        console.log('Skipping Entry, trying tweet again');
        // console.log(row);
        // try tweeting again
        shortURL = row.shortURL;
        tweet();
      }else{
        console.log('Inserting Entry');
        console.log(row);
        insert();
      }

  });
  
}


function insert(){

  db.serialize(function() {
  
    var stmt = db.prepare("INSERT INTO `promotions`(`ID`,`category`,`description`,`amazonURL`,`longURL`,`shortURL`,`date_created`) VALUES (NULL,(?),(?),(?),(?),(?), datetime('now') );");
    
    stmt.run(category,description, amazonURL, longURL, shortURL );
    
    stmt.finalize();

  });

  shortenURL();
  
}

function shortenURL(){

  bitly.shorten(longURL)
  .then(function(response) {
    // Do something with data 
    shortURL = response.data.url;
    
    db.serialize(function() {
  
    // UPDATE `promotions` SET `shortURL`=? WHERE `_rowid_`='7';
    var stmt = db.prepare("UPDATE `promotions` SET `shortURL`=(?), `date_updated` = datetime('now') WHERE `longURL`= (?);");
    
    stmt.run( shortURL, longURL );
    
    stmt.finalize();

  });

    tweet();

  }, function(error) {
    throw error;
  });

}



function tweet(){

    var Twit = require('twit');

    var T = new Twit(configTwitter);

    var tweet = { status: statusUpdate( category, description, shortURL ) } // this is the tweet message

    T.post('statuses/update', tweet, tweeted) // this is how we actually post a tweet ,again takes three params 'statuses/update' , tweet message and a call back function

    function tweeted(err, data, response) {

    if(err){

      console.log("Something went wrong!");

      console.log(err.message);

      db.serialize(function() {
    
        // UPDATE `promotions` SET `shortURL`=? WHERE `_rowid_`='7';
        var stmt = db.prepare("UPDATE `promotions` SET `tweet_status`=(?), `date_updated` = datetime('now') WHERE `longURL`= (?);");
        
        stmt.run( err.message, longURL );
        
        stmt.finalize();

      });

    }else{

      console.log("Voila It worked!");

      console.log(response.statusMessage);

      db.serialize(function() {
    
        // UPDATE `promotions` SET `shortURL`=? WHERE `_rowid_`='7';
        var stmt = db.prepare("UPDATE `promotions` SET `tweet_status`=(?), `date_updated` = datetime('now') WHERE `longURL`= (?);");
        
        stmt.run( response.statusMessage, longURL );
        
        stmt.finalize();

      });

    }

    db.close();

    } // this is the call back function which does something if the post was successful or unsuccessful.

} // end tweet

function statusUpdate( category, description, shortURL ){

  var statusUpdate = '';

  var maxLength = 139 - ( category.length + 2 + shortURL.length + 1 );

  statusUpdate = category + ': ' + description.substring(0, maxLength) + ' ' + shortURL;

  return statusUpdate;
}


