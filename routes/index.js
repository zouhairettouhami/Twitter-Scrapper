var express = require('express');
var router = express.Router();
var TwitterOpp = require('../TwiterOpp');
var bodyparser = require('body-parser');


//when the form with the searchquerry is submitted
router.post('/', function(request,response){
    var searchquerry = request.body.querry;
    var nbrtweets = request.body.nbrtweets;
    console.log("searchQuerry :"+searchquerry);
    TwitterOpp.getTweets(searchquerry,response,nbrtweets); //call to the function that treats Twitter data


});


// Empty index with the form for making searches
router.get('/',function(request,response){
    var a = 0;
    response.render('index', {search : a});
    console.log(++a);
});



module.exports = router;
