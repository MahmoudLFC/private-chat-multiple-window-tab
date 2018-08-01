module.exports = (sequelize, DataTypes) => {

	return sequelize.define('messages', {

		from_user_id: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		to_user_id: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		message_text: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		is_read: {
			type: DataTypes.BOOLEAN,
			allowNull: true,
			defaultValue: false
		}
	})
}
