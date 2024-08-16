const InvitedProject = (sequelize, Sequelize) => {
    const InvitedProject = sequelize.define('InvitedProject', {
      // Define your other fields here
  
      // Foreign key to the Project model
      projectId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Projects', // Table name (plural form)
          key: 'id'
        }
      },
  
      // Foreign key to the User model (InvitedUser)
      InvitedUserId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users', // Table name (plural form)
          key: 'id'
        }
      },

      InvitedUserEmail: {
        type: Sequelize.STRING,
        allowNull: true,
        
      },
  
      // Foreign key to the User model (InvitingUser)
      InvitingUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Table name (plural form)
          key: 'id'
        }
      }
    });
  
    // Define associations
    InvitedProject.associate = (models) => {
      // Associate InvitedProject with Project
      InvitedProject.belongsTo(models.Project, {
        foreignKey: 'projectId',
        as: 'Project'
      });
  
      // Associate InvitedProject with User (InvitedUser)
      InvitedProject.belongsTo(models.User, {
        foreignKey: 'InvitedUserId',
        as: 'InvitedUser'
      });
  
      // Associate InvitedProject with User (InvitingUser)
      InvitedProject.belongsTo(models.User, {
        foreignKey: 'InvitingUserId',
        as: 'InvitingUser',
        onDelete: 'CASCADE'
      });
    };
  
    return InvitedProject;
  };
  
  export default InvitedProject;
  