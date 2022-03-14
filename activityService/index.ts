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

export interface Activity {
    actiontype: string;
    bodyitems: string;
    endpoint: string;
    eventtime: Date;
    organizationid: number;
    service: string;
    userid: string;
}


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
                const activity = JSON.parse((msg.content.toString('utf8'))) as Activity;
                activity.bodyitems = JSON.stringify(activity.bodyitems).toString();
                const query = 'INSERT INTO actions (actiontype, bodyitems, endpoint, eventtime, organizationid, service, userid) VALUES (?, ?, ?, ?, ?, ?, ?);';
                client.execute(query, [
                    activity.actiontype,
                    activity.bodyitems,
                    activity.endpoint,
                    new Date(),
                    activity.organizationid,
                    activity.service,
                    activity.userid
                ]);
            }, {
                noAck: true
            });
        });
        taskChannel = channel;
    });
});
function uint16 (n) {
    return n & 0xFFFF;
}


/**
 * JWT bliver alligevel attached ved alle requests fra front-end, så at injecte userId er måske kontraproduktivt?
 * UID ikke heltal
 */
app.get('/recentActivity/:numberOfRecords/forUser/:forUser/:entityId', verifyToken('Member'), async (req, res) => {
    let query;
    let entityId;
    const decoded = jwt.verify(req.body.token || req.query.token || req.headers["x-access-token"], argv['secret']) as Token;
    if(req.params.forUser=='true') {
        entityId = decoded.user_id
        query = 'SELECT * FROM actions WHERE userid = ? LIMIT ?;';
    } else {
        entityId = Number(req.params.entityId);
        query = 'SELECT * FROM actions WHERE organizationid = ? LIMIT ?;';
    }
    let limit = Number(req.params.numberOfRecords);

    client.execute(query, [
        entityId,
        limit,
    ], {prepare: true}).then(result => {
        res.send(result.rows);
    })
})

server.listen(port, () => {
    console.log('now listening on port ' + port)
})



function verifyToken(...role) {
    return (req, res, next) => {
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