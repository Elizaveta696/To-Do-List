import { User } from '../models/User.js';
import {Team } from '../models/Team.js';
import { Task } from '../models/Task.js';
import {Team_member} from  '../models/Team_member.js';
import { applyAssociations } from "../models/associations.js";

export const models = { User, Team, Task, Team_member };

applyAssociations();
