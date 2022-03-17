import mongoose from "mongoose";

export function init() {
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
}

export const MongoUser = mongoose.model("user",
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