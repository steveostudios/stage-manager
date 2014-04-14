/**
 * Flux Capacitor
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    name: 'STRING',
    owner: 'INT',
    data: {
		type: 'JSON',
		defaultsTo: '{"items":[],"settings":{"remove_last_item":false}}'
    }
  }

};
