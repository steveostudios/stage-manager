/**
 * Global adapter config
 * 
 * The `adapters` configuration object lets you create different global "saved settings"
 * that you can mix and match in your models.  The `default` option indicates which 
 * "saved setting" should be used if a model doesn't have an adapter specified.
 *
 * Keep in mind that options you define directly in your model definitions
 * will override these settings.
 *
 * For more information on adapter configuration, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.adapters = {

  // If you leave the adapter config unspecified 
  // in a model definition, 'default' will be used.
  'default': 'postgresql',

  // In-memory adapter for DEVELOPMENT ONLY
  memory: {
    module: 'sails-memory'
  },

  // Persistent adapter for DEVELOPMENT ONLY
  // (data IS preserved when the server shuts down)
  disk: {
    module: 'sails-disk'
  },

  // MySQL is the world's most popular relational database.
  // Learn more: http://en.wikipedia.org/wiki/MySQL
  mysql: {
    module: 'sails-mysql',
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'gameshowhub'
  },

  postgresql: {
    module: 'sails-postgresql',
    host: process.env.PG_HOSTNAME || 'ec2-23-23-183-5.compute-1.amazonaws.com',
    user: process.env.PG_USER || 'nkxurpotkfzgdn',
    password: process.env.PG_PASSWORD || 'vkItQuncJp_k5Zgw1ws6Tsv_n6',
    database: process.env.PG_DATABASE || 'd35u664kb0f17q',
    port: process.env.PG_PORT || 5432,
    ssl: {
      rejectUnauthorized: false
    }
  }

};