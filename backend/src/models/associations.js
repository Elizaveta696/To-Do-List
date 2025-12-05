import { User } from './User.js';
import { Team } from './Team.js';
import { Task } from './Task.js';
import { Team_member } from './Team_member.js';

export const applyAssociations = () => {

    // task <-> user
    User.hasMany(Task, {foreignKey: 'userId', onDelete: 'CASCADE' });
    Task.belongsTo(User, { foreignKey: 'userId'});

    // task <-> team
    Team.hasMany(Task, { foreignKey: 'teamId', sourceKey: "teamId", onDelete: 'CASCADE'});
    Task.belongsTo(Team, { foreignKey: 'teamId', sourceKey: "teamId" });

    // user <-> team_member
    User.hasMany(Team_member, { foreignKey: "userId", onDelete: "CASCADE" });
    Team_member.belongsTo(User, { foreignKey: "userId" });

    // team_member <-> team
    Team.hasMany(Team_member, { foreignKey: "teamId", sourceKey: "teamId", onDelete: "CASCADE" });
    Team_member.belongsTo(Team, { foreignKey: "teamId", sourceKey: "teamId" });
}

