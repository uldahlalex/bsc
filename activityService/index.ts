#!/usr/bin/env node
import express from 'express';
import http from 'http';
import minimist from 'minimist';
import "reflect-metadata";
import * as amqp from 'amqplib/callback_api';
import cors from 'cors';
import jwt from "jsonwebtoken";
import cassandra from 'cassandra-driver';

const app = express();
const server = http.createServer(app)
const argv = minimist(process.argv.slice(1));
const port = argv['port'] || 3003;
const grpc = require('grpc')
const PROTO_PATH = './protos/activity.proto'
const TaskService = grpc.load(PROTO_PATH).ActivityService
const grpcClient = new TaskService('localhost:50053', grpc.credentials.createInsecure());
const client = new cassandra.Client({
    contactPoints: ['h1', 'h2'],
    localDataCenter: 'datacenter1',
    keyspace: 'ks1'
});


app.use(cors({
    origin: ['http://localhost:8100', 'http://localhost:4200', 'http://localhost:5000'],
    methods: "GET, PUT"
}));
app.use(express.json());

let taskRepo;
let taskChannel;
let instanceQ;

/**
 * PERSIST DATA TO CASSANDRA UPON AMQP MESSAGES
 */
amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }
        var exchange = 'topic_logs';

        channel.assertExchange(exchange, 'topic', {
            durable: false
        });

        channel.assertQueue('', {
            exclusive: true
        }, function(error2, q) {
            if (error2) {
                throw error2;
            }
            console.log(' [*] Waiting for logs. To exit press CTRL+C');
            const args = ["#", "topic.*", "*.critical"];
            args.forEach(function(key) {
                channel.bindQueue(q.queue, exchange, key);
            });

            channel.consume(q.queue, function(msg) {
                console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());
                client.execute('SELECT * FROM activity;').then(res => {
                    console.log(res.rows)
                })
            }, {
                noAck: true
            });
        });
    });
});

server.listen(port, () => {
    console.log('now listening on port ' + port)
})
