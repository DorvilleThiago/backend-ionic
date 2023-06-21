const express = require('express')
const cors = require('cors')
const app = express()
const port = 10000
const bodyParser = require('body-parser')
const multer = require('multer');
const fs = require('fs');
const path = require('path');

app.use(cors({
  origin: "*",         //access-control-allow-credentials:true
  optionSuccessStatus:200,
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

app.post('/create', upload.any('mergedFoto'), async(req, res) => {

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
  const imageDirectory = path.join(__dirname, 'images');
  if (!fs.existsSync(imageDirectory)) {
    fs.mkdirSync(imageDirectory);
  }
  try {
    const fileName = `${insertedId}.jpg`;
    const targetPath = path.join(__dirname, 'images', fileName);

    fs.writeFile(targetPath, req.files[0].buffer, (err) => {
      if (err) {
        console.error(err);
        throw err;
      }
      console.log('File saved:', targetPath);
    });
  } catch (err) {
    console.error(err);
  }
    res.status(200).json({ message: "deu certo!" })
  })

app.get('/pedidos', (req, res) => {
  console.log('pedidos!!!')
  pool.query(`
  SELECT
  id,
  nome,
  quantidade,
  detalhes,
  data
  FROM pedidos;
`, (error, results) => {
        if (error) {
            throw error
        }
        res.status(200).json(results.rows)
    })
})

app.get('/fotos/:id', async (req, res) => {
  const id = req.params.id;
  console.log('chegou id: ' + id);
  
  const fileName = `${id}.jpg`;
  const filePath = path.join(__dirname, 'images', fileName);
  
  res.sendFile(filePath);
});

//listen

app.listen(port, () => {
    console.log(`Server iniciado na porta ${port}`)
  })