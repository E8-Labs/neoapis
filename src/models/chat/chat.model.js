export const Chat = (sequelize, Sequelize)=> {
    const Chat = sequelize.define('Chat', {
        projectId: {
          type: Sequelize.INTEGER,
          allowNull: false
        }
      });

      return Chat
}