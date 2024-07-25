let SubscriptionModel = (sequelize, Sequelize) => {
    const Model = sequelize.define("Subscription", {
        subid: {
            type: Sequelize.STRING(100)
        },
      data: {
        type: Sequelize.STRING(8000)
      },
      environment: {
        type: Sequelize.STRING,
        defaultValue: "Sandbox",
        allowNull: false,
      }
      
    });
    // Chat.belongsTo(User);
    // Chat.belongsTo(Prompt)
    return Model;
  };
  export default SubscriptionModel;