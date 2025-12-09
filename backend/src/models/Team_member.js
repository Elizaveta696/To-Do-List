import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export class Team_member extends Model {}

Team_member.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("owner", "member"),
      allowNull: false,
      defaultValue: "member",
    },
  },
  {
    sequelize,
    modelName: "Team_member",
    tableName: "team_members",
    freezeTableName: true,
  },
);
