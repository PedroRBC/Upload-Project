const fs = require("fs");
const {resolve} = require("path");
const { promisify } = require("util");

/** Database setup*/
async function db(){
  if(global.connection && global.connection.state !== 'disconnected')
      return global.connection;

  const mysql = require("mysql2/promise");
  const connection = await mysql.createConnection({
      host: process.env.MYSQL_CONNECTION_HOST,
      user: process.env.MYSQL_CONNECTION_USER,
      password: process.env.MYSQL_CONNECTION_PASSWORD,
      database: process.env.MYSQL_CONNECTION_DATABASE,
    });
  console.log("Conectou no MySQL!");
  global.connection = connection;
  return connection;
}

module.exports = {
  /** Get Files From MYSQL*/
  getFiles: async function()  {
    const conn = await db();
    const [rows] = await conn.query('SELECT * FROM files;');
    return rows
  },
  
  /** Add File From MYSQL*/
  addFile: async function(req, res) {
    const conn = await db();
    const url = `${process.env.APP_URL}/${req.key}`
    const date = Date.now()
    const sql = "INSERT INTO `files`(`name`, `size`, `key`, `url`, `createdAt`) VALUES (?,?,?,?,?)";
    const values = [req.name, req.size, req.key, url, date]
    const [rows] = await conn.query(sql, values)
    return {id: rows.insertId, name: req.name, size: req.size, key: req.key, url: url, createdAt: date}
    },
    
  /** Delete File From MYSQL*/
  deleteFile: async function(id) {
  const conn = await db();
  const sql = "SELECT * FROM files WHERE id=?"
  const sql2 = "DELETE FROM files WHERE id=?"
  const [rows] = await conn.query(sql, [id])
    if(rows[0].key !== undefined) {
  promisify(fs.unlink)(
    resolve(__dirname, "..", "..","..","..", ".tmp", "uploads", ''+rows[0].key)
  ).catch((err)=>{console.error(err)})
    
    return await conn.query(sql2, [id])
  }
  },
  
  /** Test Function Add Files From MYSQL*/
  TestaddFile: async function(req) {
    const url = `${process.env.APP_URL}/${req.key}`
    const q = "INSERT INTO `files`(`name`, `size`, `key`, `url`, `createdAt`) VALUES("+`'${req.name}','${req.size}','${req.key}','${url}','${Date.now()}')`
    const [newId] = await db.promise().query(q);
    var data = {
      id: newId.insertId,
      name: req.name,
      size: req.size,
      key: req.key,
      url: url
    }
    return data
    },
}
