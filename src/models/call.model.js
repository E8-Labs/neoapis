const CallModel = (sequelize, Sequelize) => {
    const Model = sequelize.define("CallModel", {
        phone:{
            type: Sequelize.STRING,
            default: '',
            allowNull: false,
        },
        callId: {
            type: Sequelize.STRING,
            default: '',
            allowNull: false
        },
        transcript: {
            type: Sequelize.TEXT,
            default: '',
            allowNull: false
        },
        summary: {
            type: Sequelize.TEXT,
            default: '',
            allowNull: false
        },
        duration: {
            type: Sequelize.TEXT,
            default: '',
            allowNull: false
        },
        status: {
            type: Sequelize.TEXT,
            default: '',
            allowNull: false
        },
    })
    return Model
}

export default CallModel