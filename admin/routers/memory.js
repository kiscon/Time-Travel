const express = require('express')
const router = express.Router()
const connection = require('../config')
const tools = require('../utils/plugins')
let response = {}
router.use((req, res, next) => {
  response = {
    code: 200,
    message: ''
  }
  next()
})

const SQL = {
  queryAll: 'SELECT * FROM MEMORY m INNER JOIN USER u ON m.userId=u.userId LIMIT ',
  add: 'INSERT INTO MEMORY ',
  queryTerm: 'SELECT * FROM MEMORY m INNER JOIN USER u ON m.userId=u.userId WHERE ',
  delete: 'DELETE FROM MEMORY WHERE '
}
// 拉取所有动态列表
router.get('/getMemoryList', (req, res, next) => {
  var query = req.query || {}
  query.pageNo = query.pageNo || 1
  query.pageSize = query.pageSize || 10
  connection.query(`${SQL.queryAll}${(query.pageNo - 1)*query.pageSize},${query.pageSize}`)
})
// 添加动态
router.post('/addMemory', (req, res, next) => {
  var params = req.body
  params.userId = req.session.user.userId
  params = tools.makeInserts(params)
  console.log(`${SQL.add}${params}`)
  connection.query(`${SQL.add}${params}`, (err, rows) => {
    console.log(err, rows)
    tools.makeResponse(req, res, err, rows)
  }) 
})
// 拉取复合条件的数据
router.get('/getMemoeyWithTerm', (req, res, next) => {
  var query = req.query
  query.pageNo = query.pageNo || 1
  query.pageSize = query.pageSize || 10
  const sql = `SELECT u.*, ROUND(6378.138*2*ASIN(SQRT(POW(SIN((${query.lat}*PI()/180-lat*PI()/180)/2),2)+
    COS(${query.lat}*PI()/180)*COS(lat*PI()/180)*POW(SIN((${query.lng}*PI()/180-lng*PI()/180)/2),2)))*1000) AS distance , m.*
    FROM MEMORY AS m INNER JOIN USER u ON m.userId=u.userId HAVING distance <= 1000 `
  connection.query(sql, (err, rows) => {
    tools.makeResponse(req, res, err, rows)
  })
})

router.get('/getUserMemorys', (req, res, next) => {
  var query = req.query
  query.pageNo = query.pageNo || 1
  query.pageSize = query.pageSize || 10
  console.log(req.session)
  const sql = `${SQL.queryTerm}u.userId=${req.session.user.userId} LIMIT ${(query.pageNo - 1)*query.pageSize},${query.pageSize}`
  connection.query(sql, (err, rows) => {
    tools.makeResponse(req, res, err, rows)
  })
})

router.get('/deleteUserMemory', (req, res, next) => {
  var params = req.query
  var sql = `${SQL.delete}id in (${params.ids})`
  connection.query(sql, (err, rows) => {
    tools.makeResponse(req, res, err, rows)
  })
})

module.exports = router
