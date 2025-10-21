import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { User } from './User.js';

const Task = sequelize.define('Task', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        defaultValue: '',
    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull:false,
        references: {
            model: User,
            key: 'id',
        },
    },

}, {
    timestamps: true,
});

User.hasMany(Task, {foreignKey: 'userId', onDelete: 'CASCADE' });
Task.belongsTo(User, { foreignKey: 'userId'});

export {Task} ;