import mongoose from "mongoose";
import {getToken} from "../utils/utils";
//mongoose.connect("mongodb://alex:q1w2e3r4@localhost:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false")
mongoose.connect("mongodb://root:example@localhost:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false")
    .then(
        () => {
            console.log('Connected to MongoDB')
        },
        err => {
            console.log(err)
        }
    );

export const User = mongoose.model("user",
    new mongoose.Schema({
        first_name: {type: String, default: null},
        last_name: {type: String, default: null},
        email: {type: String, unique: true},
        hash: {type: String},
        id: {type: mongoose.Schema.Types.ObjectId},
        token: {type: String},
        organizationId: {type: Number},
        roles: [String]
    }));

export async function registerUser(first_name, last_name, email, hash, roles, organization)  {
    return await User.create({
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
        await User
            .findByIdAndUpdate(token.user_id, {organizationId: req.body.organizationId}, {new: true}).exec().then(
                result => {
                    res.send(result)
                }
            )
    } catch (e) {
        console.log(e)
    }
}

