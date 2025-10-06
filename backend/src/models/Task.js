import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

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

}, {
    timestamps: true,
});

export {Task} ;