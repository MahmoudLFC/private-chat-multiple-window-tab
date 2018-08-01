let express = require('express')
let app = express();

var router = express.Router();

let http = require('http');
let server = http.Server(app);

let socketIO = require('socket.io');
let io = socketIO(server);

const Sequelize = require("sequelize");

//localhost

const sequelize = new Sequelize('chatting_npm', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    operatorsAliases: false,
});

// online server
/*
const sequelize = new Sequelize('cpmsprod_chatting', 'cpmsprod_cpm', 'WT~W*@T74mhU', {
    host: 'localhost',
    dialect: 'mysql',
    operatorsAliases: false,
});
*/

var MessageModel = sequelize.import(__dirname + "/models/messages.js");

app.use(express.static('views'));

var APIRouter = require('./routes/api');

app.use('/api', APIRouter);

var users = [];

const port = process.env.PORT || 3000;


io.on('connection', (socket) => {


    var handshakeData = socket.request;
    var current_user = handshakeData._query['id'];

    if (current_user != undefined) {
        
        /*
        MessageModel.findAll().then(message => {
            console.log(JSON.stringify(message))
        })*/

        if (users.length > 0) {
            index = users.findIndex(elem => elem.id == current_user);
            if (index == -1) {
                users.push({ id: current_user, sockets: [socket.id] })
            } else {
                users[index].sockets.push(socket.id)

            }
        } else {
            users.push({ id: current_user, sockets: [socket.id] })
        }
    }


    socket.on('login', (data) => {

        if (users.length > 0) {
            index = users.findIndex(elem => elem.id == data.user_id);
            if (index == -1) {
                users.push({ id: data.user_id, sockets: [socket.id], status: 'online' })
            } else {
                users[index].sockets.push(socket.id)
                users[index].sockets.status = 'online'

            }
        } else {
            users.push({ id: data.user_id, sockets: [socket.id], status: 'online' })
        }
    })

    socket.on('send message', function (data) {

        to_user_sockets = [];
        from_user_sockets = [];

        to_user = users.findIndex(elem => elem.id == data.to_user_id);
        if (to_user != -1) {
            if (users[to_user].sockets != undefined) {
                to_user_sockets = users[to_user].sockets
            }
        }

        from_user = users.findIndex(elem => elem.id == data.from_user_id);
        if (from_user != -1) {
            if (users[from_user].sockets != undefined) {
                from_user_sockets = users[from_user].sockets
            }
        }

        to_sockets = to_user_sockets.concat(from_user_sockets);

        if (to_sockets.length > 0) {

            MessageModel.create({ from_user_id: data.from_user_id, to_user_id: data.to_user_id, message_text: data.message, is_read: 0 })
                .then(function () {

                })

            for (var key in to_sockets) {
                var socket_id = to_sockets[key];
                io.to(socket_id).emit('new message', { message: data.message, to: data.to_user_id, from: data.from_user_id, from_user_name: data.from_user_name, to_user_name: data.to_user_name });
            }
        }

    })


    socket.on('logout', (data) => {

        index = users.findIndex(elem => elem.id == data.user_id);

        if (!users[index]) return;

        users[index].sockets = [];
        users[index].status = 'offline'
    })

    socket.on('disconnect', (data) => {
        to_user = users.findIndex(elem => elem.id == current_user);

        if (!users[to_user]) return;

        /*if (users[to_user].sockets.length > 0) {
            var index = users[to_user].sockets.indexOf(socket.id)
            delete users[to_user].sockets[index]
            if (users[to_user].sockets.length == 0)
                delete users[to_user];
        } else {
            delete users[to_user];
        }*/

        if (users[to_user].sockets.length > 0) {
            var index = users[to_user].sockets.indexOf(socket.id)
            delete users[to_user].sockets[index]
            if (users[to_user].sockets.length == 0)
                users[to_user].sockets = [];
            users[to_user].status = 'offline'
        } else {
            users[to_user].sockets = [];
            users[to_user].status = 'offline'
        }

    })

});

server.listen(port, () => {
    console.log(`started on port: ${port}`);
});