const express = require('express')
const cors = require('cors')
const app = express()
const port = 9000
const bodyParser = require('body-parser')
const multer = require('multer');

app.use(cors({
  origin: "*"
}))

const storage = multer.memoryStorage();
const upload = multer({ storage });


const Pool = require('pg').Pool
const pool = new Pool({
  user: 'akkqptzo',
  host: 'trumpet.db.elephantsql.com',
  database: 'akkqptzo',
  password: 'n6h9nEssQflQjTMt5-HHNuh31YCSVTaq',
  port: 5432,
})

//api

app.post('/create', upload.array('mergedFoto'), async(req, res) => {

  const { nome, quantidade, detalhes } = req.body;
  const files = req.files;

  console.log(nome,quantidade,detalhes,files);

  if (!nome || !quantidade || !detalhes || !files) {
    return res.status(400).json({ error: "tá faltando nome, quantidade ou detalhes..." }).send()
  }
  
  const result = await pool.query(
    `INSERT INTO pedidos (nome, quantidade, detalhes) VALUES ($1, $2, $3) RETURNING id;`,
    [nome, quantidade, detalhes])
  
  const insertedId = result.rows[0].id;

  try {
    files.forEach(async (foto) => {
      await pool.query(
        `INSERT INTO fotos (pedido_id, foto) VALUES ($1, $2);`,
        [insertedId, foto.buffer])
      console.log('foi')
    }) 
    } catch (e) {
      console.log(e)
    }
    res.status(200).json({ message: "deu certo!" })
  })

app.get('/pedidos', (req, res) => {
  pool.query(`
  SELECT
  id,
  nome,
  quantidade,
  detalhes
  FROM pedidos;
`, (error, results) => {
        if (error) {
            throw error
        }
        res.status(200).json(results.rows)
    })
})

app.get('/fotos/:id', async(req, res) => { 
  const id = req.params.id
  const results = await pool.query(`SELECT foto, pedido_id FROM fotos WHERE pedido_id = '${id}'`)
  res.status(200).json(results.rows)
})

//listen

app.listen(port, () => {
    console.log(`Server iniciado na porta ${port}`)
  })