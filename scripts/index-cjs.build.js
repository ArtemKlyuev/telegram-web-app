if (process.env.NODE_ENV === 'production') {
  module.exports = require('./telegram-web-app.production.min.js');
} else {
  module.exports = require('./telegram-web-app.development.js');
}
