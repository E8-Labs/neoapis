
const Notification = (sequelize, Sequelize) => {
    

const NotificationModel = sequelize.define('Notification', {
  fromUser: {
    type: Sequelize.INTEGER, // Assuming you're using user IDs as integers
    allowNull: false,
    references: {
      model: 'Users', // This should match your User model name
      key: 'id',
    },
  },
  toUser: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  projectId: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'Projects',
      key: 'id',
    },
  },
  notificationType: {
    type: Sequelize.ENUM('NewTeam', 'ProjectUpdated', 'InviteTeam', 'TeamInvitation', 'ProjectJoined'),
    allowNull: false,
  },
  isRead: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false, // Default to false, meaning unread
  },
});

return NotificationModel;

}


export default Notification