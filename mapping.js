const { Image, Button } = require('actions-on-google');

function toBasicCard(meta) {
  return {
    title: meta.name,
    subtitle: `${meta.releaseInfo} ${meta.genres && meta.genres.join(', ') || ''}`,
    text: meta.description,
    buttons: new Button({
      title: 'Watch on Stremio',
      url: `https://84cf2fad.ngrok.io/detail/${meta.type}/${meta.id}/${meta.id}`,
      // url: `http://app.strem.io/shell-v4.4/#/detail/${meta.type}/${meta.id}/${meta.id}`,
      // action: {
      //   url: `stremio://detail/${meta.type}/${meta.id}/${meta.id}`,
      //   androidApp: {
      //     packageName: 'com.stremio.one'
      //   }
      // }
    }),
    image: new Image({
      url: meta.poster,
      alt: 'Poster',
    }),
  };
}

function toItem(entry) {
  return {
    title: entry.name,
    // url: `stremio://detail/movie/${entry.id}/${entry.id}`,
    description: `${entry.releaseInfo} ${entry.type}`,
    image: new Image({
      url: entry.poster,
      alt: 'Poster',
    }),
  };
}

module.exports = { toBasicCard, toItem };