#!/usr/bin/env node
import express from 'express';
import http from 'http';
import minimist from 'minimist';
import "reflect-metadata";
import neo4j from 'neo4j-driver';
import cors from 'cors';
import jwt from "jsonwebtoken";
import * as utils from "./utils";
import * as readCypher from './infrastructure.reads';
import * as writeCypher from './infrastructure.writes';
import * as amqpClient from './amqp';
import {Token} from "./models";

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


app.get('/organizations', utils.emitToActivityService('T'), async (req, res) => {
    readCypher.getOrganizations().then(result => {
        if (result == undefined) {
            res.status(404).send("Resource not found");
        } else {
            res.send(result)
        }
    })
})

app.get('/organizations/:organizationId/projects', utils.emitToActivityService('T'), async (req, res) => {
    readCypher.getProjectsForOrganization(req).then(result => {
        if (result == undefined) {
            res.status(404).send("Resource not found");
        } else {
            res.send(result)
        }
    })

})

app.get('/organizations/:organizationId/projects/:projectId', utils.emitToActivityService('T'), async (req, res) => {
    readCypher.getProjectFromOrganization(req).then(result => {
        if (result == undefined) {
            res.status(404).send("Resource not found");
        } else {
            res.send(result)
        }
    })
})

app.get('/organizations/:organizationId/projects/:projectId/tasks', utils.emitToActivityService('T'), async (req, res) => {
    readCypher.getTasksForProject(req).then(result => {
        if (result == undefined) {
            res.status(404).send("Resource not found");
        } else {
            res.send(result)
        }
    })
})

app.get('/organizations/:organizationId/projects/:projectId/tasksWithUserdata', async (req, res) => {
    readCypher.getTasksForProjectWithUserData(req).then(result => {
        if (result == undefined) {
            res.status(404).send("Resource not found");
        } else {
            let ids: string[] = utils.traverseProjectForAllTaskCreatedBy(result);
            grpcClient.addUserDataToTaskListForProject(
                {
                    userList: ids
                }, (grpcError, grpcResult) => {
                    if (!grpcError) {
                        let joinedResult = utils.joinUserDetailsAndTasks(grpcResult.users, result);
                        res.send(joinedResult.children);
                    } else {
                        res.send(result.children);
                    }
                })
        }
    })


})


app.put('/organizations/:organizationId/projects/:projectId/tasks/:taskId/markTaskAsDone', utils.emitToActivityService('T'), async (req, res) => {
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

app.put('/organizations/:organizationId/projects/:projectId/tasks/:taskId/markTaskAsUnDone', utils.emitToActivityService('T'), async (req, res) => {
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

app.post('/organizations/:organizationId/projects', utils.emitToActivityService('T'), async (req, res) => {
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
    }).then((result: any) => {
        session.close();
        let dto = result.records[0]._fields[0];
        dto.children = null;
        res.send(dto);
    })
})

app.post('/organizations', utils.emitToActivityService('T'), async (req, res) => {
    let session = driver.session();
    session.run('' +
        'CREATE p=(o:Organization {name: $name}) ' +
        'WITH COLLECT(p) AS ps ' +
        'CALL apoc.convert.toTree(ps) YIELD value ' +
        'RETURN value;', {
        name: req.body.name
    }).then((result: any) => {
        session.close();
        res.send(result.records[0]);
    })
})

app.post('/organizations/createAndJoin', utils.emitToActivityService('T'), async (req, res) => {
    let session = driver.session();
    session.run('' +
        'CREATE (o:Organization {name: $name}) RETURN o;', {
        name: req.body.name
    }).then((result: any) => {
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
                        }).then(result => {
                            res.send('Error adding user to organization; No organization added')
                        })
                    }
                })
        } catch (e) {
            //ROLLBACK
            console.error(e)
            let session = driver.session();
            session.run('' +
                'MATCH (o:Organization) WHERE ID(o)=$organizationId\n' +
                'DETACH DELETE (o);', {
                organizationId: result.records[0]._fields[0].identity.low
            }).then(result => {
                res.send('Error adding user to organization; No organization added')
            })
        }

        res.send(result.records[0]._fields)
    })
})

app.post('/organizations/:organizationId/projects/:projectId/tasks', utils.emitToActivityService('T'), async (req, res) => {
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
        .then((result: any) => {
            session.close();
            let dto = result.records[0]._fields[0];
            dto.children = null;
            res.send(dto);
        })
})

app.post('/organizations/:organizationId/projects/:projectId/tasks/:taskId/subtask', utils.emitToActivityService('T'), async (req, res) => {
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
    }).then((result: any) => {
        session.close();
        let dto = result.records[0]._fields[0];
        dto.children = null;
        res.send(dto);
    })
})

app.delete('/organizations/:organizationId/projects/:projectId/tasks/:taskId/subtask', utils.emitToActivityService('T'), async (req, res) => {
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

app.delete('/organizations/:organizationId/projects/:projectId/tasks/:taskId', utils.emitToActivityService('T'), async (req, res) => {
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

