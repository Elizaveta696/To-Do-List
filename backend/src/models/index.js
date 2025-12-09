import { applyAssociations } from "../models/associations.js";
import { Task } from "../models/Task.js";
import { Team } from "../models/Team.js";
import { Team_member } from "../models/Team_member.js";
import { User } from "../models/User.js";

export const models = { User, Team, Task, Team_member };

applyAssociations();
