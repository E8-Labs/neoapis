import db from "../models/index.js";
import UserProfileFullResource from "./userprofilefullresource.js";

const Op = db.Sequelize.Op;

const TeamResource = async (user, currentUser = null) => {
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
    let toUser = await db.User.findOne({where: {email: p.toUserEmail}})

    const UserFullResource = {
        id: p.id,
        toUserEmail: p.toUserEmail,
        status: p.status,
        fromUser: await UserProfileFullResource(fromUser),
        toUser: await UserProfileFullResource(toUser),
    }


    return UserFullResource;
}

export default TeamResource;