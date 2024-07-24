// import { defaultValueSchemable } from "sequelize/types/utils";

export const Message = (sequelize, Sequelize)=> {
    const Message = sequelize.define('Message', {
        content: {
            type: Sequelize.TEXT,
            allowNull: false,
            defaultValue: ''
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
          },
          imageThumb: {
            type: Sequelize.STRING,
            allowNull: true,
          },
          docUrl:{
            type: Sequelize.STRING,
            allowNull: true,
          },
          tokens: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0,
          },
          finishReason: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: "stop"
          },
          visibility: {
            type: Sequelize.STRING,
            defaultValue: "visible"
          }
      });

      return Message
}