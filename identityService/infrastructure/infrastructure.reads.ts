import * as mongo from './infrastructure.shared';

export async function getUserInfosFromListOfIds(ids: []): Promise<any[]> {
    let users: any[] = []
    for (let i = 0; i < ids.length; i++) {
        await mongo.MongoUser.findById(ids).exec().then((r: any) => {
            let u: any = {};
            u._id = r._id.toString();
            u.first_name = r.first_name;
            u.last_name = r.last_name;
            u.email = r.email;
            u.roles = r.roles;
            u.organizationId = r.organizationId
            users.push(u)
        })
    }
    return users;
}


    export function findUser(email): boolean {
        return !!mongo.MongoUser.findOne({email});
    }
export async function login(email) {
    return mongo.MongoUser.findOne({email});
}