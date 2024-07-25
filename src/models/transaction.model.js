const TransactionModel = (sequelize, Sequelize) => {
    const Transaction = sequelize.define("Transaction", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        invoiceId: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: false
        },
        invoiceUrl: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        },
        customerId: {
            type: Sequelize.STRING,
            defaultValue: ""
        },
        subscriptionId: {
            type: Sequelize.STRING,
            defaultValue: ''
        },
        amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        },
        currency: {
            type: Sequelize.STRING,
            allowNull: false
        },
        status: {
            type: Sequelize.STRING,
            allowNull: false
        },
        createdAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        updatedAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    });
    return Transaction;
};

export default TransactionModel;
