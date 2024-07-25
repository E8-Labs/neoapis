const SubscriptionModel = (sequelize, Sequelize) => {
    const Subscription = sequelize.define("Subscription", {
        subid: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
        data: {
            type: Sequelize.STRING(8000)
        },
        environment: {
            type: Sequelize.STRING,
            defaultValue: "Sandbox",
            allowNull: false,
        },
        customerId: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: false,
        },
        status: {
            type: Sequelize.STRING,
            allowNull: false
        },
        
    });
    return Subscription;
};

export default SubscriptionModel;
