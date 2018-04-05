const { Pool, Client } = require('pg')
const config = require('./config.private');
const pool = new Pool(config.db);

function execQuery(query, client) {
  client = (client instanceof Client) ? client : pool;
  return client.query(query.text, query.values);
}

module.exports.execQuery = execQuery;

function execRawQuery(query, client) {
  client = (client instanceof Client) ? client : pool;
  return client.query(query);
}

module.exports.execRawQuery = execRawQuery;

module.exports.execQuerys = function(querys) {
  function* getQuery() {
      for(let q of querys) yield execQuery(q);
  }

  var it = getQuery();
  function execQuerys() {
    let q = it.next().value;
    if (q) return q.then(r => execQuerys());
    else return Promise.resolve();
  }

  return execQuerys();
}

module.exports.execRawQuerys = function(querys) {
  function* getQuery() {
      for(let q of querys) yield execRawQuery(q);
  }

  var it = getQuery();
  function execQuerys() {
    let q = it.next().value;
    if (q) return q.then(r => execQuerys());
    else return Promise.resolve();
  }

  return execQuerys();
}

module.exports.beginTransaction = function() {
  return new Promise(function(resolve, reject) {
    pool.connect((err, client, done) => {
      if (err) reject(err);

      client.query('BEGIN', (err) => {
        if (err) reject(err);
        resolve({client, done});
      })
    });
  });
}

module.exports.commit = function(client) {
  return new Promise(function(resolve, reject) {
    client.query('COMMIT', (err) => {
      if (err) console.error('Error committing transaction', err)
      resolve();
    });
  });
}

module.exports.rollback = function(client) {
  return new Promise(function(resolve, reject) {
    client.query('ROLLBACK', (err) => {
      if (err) {
        console.error('Error rolling back', err);
        reject(err);
      }
      resolve();
    });
  });
}
