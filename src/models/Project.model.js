
const Project = (sequelize, Sequelize) => {
    const Project = sequelize.define('Project', {
        appIdea: {
          type: Sequelize.STRING,
          allowNull: false
        },
        targettedAudience: {
          type: Sequelize.STRING,
          allowNull: false
        },
        projectName: {
          type: Sequelize.STRING,
          allowNull: false
        },
        projectImage: {
          type: Sequelize.STRING,
          allowNull: true
        },
        projectImageThumb: {
          type: Sequelize.STRING,
          allowNull: true
        },
      });
      
    //   Project.belongsTo(User, { foreignKey: 'userId' });
    //   User.hasMany(Project, { foreignKey: 'userId' });
      
      return Project
}


export default Project