const express = require('express');
const ws = require('ws');
const util = require('util');
const {v4 : uuidv4} = require('uuid')

const app = express();
const port = process.env.PORT || 8080;

app.use (express.static('public'));
app.use (express.urlencoded({ extended: true }));

const server = app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

function Task(name, description, dueDate, status) {
    this.id = uuidv4();
    this.name = name;
    this.description = description;
    this.dueDate = dueDate;
    this.status = status;
}

var tasks = [];

var newTask = new Task('Make server', 'build the server', '4/21/22', 'todo');
var newTask2 = new Task('Make client', 'build the client', '4/21/22', 'in-progress');
tasks.push(newTask);
tasks.push(newTask2);
console.log(`Starting tasks: ${util.inspect(tasks)}`);

function updateClients(clients) {
    clients.forEach(client => {
        client.send(JSON.stringify({
            action: 'update',
            message: tasks
        }));
    });
}

var yodelers = [];
const wss = new ws.Server({ server });
wss.on('connection', (ws) => {
    yodelers.push(ws);
    ws.send(JSON.stringify({
        action: 'tasks',
        message: tasks
    }));

    ws.on('message', (message) => {
        var msg = JSON.parse(message);
        console.log(`received message: ${msg.action}`);
        switch (msg.action) {
            case 'new':
                var newTask = new Task(msg.name, msg.description, msg.dueDate, msg.status);
                tasks.push(newTask);
                wss.clients.forEach(client => {
                    client.send(JSON.stringify({
                        action: 'tasks',
                        message: tasks
                    }));
                });
                break;
            case 'update':
                var index = tasks.findIndex(task => task.id == msg.id);
                console.log(`index: ${index}`);
                tasks[index].name = msg.task.name;
                tasks[index].description = msg.task.description;
                tasks[index].dueDate = msg.task.dueDate;
                tasks[index].status = msg.task.status;
                wss.clients.forEach(client => {
                    client.send(JSON.stringify({
                        action: 'tasks',
                        message: tasks
                    }));
                });
                break;
            case 'delete':
                var index = tasks.findIndex(task => task.id == msg.id);
                tasks.splice(index, 1);
                wss.clients.forEach(client => {
                    client.send(JSON.stringify({
                        action: 'tasks',
                        message: tasks
                    }));
                });
                break;
            default:
                console.log(`unknown action: ${msg.action}`);
                break;
        }
        console.log(`tasks: ${util.inspect(tasks)}`);
    })
});