#!/usr/bin/env node
import express from 'express';
import http from 'http';
import minimist from 'minimist';
import "reflect-metadata";
import amqp, {Channel} from 'amqplib/callback_api';
import neo4j from 'neo4j-driver';
import cors from 'cors';
import jwt from "jsonwebtoken";
import {Task} from './models';

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

app.use(cors({
    origin: ['http://localhost:8100', 'http://localhost:4200', 'http://localhost:5000'],
    methods: "GET, PUT"
}));
app.use(express.json());

let taskRepo;
let taskChannel: Channel;
let instanceQ;

amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel: Channel) {
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

        });
        taskChannel = channel;
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
app.get('/organizations', emitToActivityService('T'), async(req, res, next) => {
    let session = driver.session();
    session.run('' +
        'MATCH collect=(o:Organization)\n' +
        'WITH COLLECT(collect) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value;')
        .then((result: any) => {
            res.send(result.records)
        })
})

app.get('/organizations/:organizationId/projects', emitToActivityService('T'), async(req, res) => {
    let session = driver.session();
    session.run('' +
        'MATCH (o:Organization) WHERE ID(o)=$organizationId\n' +
        'WITH o as organization\n' +
        'MATCH collect=(organization)-[:CHILDREN]->(p:Project)\n' +
        'WITH COLLECT(collect) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value', {
        organizationId: Number(req.params.organizationId),
    }).then((result:any) => {
        session.close();
        res.send(result.records[0]._fields[0].children);
    })
})

app.get('/organizations/:organizationId/projects/:projectId', emitToActivityService('T'), async(req, res) => {
    let session = driver.session();
    session.run('' +
        'MATCH (o:Organization) WHERE ID(o)=$organizationId\n' +
        'WITH o as organization\n' +
        'MATCH collect=(p:Project)<-[:CHILDREN]-(organization) WHERE ID(p)=$projectId\n' +
        'WITH COLLECT(collect) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value;', {
        organizationId: Number(req.params.organizationId),
        projectId: Number(req.params.projectId),
    }).then((result:any) => {
        session.close();
        let dto = result.records[0]._fields[0];
        dto.children = null;
        res.send(dto);
    })
})

app.get('/organizations/:organizationId/projects/:projectId/tasks', emitToActivityService('T'), async (req, res) => {
    let session = driver.session();
    session.run('' +
        'MATCH (o:Organization) WHERE ID(o)=$organizationId\n' +
        'WITH o as organization\n' +
        'MATCH (p:Project)<-[:CHILDREN]-(organization) WHERE ID(p)=$projectId\n' +
        'WITH p as projects\n' +
        'MATCH collect=(projects)-[:CHILDREN*]->(t:Task)\n' +
        'WITH COLLECT(collect) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value;', {
        organizationId: Number(req.params.organizationId),
        projectId: Number(req.params.projectId)
    }).then( (result: any) => {
        session.close();
        res.send(result.records[0]._fields[0].children)
    } )
})

app.get('/organizations/:organizationId/projects/:projectId/tasksWithUserdata', async (req, res) => {
    let session = driver.session();
    session.run('' +
        'MATCH (o:Organization) WHERE ID(o)=$organizationId\n' +
        'WITH o as organization\n' +
        'MATCH (p:Project)<-[:CHILDREN]-(organization) WHERE ID(p)=$projectId\n' +
        'WITH p as projects\n' +
        'MATCH collect=(projects)-[:CHILDREN*]->(t:Task)\n' +
        'WITH COLLECT(collect) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value;', {
        organizationId: Number(req.params.organizationId),
        projectId: Number(req.params.projectId)
    }).then( (result: any) => {
        let tasks: Task[] = result.records[0]._fields[0].children;
        let ids = [];
        tasks.forEach(t => {
            ids.push(t.createdBy);
        })
        console.log(ids);
        session.close();

             grpcClient.addUserDataToTaskListForProject(
                {
                    userList: ids
                }, (grpcError, grpcResult) => {
                    console.log("Returned")
                    console.log(grpcResult)
                    if (!grpcError) {
                        console.log(grpcResult)

                    } else {
                        //ROLLBACK
                    }
                })

            res.send(tasks) //Should not be reached if


    } )
})

