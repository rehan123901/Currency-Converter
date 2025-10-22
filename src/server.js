const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  const addressInfo = server.address();
  const actualPort = typeof addressInfo === 'string' ? addressInfo : addressInfo.port;
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${actualPort}`);
});

module.exports = server;
