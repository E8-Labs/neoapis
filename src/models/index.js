import dbConfig from "../config/db.config.js";
import CallModel from "./call.model.js";
import User from "./user.model.js";
import Project from "./Project.model.js";
// import Team from "./Team.model.js";
import { Chat } from "./chat/chat.model.js";
import { Message } from "./chat/message.model.js";
import Invitation from './invitation.model.js'
import SubscriptionModel from "./subscription.model.js";
import TransactionModel from "./transaction.model.js";
import InvitedProject from "./InvitedProject.model.js";
import Notification from "./Notification.model.js";


import Sequelize from 'sequelize'

const sequelize = new Sequelize(dbConfig.MYSQL_DB, dbConfig.MYSQL_DB_USER, dbConfig.MYSQL_DB_PASSWORD, {
  host: dbConfig.MYSQL_DB_HOST,
  port: dbConfig.MYSQL_DB_PORT,
  dialect: dbConfig.dialect,
  logging: false
});

try {
  await sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

let models = {}

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
 

db.User = User(sequelize, Sequelize);
models["User"] = db.User
db.CallModel = CallModel(sequelize, Sequelize);
models["CallModel"] = db.CallModel

db.Project = Project(sequelize, Sequelize);
models["Project"] = db.Project

db.User.hasMany(db.Project, {foreignKey: "userId", as: "Projects"})
db.Project.belongsTo(db.User, {foreignKey: "userId", as: "User"})

db.Invitation = Invitation(sequelize, Sequelize);
models["Invitation"] = db.Invitation

db.Chat = Chat(sequelize, Sequelize);
models["Invitation"] = db.Invitation

db.Project.hasMany(db.Chat, {foreignKey: "projectId", as: "Chats"})
db.Chat.belongsTo(db.Project, {foreignKey: "projectId", as: "Project"})


db.Message = Message(sequelize, Sequelize);
models["Message"] = db.Message
db.Message.belongsTo(db.Chat, {foreignKey: 'chatId', as: "Chat"})
db.Chat.hasMany(db.Message, {foreignKey: 'chatId', as: 'Messages'})



db.SubscriptionModel = SubscriptionModel(sequelize, Sequelize);
models["SubscriptionModel"] = db.SubscriptionModel
db.SubscriptionModel.belongsTo(db.User);
db.User.hasMany(db.SubscriptionModel);

db.TransactionModel = TransactionModel(sequelize, Sequelize);
models["TransactionModel"] = db.TransactionModel

db.InvitedProject = InvitedProject(sequelize, Sequelize)
models["InvitedProject"] = db.InvitedProject
// db.Team = Team(sequelize, Sequelize);
// db.User.hasMany(db.Team, {foreignKey: "userId", as: "Teams"})
// db.Team.belongsTo(db.User, {foreignKey: "userId", as: "User"})


db.Notification = Notification(sequelize, Sequelize);
models["Notification"] = db.Notification

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});


export default db;