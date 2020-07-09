const express = require('express');

const handlebars  = require('express-handlebars');
const bodyParser = require('body-parser');
const consign = require('consign');
const gzip = require('compression');
const cookieParser = require('cookie-parser');


module.exports = (() =>{


    const app = express();
    app.use(express.static('src'));
    app.use(express.static('uploads'));
    app.use(gzip());

    //Handlebars
    app.engine('handlebars', handlebars());
    app.set('view engine', 'handlebars');
    //app.enable('view cache');
   

    //bodyParser
    app.use(bodyParser.urlencoded({extended:true}));
    app.use(bodyParser.json());
    
    //cookieParser
    app.use(cookieParser());

    //consign
    consign()
    .include('controllers')
    .into(app);

    return app;

});



