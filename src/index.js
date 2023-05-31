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
    return "(pedido_key, blob_one) VALUES ($1, $2);";
  } else if (fotos.length === 2) {
    return "(pedido_key, blob_one, blob_two) VALUES ($1, $2, $3);"
  } else if (fotos.length === 3) { 
    return "(pedido_key, blob_one, blob_two, blob_three) VALUES ($1, $2, $3, $4);"
  }
}

app.post('/create', async(req, res) => {

  const { nome, quantidade, detalhes, fotos } = req.body

  let lista_de_fotos = []

  for (foto of fotos) { 
    lista_de_fotos.push(foto.blob)
  }

  if (!nome || !quantidade || !detalhes || !fotos) {
    return res.status(400).json({ error: "tá faltando nome, quantidade ou detalhes..." }).send()
  }
  
  const result = await pool.query(
    `INSERT INTO pedidos (nome, quantidade, detalhes) VALUES ($1, $2, $3) RETURNING id;`,
    [nome, quantidade, detalhes])
  
  const insertedId = result.rows[0].id;
  lista_de_fotos.unshift(insertedId)

  try {
    console.log("INSERT INTO fotos "+queryFotos(fotos))
    await pool.query(
      `INSERT INTO fotos ${queryFotos(fotos)}`,
      [...lista_de_fotos])
    res.status(200).json({ message: "deu certo!" })
  } catch (err) {
    console.log(err)
  }
})

app.get('/pedidos', (req, res) => {
  pool.query(`
  SELECT
  P.id,
  P.nome,
  P.quantidade,
  P.detalhes,
  F.blob_one,
  F.blob_two,
  F.blob_three
  FROM 
    pedidos P
  INNER JOIN 
    fotos F
  ON 
  P.id = F.pedido_key;`, (error, results) => {
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