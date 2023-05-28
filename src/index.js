const express = require('express')
const cors = require('cors')
const app = express()
const port = 9000

app.use(cors({
  origin: "*"
}))
app.use(express.json());

const Pool = require('pg').Pool
const pool = new Pool({
  user: 'akkqptzo',
  host: 'trumpet.db.elephantsql.com',
  database: 'akkqptzo',
  password: 'n6h9nEssQflQjTMt5-HHNuh31YCSVTaq',
  port: 5432,
})

//api

app.post('/create', (req, res) => {
    const { nome, quantidade, detalhes } = req.body
    if (!nome || !quantidade || !detalhes) {
        return res.status(400).json({ error: "tá faltando nome, quantidade ou detalhes..." }).send()
    }
    pool.query(
        `INSERT INTO pedidos (nome, quantidade, detalhes) VALUES ($1, $2, $3) RETURNING *;`,
        [nome, quantidade, detalhes],
        (error, results) => {
          if (error) {
            throw error
          }
          res.status(200).json({message: "novo pedido realizado!"}).send()
        }
      )
})

app.get('/pedidos', (req, res) => {
    pool.query('SELECT * FROM pedidos;', (error, results) => {
        if (error) {
            throw error
        }
        res.status(200).json(results.rows)
    })
})

//listen

app.listen(port, () => {
    console.log(`Server iniciado na porta ${port}`)
  })