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
//import * as grpcServer from './inter-service/grpc.server';

const app = express();
const server = http.createServer(app)
const argv = minimist(process.argv.slice(1));
const port = argv['port'] || 3001;

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:8100', 'http://localhost:4200', 'http://localhost:5000'],
    methods: "GET, PUT"
}));

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
    readCypher.getTasksForProjectWithUserData(req).then(async result => {
        if (result == undefined) {
            res.status(404).send("Resource not found");
        } else {
            grpcClient.addUserDataToTaskListForProject(result, res);
        }
    })
})

app.put('/organizations/:organizationId/projects/:projectId/tasks/:taskId/markTaskAsDone', utils.emitToActivityService('T'), async (req, res) => {
    writeCypher.markTaskAsDone(req).then(result => {
        if (result == undefined) {
            res.status(418).send("Update not possible");
        } else {
            res.send(result)
        }
    })
})


app.put('/organizations/:organizationId/projects/:projectId/tasks/:taskId/markTaskAsUnDone', utils.emitToActivityService('T'), async (req, res) => {
    writeCypher.markTaskAsUndone(req).then(result => {
        if (result == undefined) {
            res.status(418).send("Update not possible");
        } else {
            res.send(result)
        }
    })
})

app.post('/organizations/:organizationId/projects', utils.emitToActivityService('T'), async (req, res) => {
    writeCypher.createProjectForOrganization(req).then(result => {
        if (result == undefined) {
            res.status(418).send("Project creation not possible");
        } else {
            res.send(result)
        }
    })
})

app.post('/organizations', utils.emitToActivityService('T'), async (req, res) => {
    writeCypher.createOrganization(req).then(result => {
        if (result == undefined) {
            res.status(418).send("Organization creation not possible");
        } else {
            res.send(result)
        }
    })
})

app.post('/organizations/:organizationId/projects/:projectId/tasks', utils.emitToActivityService('T'), async (req, res) => {
    writeCypher.createTaskForProject(req).then(result => {
        if (result == undefined) {
            res.status(418).send("Task creation not possible");
        } else {
            res.send(result)
        }
    })
})

app.post('/organizations/:organizationId/projects/:projectId/tasks/:taskId/subtask', utils.emitToActivityService('T'), async (req, res) => {
    writeCypher.createSubtask(req).then(result => {
        if (result == undefined) {
            res.status(418).send("Subtask creation not possible");
        } else {
            res.send(result)
        }
    })
})

app.delete('/organizations/:organizationId/projects/:projectId/tasks/:taskId/subtasks', utils.emitToActivityService('T'), async (req, res) => {
    writeCypher.deleteSubtasks(req).then(result => {
        if (result == undefined) {
            res.status(418).send("Task deletion not possible");
        } else {
            res.send(result)
        }
    })
})

app.delete('/organizations/:organizationId/projects/:projectId/tasks/:taskId', utils.emitToActivityService('T'), async (req, res) => {
    writeCypher.deleteTask(req).then(result => {
        if (result == undefined) {
            res.status(418).send("Task deletion not possible");
        } else {
            res.send(result)
        }
    })
})

server.listen(port, () => {
    console.log('now listening on port ' + port)
})

