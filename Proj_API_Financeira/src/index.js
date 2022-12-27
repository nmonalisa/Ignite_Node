// Libraries
const { request, response } = require("express");
const express = require("express");
const uuid4 = require("uuid4");

// Servidor
const app = express()
app.use(express.json())

// Global variables
// Mock to customers data
const customers = [] 

// Helper funcions
function getCustomerBalance(statement){
    const balance = statement.reduce((accum, operation) => {
        const credit_operation = accum + operation.amount
        const debit_operation = accum - operation.amount
        if (operation.type == "credit") return credit_operation
        else return debit_operation
    }, 0)

    return balance
}

// Middlewares
function verifyIfAccountExists(request, response, next){
    const { cpf } = request.headers
    const customer = customers.find(customer => customer.cpf == cpf)
    const doesntCustomerExist = customer == undefined

    if (doesntCustomerExist) {
        response.status(400).json({error: "Customer not found."})
    }

    request.customer = customer
    return next()
}

// API Routes
app.get("/", (request, response) => {
    return response.send("Bem-vindo ao projeto FinAPI - Uma API Financeira.")
})

//  Balance
app.get("/balance", verifyIfAccountExists, (request, response) => {
    const { customer } = request
    const balance = getCustomerBalance(customer.statement)
    return response.status(201).json({balance})
})

// Statement
app.get("/statement", verifyIfAccountExists, (request, response) => {
    const { customer } = request
    return response.json(customer.statement)
})

app.get("/statement/date", verifyIfAccountExists, (request, response) => {
    const { customer } = request
    const { date } = request.query
    const dateFormat = new Date(date + " 00:00")
    const statementByDate = customer.statement.filter(
        (statement) => 
        statement.created_at.toDateString() <
        new Date(dateFormat).toDateString()
    )

    return response.json(statementByDate)

})

// Account
app.get("/account", verifyIfAccountExists, (request, response) => {
    const { customer } = request
    return response.status(201).json(customer)
    
})

app.post("/account", (request, response) => {
    const { name, cpf } = request.body
    const customer = customers.some(customer => customer.cpf == cpf)

    if (customer) {
        return response.status(400).json({error: "Customer already exists."})
    }
    
    customers.push({
        name: name,
        cpf: cpf,
        id: uuid4(),
        statement: []
    })

    return response.status(201).send("Account registered successfully.");
})

app.put("/account", verifyIfAccountExists, (request, response) => {
    const { customer } = request
    const { name } = request.body
    customer.name = name
    return response.status(200).send("Account name updated succesfully!")
})

app.delete("/account", verifyIfAccountExists, (request, response) => {
    const { customer } = request
    const customer_index = customers.indexOf(customer)
    customers.splice(customer_index, 1)
    return response.status(200).json(customers)
})
// Monetary Operations
app.post("/withdraw", verifyIfAccountExists, (request, response) => {
    const { customer } = request
    const { amount } = request.body
    const currentBalance = getCustomerBalance(customer.statement)
    
    if (currentBalance < amount){
        return response.status(401).json({error: "Insuficiente funds!"})
    }

    customer.statement.push({
        type: "debit",
        amount,
        created_at: new Date()
    })

    return response.status(201).send("Operation successfully!")
})

app.post("/deposit", verifyIfAccountExists, (request, response) => {
    const { customer } = request
    const { description, amount } = request.body
    customer.statement.push({
        type: "credit",
        description,
        amount,
        created_at: new Date(),
    })

    return response.status(201).send("Operation successfully!")
})

app.listen(8080)