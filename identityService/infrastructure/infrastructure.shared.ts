import mongoose from "mongoose";
import minimist from 'minimist';

let uri;

const argv = minimist(process.argv.slice(1));
if ((argv['mongouser']==undefined) && (argv['mongopass']==undefined)) {
    uri = "mongodb://root:example@localhost:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false"
}
else {
    const mongouser = argv['mongouser'];
    const mongopass = argv['mongopass'];
    const db = argv['db'];
    uri =  "mongodb+srv://"+mongouser+":"+mongopass+"@"+db+".j5rym.mongodb.net/bsc?retryWrites=true&w=majority";
}

export function init() {
    mongoose.connect(uri)
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