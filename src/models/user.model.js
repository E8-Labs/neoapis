const User = (sequelize, Sequelize) => {
    const User = sequelize.define("User", {
      name: {
        type: Sequelize.STRING,
        defaultValue: ''
      },
      phone: {
        type: Sequelize.STRING,
        defaultValue: ''
      },
      
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      
      profile_image: { // we store smaller image for fast loading here
        type: Sequelize.STRING,
        defaultValue: ''
      },
      full_profile_image: { // we store full size image here
        type: Sequelize.STRING,
        defaultValue: ''
        
      },
      customerId: { // we store full size image here
        type: Sequelize.STRING,
        defaultValue: ''
        
      },
    });
  
    return User;
  };

  export default User;