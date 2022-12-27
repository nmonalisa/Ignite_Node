const express = require("express");
const app = express()
app.use(express.json()) // middleware para aceitar json como formato default de body param

/** 
 * Tipos de parâmetros:
 * Route params => usado para identificar recursos
 * Query params => Paginação, filtros, ...
 * Body params => objetos passados no corpo da requisição no formato JSON e usados 
 * para inserção ou atualização de algum recurso
 * Obs: ao invés de pegar o objeto parametro como um todo, tb pode usar desestruturação 
 * de objetos, pegando os parâmetros pelo nome. Ex: const {id} = require.params
*/

// Rotas
app.get("/", (require, response) => {
    return response.json({message: "Minha primeira aplicação em Node.js"});
})

app.get("/cursos", (require, response) => {
    // Capturar query params
    const query = require.query
    console.log(query)
    return response.json(["Curso 1", "Curso 2", "Curso 3"])
})

app.post("/cursos", (require, response) => {
    // Capturar body param
    const body = require.body
    console.log(body)
    return response.json(["Curso 1", "Curso 2", "Curso 3", "Curso 4"])
})

app.put("/cursos/:id", (require, response) => {
    const params = require.params  
    console.log(params)
    console.log(params.id)
    return response.json(["Curso 5", "Curso 2", "Curso 3", "Curso 4"])
})


app.delete("/cursos/:id", (require, response) => {
    return response.json(["Curso 1", "Curso 2"])
})



//app.post("/cursos/")

app.listen(3333)