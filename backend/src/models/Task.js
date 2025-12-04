import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';
import { User } from './User.js';
import { Team } from './Team.js'

export class Task extends Model {}

Task.init({
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        defaultValue: '',
    },
    teamId: {
        type:DataTypes.INTEGER,
        allowNull:true,
        references: {
            model: 'team',
            key:'id'
        }
    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull:false,
        references: {
            model: User,
            key: 'id',
        },
        
    },
    priority: {
        type: DataTypes.ENUM('high', 'medium', 'low'),
        allowNull: false,
        defaultValue: 'medium',
    },
}, {
    sequelize,
    modelName: "Task",
    tableName: "tasks",
});

User.hasMany(Task, {foreignKey: 'userId', onDelete: 'CASCADE' });
Task.belongsTo(User, { foreignKey: 'userId'});

Team.hasMany(Task, { foreignKey: 'teamId', onDelete: 'CASCADE'});
Task.belongsTo(Team, { foreignKey: 'teamId'});