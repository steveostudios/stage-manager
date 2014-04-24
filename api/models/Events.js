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
    description: 'STRING',
    type: 'STRING',
    owner: 'INT',
    segments: 'JSON',
    settings: 'JSON'
  }

};
