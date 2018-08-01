const Sequelize = require("sequelize");

// localhost server

const sequelize = new Sequelize('chatting_npm', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    operatorsAliases: false,
});

const sequelize_user = new Sequelize('cpm', 'root', '', {
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

const sequelize_user = new Sequelize('cpmsprod_cpms', 'cpmsprod_cpm', 'WT~W*@T74mhU', {
    host: 'localhost',
    dialect: 'mysql',
    operatorsAliases: false,
});
*/
const Op = Sequelize.Op;

var MessageModel = sequelize.import("../models/messages.js");
var UserModel = sequelize_user.import("../models/users.js");

//get all messages

exports.index = function (req, res) {
    MessageModel.findAll().then(messages => {
        res.json({ status: 1, message: 'data recevied', data: messages });
    });

};

// Display chat details between 2 users and paginate .

exports.chat_detail = async function (req, res) {
    try {
        var data = {};
        var offset = req.query.page & req.query.per_page ? (parseInt(req.query.page) - 1 * parseInt(req.query.per_page)) : 0;
        var limit = req.query.per_page ? parseInt(req.query.per_page) : 20;
        var page = req.query.page ? parseInt(req.query.page) : 1;

        messages = await MessageModel.findAndCountAll({
            where: {
                [Op.and]: [
                    { to_user_id: [parseInt(req.params.to_user_id), parseInt(req.params.from_user_id)] },
                    { from_user_id: [parseInt(req.params.to_user_id), parseInt(req.params.from_user_id)] }
                ]
            },
            offset: offset,
            limit: limit,
            order: [
                ['createdAt', 'DESC']
            ]
        }).then(messages => {
            return { messages: messages.rows, total_count: messages.count, total_pages: Math.ceil(messages.count / parseInt(req.query.per_page)) }
            // res.json({
            //     status: 1, message: 'data recevied', data: messages.rows,
            //     total_count: messages.count, total_pages: Math.ceil(messages.count / parseInt(req.query.per_page))
            // });
        });


        first_user = await UserModel.findById(parseInt(req.params.from_user_id)).then(user => {
            return user ? user.name : '';
        });

        second_user = await UserModel.findById(parseInt(req.params.to_user_id)).then(user => {
            return user ? user.name : '';
        });
        var data_messages = messages.messages;
        data_messages.map((element) => {
            if (element.from_user_id == req.params.from_user_id) {
                element.dataValues.from_user_name = first_user;
            } else if (element.from_user_id == req.params.to_user_id) {
                element.dataValues.from_user_name = second_user;
            }
            return element
        })
       
        data.status = 1;
        data.message = 'data recieved';
        data.data = data_messages;
        data.total_count = messages.total_count;
        data.total_pages = messages.total_pages;

    } catch (error) {
        data.status = 2;
        data.message = error;
    } finally {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        console.log(data.data)
        res.json(data);
    }
};