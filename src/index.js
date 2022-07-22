const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  try{
    const { username } = request.headers;
    if(!users.some((user) => user.username === username)){
      return response.status(400).json({error: "Não foi possivel encontrar uma conta!"});
    }

    next();

  }catch(err){
    return response.status(400).json({error: err});
  }
}

app.post('/users', (request, response) => {
  try{
    const { name, username } = request.body;

    // verifica se já existe conta pra esse usuario
    if(users.some((user) => user.name === name && user.username === username)){
      return response.status(400).json({error: "Conta já existente!"});
    }

    const user = { 
      id: uuidv4(),
      name, 
      username, 
      todos: []
    }
    users.push(user);
    return response.status(201).json(users[users.length - 1]);
  }catch(err){
    return response.status(400).json({error: err});
  }
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  try{
    const { username } = request.headers;

    const user = users.find(user => user.username === username);

    return response.status(201).json(user.todos);
  }catch(err){
    return response.status(400).json({error: err});
  }
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  try{
    const { username } = request.headers;
    const { title, deadline } = request.body;
    
    const todo = { 
      id: uuidv4(),
      title,
      done: false, 
      deadline: new Date(deadline), 
      created_at: new Date()
    }

    for(let i = 0; i < users.length; i++){
      if(users[i].username === username){
        users[i].todos.push(todo);
      }
    }

    const user = users.find(user => user.username === username);
    return response.status(201).json(user.todos[user.todos.length - 1]);
  }catch(err){
    return response.status(400).json({error: err});
  }
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  try{
    const { username } = request.headers;
    const { id } = request.params;
    const { title, deadline } = request.body;
    let alter = false;

    for(let i = 0; i < users.length; i++){
      if(users[i].username === username){
        for(let a = 0; a < users[i].todos.length; a++){
          if(users[i].todos[a].id === id){
            users[i].todos[a].title = title;
            users[i].todos[a].deadline = deadline;
            alter = true;
          }
        }
      }
    }

    if(!alter){
      return response.status(404).json({error: "Todo não encontrado"});
    }
    const user = users.find(user => user.username === username);
    const todo = user.todos.find(todo => todo.id === id);
    return response.status(201).json(todo);
  }catch(err){
    return response.status(400).json({error: err});
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  try{
    const { username } = request.headers;
    const { id } = request.params;

    let alter = false;
    for(let i = 0; i < users.length; i++){
      if(users[i].username === username){
        for(let a = 0; a < users[i].todos.length; a++){
          if(users[i].todos[a].id === id){
            users[i].todos[a].done = true;
            alter = true;
            return response.status(201).json(users[i].todos[a]);
          }
        }
      }
    }
    if(!alter){
      return response.status(404).json({error: "Todo não encontrado"});
    }
    
  }catch(err){
    return response.status(400).json({error: err});
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  try{
    const { username } = request.headers;
    const { id } = request.params;
    let alter = false;

    for(let i = 0; i < users.length; i++){
      if(users[i].username === username){
        for(let a = 0; a < users[i].todos.length; a++){
          if(users[i].todos[a].id === id){
            users[i].todos.splice(a,1);
            alter = true;
            return response.status(204).json([]);
          }
        }
      }
    }

    if(!alter){
      return response.status(404).json({error: "Todo não encontrado"});
    }
    return response.status(201);
  }catch(err){
    return response.status(400).json({error: err});
  }
});

module.exports = app;