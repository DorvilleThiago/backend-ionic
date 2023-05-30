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

const queryFotos = (fotos) => {
  if (fotos.length === 1) {
    return "(pedido_key, blob_one) VALUES ($1, $2)";
  } else if (fotos.length === 2) {
    return "(pedido_key, blob_one, blob_two) VALUES ($1, $2, $3)"
  } else if (fotos.length === 3) { 
    return "(pedido_key, blob_one, blob_two, blob_three) VALUES ($1, $2, $3, $4)"
  }
}

app.post('/create', async(req, res) => {
  const { nome, quantidade, detalhes, fotos } = req.body
  console.log(JSON.stringify(fotos))
  let lista_de_fotos = []
  for (foto of fotos) { 
    lista_de_fotos.push(foto)
  }
  if (!nome || !quantidade || !detalhes || !fotos) {
    return res.status(400).json({ error: "tá faltando nome, quantidade ou detalhes..." }).send()
  }
  await pool.query(
    `INSERT INTO pedidos (nome, quantidade, detalhes) VALUES ($1, $2, $3) RETURNING id;`,
    [nome, quantidade, detalhes],
    (error, results) => {
      if (error) { console.log(error) }      
      const insertedId = results.rows[0].id;
      lista_de_fotos.unshift(insertedId)
    })
  console.log('foi um')
  await pool.query(
    `INSERT INTO fotos ${queryFotos(fotos)}`,
    lista_de_fotos,
    (error, results) => {
      console.log('dentro da query')
      if (error) { console.log(lista_de_fotos); console.log(error) }
    })
  res.status(200).json({ message: "deu certo!" })
  console.log('foi dois')
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