const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const path = require('path');
const scribeLog = require('scribe-js')();
const port = process.env.PORT || 8000;
const app = express();
const favicon = require('serve-favicon');

// Logging
app.use(scribeLog.express.logger());
app.use('/logs', scribeLog.webPanel());


app.use(favicon(__dirname + '/dist/favicon.ico'));

app.use(express.static('dist'));

app.set('views',path.join(__dirname,'dist'));
app.set('views engine','html');
app.engine('html',ejs.renderFile);

// Parsing request
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));


app.listen(port,function (req,res) {
  console.log('Server is running on port : '+ port);
});

app.use('/*',function(req,res,next){
  res.render('index.html');
  next();
});
