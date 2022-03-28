import minimist from 'minimist';
import http from "http";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from 'cors';
import express from "express";
import * as grpcServer from './inter-service/grpc.server';
import * as grpcClient from './inter-service/grpc.client';
import {authorize} from "./utils/utils";
import * as mongooseRead from './infrastructure/infrastructure.reads';
import * as mongooseWrite from './infrastructure/infrastructure.writes';
import * as mongo from './infrastructure/infrastructure.shared';
import * as seeder from './utils/seeder';

const argv = minimist(process.argv.slice(1));
const port = argv['port'] || 3002;
const app = express();
const httpServer = http.createServer(app);

if (argv['secret'] == undefined) {
    argv['secret']='secret';
    console.log('No secret defined. Program will use default development secret for demo database')
}

app.use(express.json({limit: "50mb"}));
app.use(cors(/*{
    origin: ['http://localhost:8100', 'http://localhost:4200', 'http://localhost:5000'],
    methods: "GET, PUT, POST, DELETE"
}*/))
mongo.init();

app.post("/register", async (req, res) => {
    try {
        const {first_name, last_name, email, password} = req.body;

        if (!(email && password && first_name && last_name)) {
            res.status(400).send("Invalid request");
        }
        if (await mongooseRead.findUser(email)!=undefined) {
            return res.status(409).send("User Already Exist. Please Login");
        }
        const encryptedPassword = await bcrypt.hash(password, 10);
        const roles = ["Member"];
        const organization = undefined;
        const user = await mongooseWrite.registerUser(
            first_name,
            last_name,
            email.toLowerCase(),
            encryptedPassword,
            roles,
            organization);

        user.token = jwt.sign(
            {user_id: user._id, email, roles, organization},
            argv['secret'],
            {
                expiresIn: "10h",
            }
        );
        user.hash = '';
        return res.status(201).json(user);
    } catch (err) {
        console.log(err);
    }
});

app.put('/joinOrganization', async (req, res) => {
    let result = await mongooseWrite.joinOrganization(req, res);
    res.send(result);
})

app.post("/login", async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!(email && password)) {
            res.status(400).send("All input is required");
        }
        let roles = null;
        let organization = null;
        let user = null;

        try {
            user = await mongooseRead.findUser(email)
            roles = user.roles || null;
            organization = user.organizationId;
        } catch (e) {
            console.log(e)
        }
        if (user && (await bcrypt.compare(password, user.hash))) {
            user.token = jwt.sign(
                {user_id: user._id, email, roles, organization},
                argv['secret'],
                {
                    expiresIn: "10h",
                }
            );
            user.hash = '';
            return res.status(200).json(user);
        }

        res.status(400).send("Invalid Credentials");
    } catch (err) {
        console.log(err);
    }
});

app.delete('/delete', async (req, res) => {
    let user = await mongooseRead.findUser(req.body.email);
    if (!user) {
        return res.status(409).send("User doesn't exist");
    }
    let returnValue;
    let rollbackValue: any = await mongooseWrite.deleteUser(req.body.email);
    if (!rollbackValue) {
        returnValue = 'No deletion performed, could not find user';
    }
        await grpcClient.deleteSaga(rollbackValue._id.toString()).then( async result => {
            if (result.isDeleted == false) {
                await mongooseWrite.registerUser(
                    rollbackValue.first_name, rollbackValue.last_name, rollbackValue.email, rollbackValue.hash, rollbackValue.roles, rollbackValue.organization, rollbackValue._id)
                    .then(result => {
                        returnValue = 'User has not been deleted due to transaction problems. ' +
                            'A rollback has occured.';
                    })
            } else {
                returnValue = 'User with data has been safely deleted';
            }
        })
    res.send(returnValue);
})

app.get("/test", authorize("Member"), (req, res) => {
    return res.status(200).send("Welcome. Token accepted");
});

app.get('/openEndpoint', (req, res) => {
    return res.send('Connected');
})

app.use("*", (req, res) => {
    return res.status(404).json({
        success: "false",
        message: "Page not found",
        error: {
            statusCode: 404,
            message: "Route not found",
        },
    });
});

httpServer.listen(port, () => {
    grpcServer.initGrpcServer();
    seeder.writeUser();
    console.log('now listening on port ' + port)
})

