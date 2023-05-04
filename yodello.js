const {v4 : uuidv4} = require('uuid')

function Task(name, description, dueDate, status) {
    this.id = uuidv4();
    this.name = name;
    this.description = description;
    this.dueDate = dueDate;
    this.status = status;
}

module.exports = {
    Task: Task
}