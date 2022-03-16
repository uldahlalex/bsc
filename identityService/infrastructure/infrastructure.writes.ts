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