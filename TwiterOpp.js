var express = require('express');
var Twitter = require('twitter');   // node module for interacting with Twitter Api
var config = require('./config');   // Twitter needed Configuration
var client = new Twitter(config);   // new Api client
var mongo = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/mydb';

var jsontwitts = [];  //the object where we'll refactor our data from the response
var search;
var donne;
var count;


//function that initiates the process of requests and managing tweets
function GetTweets(searchquerry,response,nbrtweets){

    search = searchquerry;   //the search term sent from the post request
    donne = response;
    count = nbrtweets;       //the number of tweets requested from the form

    //First http get request to the api with standard parameters
    client.get('search/tweets', {q : searchquerry, count : 100, include_entities : true}, success);

}


//The callback function
var success = function (err, data) {

    if (err) {
        donne.send("an error occured check your connection and try again");
        return;
    }// in case request error occur
    if(data.statuses.length>0) {

        for (i = 0; i < data.statuses.length; i++) {
            jsontwitts.push({
                text: data.statuses[i].text,
                retweet_count: data.statuses[i].retweet_count,
                id: data.statuses[i].id,
                created_at: data.statuses[i].created_at,
                source: data.statuses[i].source,
                user: data.statuses[i].user,
                coordinates: data.statuses[i].coordinates,
                place: data.statuses[i].place,
                reply_count: data.statuses[i].reply_count,
                entities: data.statuses[i].entities
            });
        }

        var id_max = jsontwitts[jsontwitts.length - 1].id;
        console.log(jsontwitts.length + " tweets colléctés");

         //if the required number of tweets is reached store in database and render the view
        if (jsontwitts.length >= count) {
            mongo.connect(url, function (err, db) {
                if (err) throw err;
                db.collection(search).insertMany(jsontwitts, function (err, result) {
                    if (err) throw err;
                    console.log('number of tweets inserted : ' + result.insertedCount);
                    db.close();
                    jsontwitts = [];
                })
            });

            //rendering the view with the results tweets
            donne.render('index', {data: jsontwitts, search: 1, i: 1});
            console.log("arret du scrapping");

            //reseting the count for new requests and stopping the execution
            count = 0;
            return;
        }

        //iterative call to the request function with different parameters (maximum id ) to get different tweets
        client.get('search/tweets', {q: search, count: 100, max_id: id_max, include_entities: true}, success)
    }

    // handling the case of an empty response (data is null)
    else {

        // if we already collected tweets we render them and stop
        if(jsontwitts.length>0) {
            donne.render('index', {data: jsontwitts, search: 1, i: 1});
        }
        // if the first call has an empty response
        else {

            donne.send('no matching tweets found ');
        }
    }
};





module.exports.getTweets = GetTweets;