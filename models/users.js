module.exports = (sequelize, DataTypes) => {

    return sequelize.define('users', {

        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        api_token: {
            type: DataTypes.STRING,
            allowNull: false
        },
        user_type: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
            timestamps: false
        })
}