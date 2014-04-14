/**
 * Spin That Wheel
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
			defaultsTo: '{"questions":[],"settings":{"remove_last_prize":false,"next_prize_id":0,"spin_duration":20,"theme":"Sunny Beach"}}'
    },
    results: 'JSON'
  }

};
