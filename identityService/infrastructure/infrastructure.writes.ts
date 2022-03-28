import {getToken} from "../utils/utils";
import * as mongo from './infrastructure.shared';
import mongoose from "mongoose";

export async function registerUser(first_name, last_name, email, hash, roles, organization, _id?)  {
    if(_id) {
        var id = new mongoose.Types.ObjectId(_id);
        return await mongo.MongoUser.create({
            _id: id,
            first_name: first_name,
            last_name: last_name,
            email: email,
            hash: hash,
            roles: roles,
            organizationId: organization
        });
    } else {
        return await mongo.MongoUser.create({
            first_name: first_name,
            last_name: last_name,
            email: email,
            hash: hash,
            roles: roles,
            organizationId: organization
        });
    }

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

export function deleteUser(email): Object {
    return mongo.MongoUser.findOneAndDelete({email: email}).exec().then(res => {
        console.log(res);
        return res;
    })
}