app.put('/organizations/:organizationId/projects/:projectId/tasks/:taskId/markTaskAsDone', emitToActivityService('T'), async (req, res) => {
    let session = driver.session();
    session.run('' +
        'MATCH (o:Organization) WHERE ID(o)=$organizationId \n' +
        'WITH o as organization \n' +
        'MATCH (organization)-[:CHILDREN]->(p:Project) WHERE ID(p)=$projectId \n' +
        'WITH p as project \n' +
        'MATCH (project)-[:CHILDREN*]->(t:Task) WHERE ID(t)=$taskId \n' +
        'WITH t as task \n' +
        'SET task.done = true \n' +
        'RETURN task;', {
        organizationId: Number(req.params.organizationId),
        projectId: Number(req.params.projectId),
        taskId: Number(req.params.taskId)
    }).then(result => {
            session.close();
            res.send(true);
    })
})

app.put('/organizations/:organizationId/projects/:projectId/tasks/:taskId/markTaskAsUnDone', emitToActivityService('T'), async (req, res) => {
    let session = driver.session();
    session.run('' +
        'MATCH (o:Organization) WHERE ID(o)=$organizationId\n' +
        'WITH o as organization\n' +
        'MATCH (organization)-[:CHILDREN]->(p:Project) WHERE ID(p)=$projectId\n' +
        'WITH p as project\n' +
        'MATCH (project)-[:CHILDREN*]->(t:Task) WHERE ID(t)=$taskId\n' +
        'with t as task\n' +
        'SET task.done = false\n' +
        'RETURN task;', {
        organizationId: Number(req.params.organizationId),
        projectId: Number(req.params.projectId),
        taskId: Number(req.params.taskId)
    }).then(result => {
        session.close();
        res.send(true);
    })
})

app.post('/organizations/:organizationId/projects', emitToActivityService('T'), async(req, res) => {
    let session = driver.session();
    session.run('' +
        'MATCH (o: Organization) WHERE ID(o)=$organizationId\n' +
        'WITH o as organization\n' +
        'CREATE p=(project:Project {name: $name, description: $description, createdAt: datetime()})<-[:CHILDREN]-(organization)\n' +
        'WITH COLLECT(p) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value;', {
        organizationId: Number(req.params.organizationId),
        name: req.body.name,
        description: req.body.description
    }).then((result:any) => {
        session.close();
        let dto = result.records[0]._fields[0];
        dto.children = null;
        res.send(dto);
    })
})

app.post('/organizations', emitToActivityService('T'), async(req, res) => {
    let session = driver.session();
    session.run('' +
        'CREATE p=(o:Organization {name: $name}) ' +
        'WITH COLLECT(p) AS ps ' +
        'CALL apoc.convert.toTree(ps) YIELD value ' +
        'RETURN value;',{
        name: req.body.name
        }).then( (result: any) => {
            session.close();
            res.send(result.records[0]);
    })
})

app.post('/organizations/createAndJoin', emitToActivityService('T'), async(req, res) => {
    let session = driver.session();
    session.run('' +
        'CREATE (o:Organization {name: $name}) RETURN o;', {
        name: req.body.name
    }).then((result:any) => {
        session.close();
        try {
            grpcClient.joinOrganizationUponCreation(
                {
                    userId: req.body.userId,
                    organizationId: result.records[0]._fields[0].identity.low
                }, (grpcError, grpcResult) => {
                    if (!grpcError) {
                        console.log('Successfully updated org ID for user')
                    } else {
                        //ROLLBACK
                        console.error(grpcError)
                        let session = driver.session();
                        session.run('' +
                            'MATCH (o:Organization) WHERE ID(o)=$organizationId\n' +
                            'DETACH DELETE (o);', {
                            organizationId: result.records[0]._fields[0].identity.low
                        }).then( result => {
                            res.send('Error adding user to organization; No organization added')
                        })
                    }
                })
        } catch(e) {
            //ROLLBACK
            console.error(e)
            let session = driver.session();
            session.run('' +
                'MATCH (o:Organization) WHERE ID(o)=$organizationId\n' +
                'DETACH DELETE (o);', {
                organizationId: result.records[0]._fields[0].identity.low
            }).then( result => {
                res.send('Error adding user to organization; No organization added')
            })
        }

        res.send(result.records[0]._fields)
    })
})

