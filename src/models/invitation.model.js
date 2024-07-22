
const Invitation = (sequelize, Sequelize) => {
    const Invitation = sequelize.define('Invitation', {
        fromUser: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        toUser: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: null,
        },
        toUserEmail:{
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        status: {
          type: Sequelize.STRING,  //pending
          allowNull: false,
          defaultValue: 'pending'
        },
        name: {
            type: Sequelize.STRING,
            defaultValue: ''
          },
          role: {
            type: Sequelize.STRING,
            defaultValue: ""
          }
      });
      
    //   Project.belongsTo(User, { foreignKey: 'userId' });
    //   User.hasMany(Project, { foreignKey: 'userId' });
      
      return Invitation
}


export default Invitation