import db from "../models/index.js";
import UserProfileFullResource from "./userprofilefullresource.js";

const Op = db.Sequelize.Op;

const ProjectResource = async (user, currentUser = null) => {
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

    let user = await db.User.findOne({where:{id: p.userId}})
    let chat = await db.Chat.findOne({where: {projectId: p.id}})
    const UserFullResource = {
        id: p.id,
        appIdea: p.appIdea,
        targettedAudience: p.targettedAudience,
        projectName: p.projectName,
        email: p.email,
        phone: p.phone,
        user: await UserProfileFullResource(user),
        chat: chat,
        projectImage: p.projectImage,
        projectImageThumb: p.projectImageThumb
        
    }


    return UserFullResource;
}

export default ProjectResource;