var config.bitly = require("./components/config.bitly.js");

import Bitly from 'bitly';
 
let bitly = new Bitly(config.bitly);
 
bitly.shorten('http://nodejs.org', (response) => {
  console.log(response);
}, (error) => {
  console.log(error);
});