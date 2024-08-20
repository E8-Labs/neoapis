import db from "../models/index.js";
import ProjectResource from "./projectresource.js";
import UserProfileFullResource from "./userprofilefullresource.js";

const Op = db.Sequelize.Op;

const NotificationResource = async (user, currentUser = null) => {
    if (!Array.isArray(user)) {
        //////console.log("Not array")
        return await getUserData(user, currentUser);
    }
    else {
        //////console.log("Is array")
        const data = []
        for (let i = 0; i < user.length; i++) {
            const p = await getUserData(user[i], currentUser)
            //////console.log("Adding to index " + i)
            data.push(p);
        }

        return data;
    }
}

async function getUserData(p, currentUser = null) {

    let fromUser = await db.User.findOne({where:{id: p.fromUser}})
    let toUser = await db.Chat.findOne({where: {projectId: p.toUser}})

    let project = null
    if(p.projectId !== null){
        let pr = await db.Project.findByPk(p.projectId)
        project = await ProjectResource(pr)
    }
    const UserFullResource = {
        id: p.id,
        from: await UserProfileFullResource(fromUser),
        project: project,
        to: await UserProfileFullResource(toUser),
        isRead: p.isRead,
        notificationType: p.notificationType,
        createdAt: p.createdAt
        
    }


    return UserFullResource;
}

export default NotificationResource;