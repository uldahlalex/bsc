import mongoose from "mongoose";

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

export async function getUserInfosFromListOfIds(ids: []): Promise<any[]> {
    let users: any[] = []
    for (let i = 0; i < ids.length; i++) {
        await User.findById(ids).exec().then((r: any) => {
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
        return !!User.findOne({email});
    }
export async function login(email) {
    return User.findOne({email});
}