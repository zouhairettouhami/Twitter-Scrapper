var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/mydb';
var search;


/* when the search for stored tweets is requested we load a default database  to get
   the different fields of the tweet to inject them in a search filter form  */
router.get('/',function (req,res) {
        mongo.connect(url,function (err,db) {
            if(err) throw err;
            db.collection('test').findOne({},function (err,result) {
                if(err) console.log("echec");
                var inputarray = Object.keys(result);
                res.render('dbload',{isdata : 0 , inputarray : inputarray })

            })
        });
});

//Search in the database according to the querries from the form
router.post('/',function (req,res)
    {
        search = req.body.searchquerry;
        mongo.connect(url,function (err,db)
            {
                if(err) res.render('back');
                db.collection(req.body.searchquerry).find({text : {'$regex' : req.body.text , '$options' : 'i'}}).toArray(function (err,result) {
                    if(err) console.log("echec");
                    if(result.length)
                    {
                        var inputarray = Object.keys(result[0]);
                        res.render('dbload',{data : result, i: 1, isdata : 1 , inputarray: inputarray})
                    }
                    else {
                        search = null;
                        res.redirect('/dbload');
                        //res.send('no match founded');
                    }

                })

            });

    });

// drop rhe collection that has ben searched previously
router.get('/drop',function (req,res) {
    mongo.connect(url,function (err,db) {
        if(err) res.send(err.statusCode);
        if(!search){res.send('no collection selected');return}
        db.collection(search).drop(function (err,delOK) {
            if(err) res.send(err.statusCode);
            if(delOK) res.send('La collection '+search+' a été supprimée')
        })
        });

});

router.get('/graph',function (req,res) {
    mongo.connect(url, function (err, db) {
        if (err) res.send("error retrieving DB data");
        db.collection(search).aggregate({$group: {_id: '$user.location', count: {$sum: 1}}}, function (err, result1) {
            if (err) res.send("error loading the Graph data");
            db.collection(search).aggregate({$group: {_id: '$place.country', count: {$sum: 1}}}, function (err, result2) {
                if (err) res.send("error loading the Grapg data");
                res.render('Graph', {name: search, result1: result1, result2: result2});
            });
        });
    });
});







module.exports = router;