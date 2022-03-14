#!/usr/bin/env node
import express from 'express';
import http from 'http';
import minimist from 'minimist';
import "reflect-metadata";
import amqp, {Channel} from 'amqplib/callback_api';
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
    contactPoints: ['localhost:9042'],
    localDataCenter: 'datacenter1',
    keyspace: 'mykeyspace'
});


app.use(cors({
    origin: ['http://localhost:8100', 'http://localhost:4200', 'http://localhost:5000'],
    methods: "GET, PUT"
}));
app.use(express.json());

let taskRepo;
let taskChannel: Channel;
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
        var exchange = 'topic_logs'; //Exhanges route messages to queues using routing keys (binding = link between queue and exchange)
        //channels are used for publishing or consuming messages from a queue
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
                console.log(" [x] %s:'%s'", msg.fields.routingKey);
                let dto = JSON.stringify(msg.content);
                console.log(dto.toString());

                client.execute('SELECT * FROM actions;').then(res => {

                })
            }, {
                noAck: true
            });
        });
        taskChannel = channel;
    });
});

app.get('/users/:userId/recentActivity/:limit', async (req, res) => {
    client.execute('SELECT * FROM actions;').then(result => {
        res.send(result.rows);
    })
})

server.listen(port, () => {
    console.log('now listening on port ' + port)
})



function verifyToken(...role) {
    return (req, res, next) => {
        console.log(role)
        const token =
            req.body.token || req.query.token || req.headers["x-access-token"];

        if (!token) {
            return res.status(403).send("A token is required for authentication");
        }
        try {
            const decoded = jwt.verify(token, argv['secret']);
            const readable = decoded as Token;
            if (readable.roles.includes(role[0])) {
                req.user = decoded;
                return next();
            } else {
                return res.status(401).send('Only '+role+' allowed')
            }
        } catch (err) {
            return res.status(401).send("Try again");
        }
        return next();
    }

}
type Token = {
    user_id: string
    email: string
    roles: [string],
    organization: string
    iat: number,
    exp: number
}