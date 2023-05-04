var app = new Vue({
    el: '#app',

    data: {
        tasks: [],
        socket: null,

        editName: "",
        editDesc: "",
        editDue: "",
        editTxt: "Edit",

        newName: "",
        newDesc: "",
        newDue: "",
    },

    computed: {
        todoTasks: function() {
            return this.tasks.filter(function(task) {
                return task.task.status == "todo";
            });
        },
        inProgressTasks: function() {
            return this.tasks.filter(function(task) {
                return task.task.status == "in-progress";
            });
        },
        doneTasks: function() {
            return this.tasks.filter(function(task) {
                return task.task.status == "done";
            });
        }
    },

    methods: {
        connectSocket: function() {
            this.socket = new WebSocket('ws://localhost:8080');
            // this.socket = new WebSocket('wss://yodello.herokuapp.com');
            this.socket.onmessage = (e) => {
                var msg = JSON.parse(e.data);
                if (msg.action == "tasks") {
                    this.tasks = [];
                    msg.message.forEach(task => {
                        this.tasks.push({
                            task: task,
                            editing: false,
                        })
                    });
                } else {
                    console.log(msg.message)
                }
            }
        },
        editTask: function(task) {
            task.editing = !task.editing;
            this.editTxt = task.editing ? "Cancel" : "Edit";
            this.editName = task.task.name;
            this.editDesc = task.task.description;
            this.editDue = task.task.dueDate;
        },
        updateTask: function(task) {
            task.editing = false;
            task.task.name = this.editName;
            task.task.description = this.editDesc;
            task.task.dueDate = this.editDue;
            this.socket.send(JSON.stringify({
                action: "update",
                id: task.task.id,
                task: task.task
            }));
            this.editName = "";
            this.editDesc = "";
            this.editDue = "";
            this.editTxt = task.editing ? "Cancel" : "Edit";
        },
        addTask: function() {
            this.socket.send(JSON.stringify({
                action: "new",
                name: this.newName,
                description: this.newDesc,
                dueDate: this.newDue,
                status: "todo"
            }));
            this.newName = "";
            this.newDesc = "";
            this.newDue = "";
        },
        changePriority: function(event) {
            let id = event.target.dataset.id;
            let index = this.tasks.findIndex(task => task.task.id == id);
            this.tasks[index].task.status = event.target.value;
            this.socket.send(JSON.stringify({
                action: "update",
                id: id,
                task: this.tasks[index].task
            }));
        },
        deleteTask: function() {
            let id = event.target.dataset.id;
            this.socket.send(JSON.stringify({
                action: "delete",
                id: id
            }))
        }
    },

    created: function() {
        this.connectSocket();
    }
});