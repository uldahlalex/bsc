#!/usr/bin/env node

import express from 'express';
import http from 'http';
import minimist from 'minimist';
import "reflect-metadata";
import * as amqp from 'amqplib/callback_api';
import neo4j from 'neo4j-driver';
import cors from 'cors';

const app = express();
const server = http.createServer(app)
const argv = minimist(process.argv.slice(1));
const port = argv['port'] || 3001;
const grpc = require('grpc')
const PROTO_PATH = './protos/task.proto'
const TaskService = grpc.load(PROTO_PATH).TaskService
const grpcClient = new TaskService('localhost:50051', grpc.credentials.createInsecure());

const driver = neo4j.driver('bolt://localhost',
    neo4j.auth.basic('neo4j', 'test'));
app.use(cors());
app.use(express.json());

let taskRepo;
let taskChannel;
let instanceQ;

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
            }, {
                noAck: true
            });
        });
    });
});



app.get('/tasks', async (req, res) => {

    let authorId = undefined;
    //taskChannel.publish("topic_logs", "topic.critical", Buffer.from('topic message - very critical'))
    grpcClient.getUserInfoForTasks(authorId, (error, result) => {
        if (!error) {
            console.log('successfully fetch List notes')
            console.log(result)
        } else {
            console.error(error)
        }
    })
    res.send('Fetched')
})

app.get('/tasks/something', async (req, res) => {
    taskChannel.publish("topic_logs", "yada.critical", Buffer.from('not topic message - but very critical'))

})

app.get('/projects/:id', async (req, res) => {
    //taskChannel.publish("topic_logs", "topic.noncritical", Buffer.from('topic message - not very critical'))
        let session = driver.session();
        session.run('' +
            'MATCH p=(o:Project)-[:CHILDREN*]->(n) WHERE ID(o)='+req.params.id+'\n' +
            'WITH COLLECT(p) AS ps\n' +
            'CALL apoc.convert.toTree(ps) YIELD value\n' +
            'RETURN value;').then(
                result => {
                    session.close();
                    res.send(result.records);
                }
        )
})

app.get('/projects', async(req, res) => {
    let session = driver.session();
    session.run('MATCH (p: Project) RETURN (p);').then(result => {
        session.close();
        res.send(result.records);
    })
})

app.post('/markTaskAsDone/:id', async (req, res) => {
    let session = driver.session();
    session.run('MATCH (t:Task) WHERE ID(t)='+req.params.id+'\n' +
        'SET t.done = true\n' +
        'RETURN t').then(result => {
            session.close();
            res.send(true);
    })
})

app.post('/markTaskAsUnDone/:id', async (req, res) => {
    let session = driver.session();
    session.run('MATCH (t:Task) WHERE ID(t)='+req.params.id+'\n' +
        'SET t.done = false\n' +
        'RETURN t').then(result => {
        session.close();
        res.send(true);
    })
})

app.post('/projects/:project/task', async (req, res) => {
    let session = driver.session();
    session.run('' +
        'MATCH (p:Project) WHERE ID(p)=$project ' +
        'CREATE (t:Task {name: $name })<-[:CHILDREN]-(p) ' +
        'RETURN (t);',
        {project: Number(req.params.project), name: req.body.name}).then(result => {
        session.close();
        res.send(result.records);
    })
})

app.post('/project', async(req, res) => {
    let session = driver.session();
    session.run('' +
        'CREATE', {

    }).then(result => {
        session.close();
        res.send()
    })
})

app.post('/organization', async(req, res) => {
    let session = driver.session();
    session.run('' +
        'CREATE (o:Organization {name: $name}) RETURN o;', {
        $name: req.query.name
    }).then(result => {
        session.close();
        res.send()
    })
})

app.post('/projects/:project/:task/subtask', async (req, res) => {
    let session = driver.session();
    session.run('' +
        'MATCH (t:Project) WHERE ID(t)=$supertaskId\n' +
        'CREATE p=(s:Task {name: $name })<-[:CHILDREN]-(t)\n' +
        'WITH COLLECT(p) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value;', {
        supertaskId: Number(req.params.task),
        name: req.body.name
    }).then(result => {
        session.close();
        res.send(result.records);
    })
})

app.delete('/projects/:project/:task', async(req, res) => {
    let session = driver.session();
    session.run('' +
        'MATCH (t:Task)-[:CHILDREN]->(n) WHERE ID(t)=$id\n' +
        'WITH n\n' +
        'MATCH childPath=(n)-[:CHILDREN*0..]->(e)\n' +
        'WITH childPath, e\n' +
        'DETACH DELETE e;\n' +
        'MATCH (a:Task) WHERE ID(a)=$id DETACH DELETE (a);', {
        id: Number(req.params.task)
    }).then(result => {
        session.close();
        res.send(true);
    })
})

app.delete('/projects/:project/:task/subtasks', async(req, res) => {
    let session = driver.session();
    session.run('' +
        'MATCH (t:Task)-[:CHILDREN]->(n) WHERE ID(t)=$id\n' +
        'WITH n\n' +
        'MATCH childPath=(n)-[:CHILDREN*0..]->(e)\n' +
        'WITH childPath, e\n' +
        'DETACH DELETE e;\n', {
        id: Number(req.params.task)
    }).then(result => {
        session.close();
        res.send(true);
    })
})

app.get('/sendToIdentity', async (req, res) => {

})


server.listen(port, () => {
    console.log('now listening on port ' + port)
})


