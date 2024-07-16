
const Team = (sequelize, Sequelize) => {
    const Team = sequelize.define('Team', {
        status: {
          type: Sequelize.ENUM('pending', 'accepted', 'rejected'),
          defaultValue: 'pending'
        },
        fromUser:{ // user who sent the invite
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        toUser:{ // user who sent the invite
            type: Sequelize.INTEGER,
            allowNull: false,
        },
      });

      return Team
}

export default Team