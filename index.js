'use strict';
const express = require('express');
const {dialogflow} = require('actions-on-google');
const bodyParser = require('body-parser');

const app = dialogflow({debug:true});

app.intent('Default Welcome Intent', (conv)=>{
  conv.ask('Hello world!!');
});

const expressApp = express().use(bodyParser.json());
expressApp.post('/webhook', app);

expressApp.listen(process.env.PORT || 3000);