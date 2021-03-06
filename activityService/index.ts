#!/usr/bin/env node
import express from 'express';
import http from 'http';
import minimist from 'minimist';
import "reflect-metadata";
import cors from 'cors';
import * as utils from './utils/utils';
import * as cqlReader from './infrastructure/infrastructure.reads';
import * as grpcServer from './inter-service/grpc.server';
import * as amqpClient from './inter-service/amqp';

const app = express();
const server = http.createServer(app)
const argv = minimist(process.argv.slice(1));
const port = argv['port'] || 3003;

if (argv['secret'] == undefined) {
    argv['secret']='secret';
    console.log('No secret defined. Program will use default development secret for demo database')
}

app.use(cors());
app.use(express.json());

amqpClient.init();

app.get('/recentActivity/:numberOfRecords/forUser/:forUser/:entityId', utils.authorize('Member'), async (req, res) => {
    let query;
    let entityId;
    const token = utils.getToken(req);
    if(req.params.forUser=='true') {
        entityId = token.user_id
        query = 'SELECT * FROM actions WHERE userid = ? LIMIT ?;';
    } else {
        entityId = Number(req.params.entityId);
        query = 'SELECT * FROM actions WHERE organizationid = ? LIMIT ?;';
    }
    let limit = Number(req.params.numberOfRecords);

    cqlReader.getRecords(query, entityId, limit).then(result => {
        res.send(result.rows);
    })
})

server.listen(port, () => {
    grpcServer.initGrpcServer();
    console.log('now listening on port ' + port)
})
