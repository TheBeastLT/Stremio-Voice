'use strict';
const express = require('express');
const { dialogflow, Carousel, BasicCard, List } = require('actions-on-google');
const bodyParser = require('body-parser');
const { search, findMovie, getMetadata } = require('./cinemeta');
const { toItem, toBasicCard } = require('./mapping');

const app = dialogflow({debug:true});

app.intent('Search', (conv, {query}) => {
  return search(query.replace(/search\s*/i, ''))
      .then(entries => {
        if (entries.length > 1) {
          conv.ask(`I found ${Object.keys(entries).length} results for you to watch!`);
          conv.ask(new Carousel({
            items: entries.slice(0, 10).reduce((map, entry) => (map[entry.id] = toItem(entry), map),{})
          }));
        } else if (entries.length === 1) {
          return getMetadata(entries[0].id)
              .then(meta => toBasicCard(meta))
              .then(cardOptions => {
                conv.ask(`Do you want to watch ${cardOptions.title}?`);
                conv.ask(new BasicCard(cardOptions))
              })
        } else {
          conv.ask(`Sorry, I found no results for ${query}`);
        }
      })
      .catch(error => {
        console.warn(`Failed ${query} search:`, error);
        conv.ask(`Sorry, there was some error finding ${title}`);
      });
});

app.intent('Watch', (conv, {title}) => {
  return findMovie(title.replace(/(?:watch|play|show)\s*/i, ''))
      .then(meta => toBasicCard(meta))
      .then(cardOptions => {
        conv.ask(`Do you want to watch ${cardOptions.title}?`);
        conv.ask(new BasicCard(cardOptions))
      })
      .catch(error => {
        if (typeof error === 'string') {
          conv.ask(`Sorry, I found no results for ${query}`);
        } else {
          console.warn(`Failed ${title} find:`, error);
          conv.ask(`Sorry, there was some error finding ${title}`);
        }
      });
});

app.intent('Selected', (conv, params, option) => {
  if (option && option.match(/^tt\d+$/)) {
    return getMetadata(option)
        .then(meta => toBasicCard(meta))
        .then(cardOptions => {
          conv.ask(`Do you want to watch ${cardOptions.title}?`);
          conv.ask(new BasicCard(cardOptions))
        })
        .catch(error => {
          console.warn(`Failed ${option} select:`, error);
          conv.ask(`Sorry, there was some error selecting ${option}`);
        });
  } else {
    conv.ask('You\'ve selected an unknown item from the list');
  }
});

const expressApp = express().use(bodyParser.json());
expressApp.post('/webhook', app);

expressApp.get('/detail/:type/:id/:videoId', (req, res) => {
  const { type, id, videoId } = req.params;
  const redirectUrl = `stremio://detail/${type}/${id}/${videoId}`;
  console.log(`Redirecting to: ${redirectUrl}`);
  res.writeHead(301, { Location: redirectUrl });
  res.end();
});

expressApp.listen(process.env.PORT || 3000);