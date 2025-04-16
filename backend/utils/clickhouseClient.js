const { createClient } = require('@clickhouse/client');

// Create a ClickHouse client with connection details
const createClickHouseClient = (config) => {
  const {
    host = process.env.CLICKHOUSE_HOST || 'play.clickhouse.com',
    port = process.env.CLICKHOUSE_PORT || 443,
    protocol = process.env.CLICKHOUSE_PROTOCOL || 'https',
    username = process.env.CLICKHOUSE_USER || 'explorer',
    password = process.env.CLICKHOUSE_PASSWORD || '',
    database = process.env.CLICKHOUSE_DEFAULT_DATABASE || 'default',
    jwt = ''
  } = config;

  const connectionConfig = {
    host: `${protocol}://${host}:${port}`,
    username,
    database
  };

  // Use JWT token if provided, otherwise use password
  if (jwt) {
    connectionConfig.password = '';
    connectionConfig.application = {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    };
  } else if (password) {
    connectionConfig.password = password;
  }

  return createClient(connectionConfig);
};

module.exports = createClickHouseClient; 