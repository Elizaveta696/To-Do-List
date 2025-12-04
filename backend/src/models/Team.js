import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

export class Team extends Model {}

Team.init({
        id: {
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    teamCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull:false,
    },
    passwordHashed: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull:false,
    },
}, {
    sequelize,
    modelName: "Teams",
    tableName: "teams",
});