app.post('/organizations/:organizationId/projects/:projectId/tasks', emitToActivityService('T'), async (req, res) => {
    let session = driver.session();
    const decoded = jwt.verify(req.body.token || req.query.token || req.headers["x-access-token"], argv['secret']) as Token;
    session.run('' +
        'MATCH (o:Organization) WHERE ID(o)=$organizationId \n' +
        'WITH o as organization \n' +
        'MATCH (organization)-[:CHILDREN]->(p:Project) WHERE ID(p)=$projectId \n' +
        'WITH p as project \n' +
        'CREATE collect=(t:Task {' +
        'name: $name, ' +
        'description: $description, ' +
        'createdAt: datetime(), ' +
        'createdBy: $createdBy ' +
        '})<-[:CHILDREN]-(project) ' +
        'WITH COLLECT(collect) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value;',
        {
            organizationId: Number(req.params.organizationId),
            projectId: Number(req.params.projectId),
            name: req.body.name,
            description: req.body.description,
            createdBy: decoded.user_id
        })
        .then((result: any)  => {
            session.close();
            let dto = result.records[0]._fields[0];
            dto.children = null;
            res.send(dto);
        })
})

app.post('/organizations/:organizationId/projects/:projectId/tasks/:taskId/subtask', emitToActivityService('T'), async (req, res) => {
    let session = driver.session();
    const decoded = jwt.verify(req.body.token || req.query.token || req.headers["x-access-token"], argv['secret']) as Token;
    session.run('' +
        'MATCH (o:Organization) WHERE ID(o)=$organizationId \n' +
        'WITH o as organization \n' +
        'MATCH (organization)-[:CHILDREN]->(p:Project) WHERE ID(p)=$projectId \n' +
        'WITH p as project \n' +
        'MATCH (project)-[:CHILDREN*]->(t:Task) WHERE ID(t)=$taskId\n' +
        'WITH t as task\n' +
        'CREATE collect=(t:Task {' +
        'name: $name, ' +
        'description: $description, ' +
        'createdAt: datetime(), ' +
        'createdBy: $createdBy ' +
        '})<-[:CHILDREN]-(task)\n' +
        'WITH COLLECT(collect) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value;', {
        organizationId: Number(req.params.organizationId),
        projectId: Number(req.params.projectId),
        taskId: Number(req.params.taskId),
        name: req.body.name,
        description: req.body.description,
        createdBy: decoded.user_id
    }).then((result: any)  => {
        session.close();
        let dto = result.records[0]._fields[0];
        dto.children = null;
        res.send(dto);
    })
})

app.delete('/organizations/:organizationId/projects/:projectId/tasks/:taskId/subtask', emitToActivityService('T'), async(req, res) => {
    let session = driver.session();
    session.run('' +
        'MATCH (o:Organization) WHERE ID(o)=$organizationId\n' +
        'WITH o as organization \n' +
        'MATCH (organization)-[:CHILDREN]->(p:Project) WHERE ID(p)=$projectId\n' +
        'WITH p as project \n' +
        'MATCH (project)-[:CHILDREN]->(t:Task) WHERE ID(t)=$taskId\n' +
        'WITH t as task\n' +
        'MATCH (task)-[:CHILDREN*]->(n)\n' +
        'DETACH DELETE n;', {
        organizationId: Number(req.params.organizationId),
        projectId: Number(req.params.projectId),
        taskId: Number(req.params.taskId),
    }).then(result => {
        session.close();
        res.send(true);
    })
})

app.delete('/organizations/:organizationId/projects/:projectId/tasks/:taskId', emitToActivityService('T'), async(req, res) => {
    let session = driver.session();
    session.run('' +
        'MATCH (o:Organization) WHERE ID(o)=$organizationId\n' +
        'WITH o as organization \n' +
        'MATCH (organization)-[:CHILDREN]->(p:Project) WHERE ID(p)=$projectId\n' +
        'WITH p as project \n' +
        'MATCH (project)-[:CHILDREN]->(t:Task) WHERE ID(t)=$taskId\n' +
        'WITH t as task\n' +
        'MATCH (task)-[:CHILDREN*]->(n)\n' +
        'DETACH DELETE n, task;', {
        organizationId: Number(req.params.organizationId),
        projectId: Number(req.params.projectId),
        taskId: Number(req.params.taskId),
    }).then(result => {
        session.close();
        res.send(true);
    })
})

server.listen(port, () => {
    console.log('now listening on port ' + port)
})

function emitToActivityService(...message) {

    return (req, res, next) => {
        const token =
            req.body.token || req.query.token || req.headers["x-access-token"];
        const readable = jwt.verify(token, argv['secret']) as Token;
        let dto = {
            userid: readable.user_id,
            organizationid: readable.organization,
            //eventtime: new Date(),
            actiontype: req.method,
            bodyitems: req.body,
            endpoint: req.route.path,
            service: 'task'
        };
        taskChannel.publish('topic_logs', 'topic.critical', Buffer.from(JSON.stringify(dto)));
        return next();
    }
}

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