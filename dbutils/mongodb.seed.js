const mongoose = require("mongoose");
const {faker} = require('@faker-js/faker');
const bcrypt = require("bcryptjs");

const User = mongoose.model("user",
    new mongoose.Schema({
        first_name: { type: String, default: null },
        last_name: { type: String, default: null },
        email: { type: String, unique: true },
        hash: {type: String },
        id: {type: mongoose.Schema.Types.ObjectId},
        token: {type: String},
        organizationId: {type: Number },
        roles: [String]
    }));

mongoose.connect("mongodb://root:example@localhost:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false")
    .then(
        () => {
                console.log('Connected to MongoDB')
        },
        err => {
                console.log(err)
        }
    );

async function seed() {
    const encryptedPassword = await bcrypt.hash("1234", 10);
    for (let i = 0; i<1000000; i++) {
        await User.create({
            first_name: faker.name.firstName(),
            last_name: faker.name.lastName(),
            email: faker.internet.email()+Math.random()*1234,
            hash: encryptedPassword,
            organizationId: 54,
            roles: ["Member"]
        })
    }
}

async function getById() {
    await User.findById("622af82e01dec6edfcc56d39").explain().then(res => {
        console.log(res)
    })
}

function count() {
     User.count({},(err, count) => {
        console.log('The amount of documents in the Users collection is: '+count);
    })
}

count();