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
/*
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
 */

/**
 * @RETURNS GETS ALL PROJECTS BELONGING TO AN ORGANIZATION
 */
app.get('organization/:organizationId/projects', async(req, res) => {
    let session = driver.session();
    session.run('' +
        'MATCH p=(o:Organization)-[:CHILDREN]->(n) WHERE ID(o)=$organizationId\n' +
        'WITH COLLECT(p) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value;', {
        organizationId: Number(req.params.organizationId),
    }).then((result:any) => {
        session.close();
        res.send(result.records[0]._fields[0].children);
    })
})

app.get('project/:projectId/tasks', async (req, res) => {
    let session = driver.session();
    session.run('' +
        'MATCH (o:Organization)-[:CHILDREN]->(project:Project)\n' +
        'WHERE ID(o)=14 AND ID(project)=$projectId\n' +
        'MATCH p=(project)-[:CHILDREN*]->(t:Task)\n' +
        'WITH COLLECT(p) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value;', {
        projectId: Number(req.params.projectId)
    }).then( (result: any) => {
        session.close();
        res.send(result.records[0]._fields[0].children)
    } )
})

app.patch('task/markTaskAsDone/:id', async (req, res) => {
    let session = driver.session();
    session.run('' +
        'MATCH (t:Task) WHERE ID(t)=$taskId\n' +
        'SET t.done = true\n' +
        'RETURN t', {
        taskId: req.params.id
    }).then(result => {
            session.close();
            res.send(true);
    })
})

app.patch('/markTaskAsUnDone/:id', async (req, res) => {
    let session = driver.session();
    session.run('' +
        'MATCH (t:Task) WHERE ID(t)=$taskId\n' +
        'SET t.done = false\n' +
        'RETURN t', {
        taskId: req.params.id
    }).then(result => {
        session.close();
        res.send(true);
    })
})


/**
 * CREATES NEW PROJECT FOR ORGANIZATION
 */
app.post('/projects', async(req, res) => {
    let session = driver.session();
    session.run('' +
        'MATCH (o: Organization) WHERE ID(o)=$organizationId\n' +
        'CREATE p=(project:Project {name: $name})<-[:CHILDREN]-(o)\n' +
        'WITH COLLECT(p) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value;', {
        organizationId: Number(req.body.organizationId),
        name: req.body.name
    }).then((result:any) => {
        session.close();
        let dto = result.records[0]._fields[0];
        dto.children = null;
        res.send(dto);
    })
})


/**
 * CREATES AND JOINS(THROUGH GRPC) NEW ORGANIZATION
 */
app.post('/organization', async(req, res) => {
    let session = driver.session();
    session.run('' +
        'CREATE (o:Organization {name: $name}) RETURN o;', {
        name: req.body.name
    }).then((result:any) => {
        session.close();
        console.log(result.records[0]._fields[0].identity.low);
        grpcClient.joinOrganizationUponCreation({userId: req.body.userId, organizationId: result.records[0]._fields[0].identity.low}, (error, result) => {
            if (!error) {
                console.log('Successfully updated org ID for user')
            } else {
                console.error(error)
            }
        })
        res.send(result.records)
    })
})


/**
 * CREATES NEW TASK FOR PROJECT (ROOT TASK)
 */
app.post('/projects/:project/roottask', async (req, res) => {
    let session = driver.session();
    session.run('' +
        'MATCH (project:Project) WHERE ID(project)=$project ' +
        'CREATE p=(t:Task {name: $name })<-[:CHILDREN]-(project) ' +
        'WITH COLLECT(p) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value;',
        {
            project: Number(req.params.project),
            name: req.body.name
        })
        .then((result: any)  => {
            session.close();
            let dto = result.records[0]._fields[0];
            dto.children = null;
            res.send(dto);
        })
})

/**
 * CREATES A SUBTASK TO A TASK
 */
app.post('/supertask/:task/subtask', async (req, res) => {
    let session = driver.session();
    session.run('' +
        'MATCH (t:Task) WHERE ID(t)=$supertaskId\n' +
        'CREATE p=(s:Task {name: $name })<-[:CHILDREN]-(t)\n' +
        'WITH COLLECT(p) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value;', {
        supertaskId: Number(req.params.task),
        name: req.body.name
    }).then((result: any)  => {
        session.close();
        let dto = result.records[0]._fields[0];
        dto.children = null;
        res.send(dto);
    })
})

/**
 * DELETES A TASK AND ALL ITS CHILDREN (SUBTASKS)
 */
app.delete('/task/:task', async(req, res) => {
    let session = driver.session();
    session.run('' +
        'MATCH (t:Task)-[:CHILDREN]->(n)\n' +
        'WHERE ID(t)=$taskId WITH n\n' +
        'MATCH childPath=(n)-[:CHILDREN*0..]->(e)\n' +
        'WITH childPath, e\n' +
        'DETACH DELETE e;\n' +
        'MATCH (a:Task) WHERE ID(a)=$taskId DETACH DELETE (a);', {
        taskId: Number(req.params.task)
    }).then(result => {
        session.close();
        res.send(true);
    })
})

/**
 * DELETES ALL CHILDREN (SUBTASKS) BUT NOT THE TASK ITSELF
 */
app.delete('/task/:task/subtasks', async(req, res) => {
    let session = driver.session();
    session.run('' +
        'MATCH (t:Task)-[:CHILDREN]->(n) ' +
        'WHERE ID(t)=$taskId WITH n\n' +
        'MATCH childPath=(n)-[:CHILDREN*0..]->(e)\n' +
        'WITH childPath, e\n' +
        'DETACH DELETE e;\n', {
        taskId: Number(req.params.task)
    }).then(result => {
        session.close();
        res.send(true);
    })
})

server.listen(port, () => {
    console.log('now listening on port ' + port)
})


