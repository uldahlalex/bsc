import {getToken} from "../utils/utils";
import * as mongo from './infrastructure.shared';

export async function registerUser(first_name, last_name, email, hash, roles, organization)  {
    return await mongo.MongoUser.create({
        first_name: first_name,
        last_name: last_name,
        email: email,
        hash: hash,
        roles: roles,
        organization: organization
    });
}

export async function joinOrganization(req, res) {
    const token = getToken(req);
    try {
        await mongo.MongoUser
            .findByIdAndUpdate(token.user_id, {organizationId: req.body.organizationId}, {new: true}).exec().then(
                result => {
                    res.send(result)
                }
            )
    } catch (e) {
        console.log(e)
    }
}

export function deleteUser(id): Object {
    return mongo.MongoUser.findByIdAndDelete(id).exec().then(res => {
        console.log(res);
        return res;
    })
}

