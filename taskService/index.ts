#!/usr/bin/env node
import "reflect-metadata";
import express from 'express';
import http from 'http';
import minimist from 'minimist';
import cors from 'cors';
import * as utils from "./utils/utils";
import * as readCypher from './infrastructure/infrastructure.reads';
import * as writeCypher from './infrastructure/infrastructure.writes';
import * as grpcClient from './inter-service/grpc.client';
import * as grpcServer from './inter-service/grpc.server';
import {getToken} from "./utils/utils";
import * as seeder from './utils/seeder';

const app = express();
const server = http.createServer(app)
const argv = minimist(process.argv.slice(1));
const port = argv['port'] || 3001;

if (argv['secret'] == undefined) {
    argv['secret']='secret';
    console.log('No secret defined. Program will use default development secret for demo database')
}

app.use(express.json());
app.use(cors(
    {origin: ['http://localhost:8100', 'http://localhost:4200', 'http://localhost:5000'],
    methods: "GET, PUT, POST, DELETE"}
));

app.get('/organizations', utils.emitToActivityService(), async (req, res) => {
    readCypher.getOrganizations().then(result => {
        if (result == undefined) {
            res.status(404).send("Resource not found");
        } else {
            res.send(result)
        }
    })
})

app.get('/organizations/:organizationId/projects', utils.emitToActivityService(), async (req, res) => {
    readCypher.getProjectsForOrganization(Number(req.params.organizationId)).then(result => {
        if (result == undefined) {
            res.status(404).send("Resource not found");
        } else {
            res.send(result)
        }
    })

})

app.get('/organizations/:organizationId/projects/:projectId', utils.emitToActivityService(), async (req, res) => {
    readCypher.getProjectFromOrganization(Number(req.params.organizationId), Number(req.params.projectId)).then(result => {
        if (result == undefined) {
            res.status(404).send("Resource not found");
        } else {
            res.send(result)
        }
    })
})

app.get('/organizations/:organizationId/projects/:projectId/tasks', utils.emitToActivityService(), async (req, res) => {
    readCypher.getTasksForProject(Number(req.params.organizationId), Number(req.params.projectId)).then(result => {
        if (result == undefined) {
            res.status(404).send("Resource not found");
        } else {
            res.send(result)
        }
    })
})

app.get('/organizations/:organizationId/projects/:projectId/tasksWithUserdata', async (req, res) => {
    readCypher.getTasksForProjectWithUserData(Number(req.params.organizationId), Number(req.params.projectId)).then(async result => {
        if (result == undefined) {
            res.status(404).send("Resource not found");
        } else {
            grpcClient.addUserDataToTaskListForProject(result, res);
        }
    })
})

app.put('/organizations/:organizationId/projects/:projectId/tasks/:taskId/markTaskAsDone', utils.emitToActivityService(), async (req, res) => {
    writeCypher.markTaskAsDone(Number(req.params.organizationId), Number(req.params.projectId), Number(req.params.taskId)).then(result => {
        if (result == undefined) {
            res.status(418).send("Update not possible");
        } else {
            res.send(result)
        }
    })
})


app.put('/organizations/:organizationId/projects/:projectId/tasks/:taskId/markTaskAsUnDone', utils.emitToActivityService(), async (req, res) => {
    writeCypher.markTaskAsUndone(Number(req.params.organizationId), Number(req.params.projectId), Number(req.params.taskId)).then(result => {
        if (result == undefined) {
            res.status(418).send("Update not possible");
        } else {
            res.send(result)
        }
    })
})

app.post('/organizations/:organizationId/projects', utils.emitToActivityService(), async (req, res) => {
    writeCypher.createProjectForOrganization(Number(req.params.organizationId), req.body.name, req.body.description).then(result => {
        if (result == undefined) {
            res.status(418).send("Project creation not possible");
        } else {
            res.send(result)
        }
    })
})

app.post('/organizations', utils.emitToActivityService(), async (req, res) => {
    writeCypher.createOrganization(req.body.name).then(result => {
        if (result == undefined) {
            res.status(418).send("Organization creation not possible");
        } else {
            res.send(result)
        }
    })
})

app.post('/organizations/:organizationId/projects/:projectId/tasks', utils.emitToActivityService(), async (req, res) => {
    let userId = getToken(req).user_id;
    console.log(userId);

    writeCypher.createTaskForProject(userId, Number(req.params.organizationId), Number(req.params.projectId), req.body.name, req.body.description).then(result => {
        console.log(result);
        if (result == undefined) {
            res.status(418).send("Task creation not possible");
        } else {
            res.send(result)
        }
    })
})

app.post('/organizations/:organizationId/projects/:projectId/tasks/:taskId/subtask', utils.emitToActivityService(), async (req, res) => {
    let userId = getToken(req).user_id;
    writeCypher.createSubtask(userId, Number(req.params.organizationId), Number(req.params.projectId),Number(req.params.taskId), req.body.name, req.body.description).then(result => {
        if (result == undefined) {
            res.status(418).send("Subtask creation not possible");
        } else {
            res.send(result)
        }
    })
})

app.delete('/organizations/:organizationId/projects/:projectId/tasks/:taskId/subtasks', utils.emitToActivityService(), async (req, res) => {
    writeCypher.deleteSubtasks(Number(req.params.organizationId), Number(req.params.projectId), Number(req.params.taskId)).then(result => {
        if (result == undefined) {
            res.status(418).send("Task deletion not possible");
        } else {
            res.send(result)
        }
    })
})

app.delete('/organizations/:organizationId/projects/:projectId/tasks/:taskId', utils.emitToActivityService(), async (req, res) => {
    writeCypher.deleteTask(Number(req.params.organizationId), Number(req.params.projectId), Number(req.params.taskId)).then(result => {
        if (result == undefined) {
            res.status(418).send("Task deletion not possible");
        } else {
            res.send(result)
        }
    })
})

app.delete('/organizations/:organizationId/projects/:projectId', utils.emitToActivityService(), async(req, res) => {
    writeCypher.deleteProject(Number(req.params.organizationId),Number(req.params.projectId)).then(result => {
        if(result==undefined) {
            res.status(418).send('Could not delete project')
        } else {
            res.send(result);
        }
    })
})

app.delete('/organizations/:organizationId', utils.emitToActivityService(), async(req, res) => {
    writeCypher.deleteOrganization(Number(req.params.organizationId)).then(result => {
        if(result==undefined) {
            res.status(418).send('Could not delete organization')
        } else {
            res.send(result);
        }
    })
})

server.listen(port, () => {
    grpcServer.initGrpcServer();
    seeder.seed();
    console.log('now listening on port ' + port)
})

