const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
    const { username } = request.headers;

    const user = users.find((user) => user.username === username);

    if (!user) {
        return response.status(404).json({ error: "User not found" });
    }
    request.user = user;
    return next();
}

app.post('/users', (request, response) => {
    const { name, username } = request.body;
    const userAlreadyExists = users.some(
        (user) => user.username === username
    );
    console.log(name);
    console.log(username);
    if (userAlreadyExists) {
        return response.status(400).json({ error: "User already exists!" });
    }

    users.push({
        id: uuidv4(),
        name,
        username,
        todos: [],
    });

    return response.status(201).send();
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body;
    const { user } = request;
    const todosTasks = {
        id: uuidv4(),
        title,
        done: false,
        deadline: new Date(deadline),
        created_at: new Date(),
    };

    user.todos.push(todosTasks);
    return response.status(201).send();

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    const { id } = request.params;
    const { title, deadline } = request.body;


    const idtask = user.todos.find((idtask) => idtask.id === id);

    if (!idtask) {
        return response.status(404).json({ error: "ID task not found" });
    }
    idtask.title = title;
    idtask.deadline = new Date(deadline);
    return response.status(201).json(idtask);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    const { id } = request.params;

    const idtask = user.todos.find((idtask) => idtask.id === id);

    if (!idtask) {
        return response.status(404).json({ error: "ID task not found" });
    }
    idtask.done = true;
    return response.status(201).json(idtask);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    const { id } = request.params;

    const idtask = user.todos.findIndex((idtask) => idtask.id === id);

    if (idtask === -1) {
        return response.status(404).json({ error: "ID task not found" });
    }
    user.todos.splice(idtask, 1);

    return response.status(204).send();

});

module.exports = app;