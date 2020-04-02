const needle = require('needle');

const CINEMETA_URL = 'https://v3-cinemeta.strem.io';

async function search(query, type = 'movie') {
  return _getEntries(query, type)
}

async function findMovie(query, type = 'movie') {
  return _getEntries(query, type)
      .then(entries => {
        if (!entries || !entries.length) {
          return Promise.reject(`No entry found for ${query}`);
        }
        return entries[0];
      })
      .then(entry => getMetadata(entry.id));
}

async function getMetadata(id, type = 'movie') {
  return needle('get', `${CINEMETA_URL}/meta/${type}/${id}.json`, { open_timeout: 60000 })
      .then((response) => {
        const body = response.body;
        if (body && body.meta && body.meta.id) {
          return body.meta;
        } else {
          throw new Error(`No meta found for ${id}`);
        }
      });
}

async function _getEntries(query, type = 'movie') {
  return needle('get', `${CINEMETA_URL}/catalog/${type}/top/search=${query}.json`, { open_timeout: 60000 })
      .then((response) => {
        const body = response.body;
        if (body && body.metas && body.metas.length) {
          return body.metas.filter(meta => meta.releaseInfo && meta.releaseInfo !== 'undefined' && meta.poster);
        } else {
          throw new Error('No search results');
        }
      });
}



module.exports = { search, findMovie, getMetadata };