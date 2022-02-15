#!/usr/bin/env node

import express from 'express';
import http from 'http';
import minimist from 'minimist';
import "reflect-metadata";
import {createConnection} from "typeorm";
import {Task} from "./task";
import * as amqp from 'amqplib/callback_api';
import path from "path";
//const client = import('./grpc.client');

const app = express();
const server = http.createServer(app)
const argv = minimist(process.argv.slice(1));
const port = argv['port'] || 3001;


let taskRepo;
let taskChannel;
let instanceQ;

amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
        throw error0;
    }/*
    connection.createChannel(function (error1, channel) {

        channel.assertExchange("topic_logs", 'topic', {
            durable: false
        });

        channel.assertQueue('', {
            exclusive: true
        }, function (error2, q) {
            if (error2) {
                throw error2;
            }
            instanceQ = q;
            taskChannel.consume(instanceQ.queue, function (msg) {
                console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());
            }, {
                noAck: true
            });
            const args = ["#", "topic.*", "*.critical"];
            args.forEach( key => {
                channel.bindQueue(instanceQ.queue, "topic_logs", key);
            })
            taskChannel = channel;

        });
    });*/
});



createConnection({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "postgres",
    synchronize: true,
    logging: false,
    entities: [
        Task
    ]
}).then(connection => {
    taskRepo = connection.getRepository(Task)
}).catch(error => console.log(error))
const PROTO_PATH = "./task.proto";

const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");

var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true
});

const TaskService = grpc.loadPackageDefinition(packageDefinition).TaskService;
const client = new TaskService(
    "localhost:30043",
    grpc.credentials.createInsecure()
);



import bodyParser from "body-parser";
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
client.GetAll(null, (err, data) => {
        console.log(data)
});
app.get('/tasks', async (req, res) => {
    //await taskRepo.find()
    //taskChannel.publish("topic_logs", "topic.critical", Buffer.from('topic message - very critical'))

    res.send()
})


app.get('/tasks/something', async (req, res) => {
    taskChannel.publish("topic_logs", "yada.critical", Buffer.from('not topic message - but very critical'))
    res.send(await taskRepo.find())
})

app.get('/tasks/other', async (req, res) => {
    taskChannel.publish("topic_logs", "topic.noncritical", Buffer.from('topic message - not very critical'))
    res.send(await taskRepo.find())
})

app.post('/tasks', async (req, res) => {


})

app.get('/sendToIdentity', async (req, res) => {

})


server.listen(port, () => {
    console.log('now listening on port ' + port)
})


