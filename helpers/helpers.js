const Sequelize = require("sequelize");

// localhost server

const sequelize = new Sequelize('cpm', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    operatorsAliases: false,
});

// online server
/*
const sequelize = new Sequelize('cpmsprod_cpms', 'cpmsprod_cpm', 'WT~W*@T74mhU', {
    host: 'localhost',
    dialect: 'mysql',
    operatorsAliases: false,
});
*/
const Op = Sequelize.Op;

var UserModel = sequelize.import("../models/users.js");

module.exports = {

    isAuthenticated: async function (req, res, next) {

        // do any checks you want to in here

        // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
        // you can do this however you want with whatever variables you set up
        var header = req.headers['authorization'] || '',        // get the header
            token = header.split(/\s+/).pop() || '';            // and the encoded auth token

        user = await UserModel.count({
            where: {
                'api_token': token,
                id: parseInt(req.params.from_user_id),
                user_type: {
                    [Op.not]: 1
                }
            }
        }).then(c => {
            return c;
        });
        if (user >= 1) {
            return next();
        } else {
            // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
            res.json({ status: 4, message: 'unathenticated' });
        }
    }
};