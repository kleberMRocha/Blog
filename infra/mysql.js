const mysql      = require('mysql');
const conexao = mysql.createConnection({
  host     : 'localhost',
  user     : 'blog',
  password : '123',
  database : 'blog'
});

module.exports = conexao;