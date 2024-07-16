export const Message = (sequelize, Sequelize)=> {
    const Message = sequelize.define('Message', {
        content: {
            type: Sequelize.TEXT,
            allowNull: false
          },
          senderType: {
            type: Sequelize.ENUM('user', 'gpt'),
            allowNull: false
          },
          userId: {
            type: Sequelize.INTEGER,
            allowNull: true // null if senderType gpt
          },
          image: {
            type: Sequelize.STRING,
            allowNull: true,
          }
      });

      return Message
}