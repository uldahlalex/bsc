/**
 * Script to seed taskstore
 */

const {faker} = require("@faker-js/faker");
const MongoClient = require("mongodb").MongoClient;
const mongoose = require('mongoose');
function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}
async function seedDB() {

    const client = new MongoClient('mongodb://alex:q1w2e3r4@localhost:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false', {
        useNewUrlParser: true,
        // useUnifiedTopology: true,
    });
    try {
        await client.connect();
        console.log("Connected correctly to server");
        const collection = client.db("test").collection("tasks");
        // The drop() command destroys all data from a collection.
        // Make sure you run it against proper database and collection.
        await collection.drop();
        // make a bunch of time series data
        let tasks = [];
        for (let i = 0; i < 10; i++) {
            const title = faker.git.commitMessage();
            const desc = faker.lorem.sentence()
            const timestamp = faker.time.recent();
            const subtasks = [];
                for (let j = 0; j < 2; j++) {
                    const id = mongoose.Types.ObjectId();
                    const title = faker.git.commitMessage();
                    const desc = faker.lorem.sentence()
                    const timestamp = faker.time.recent();
                    const innerTasks = [];
                    for (let k = 0; k < 2; k++) {
                        const id = mongoose.Types.ObjectId();
                        const title = faker.git.commitMessage();
                        const desc = faker.lorem.sentence()
                        const timestamp = faker.time.recent();
                        innerTasks.push({
                            id: id,
                            title: title,
                            desc: desc,
                            timestamp: timestamp
                        })
                    }
                    subtasks.push({
                        id: id,
                        title: title,
                        desc: desc,
                        timestamp: timestamp,
                        subtasks: innerTasks
                    });
                }
            tasks.push({
                title: title,
                desc: desc,
                timestamp: timestamp,
                subtasks: subtasks
            });
        }
        await collection.insertMany(tasks);
        console.log("Database seeded! :)");
        await client.close();
    } catch (err) {
        console.log(err.stack);
    }
}
seedDB();