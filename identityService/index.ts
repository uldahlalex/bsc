import minimist from 'minimist';
import http from "http";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from 'cors';
import mongoose from "mongoose";
import express from "express";
import grpc from 'grpc';
import * as grpcServer from './grpc.server';
import {initGrpcServer} from "./grpc.server";

const taskProto = grpc.load('./protos/task.proto')
const argv = minimist(process.argv.slice(1));
const port = argv['port'] || 3002;
const app = express();
const httpServer = http.createServer(app);

type Token = {
    user_id: string
    email: string
    roles: [string],
    organization: string
    iat: number,
    exp: number
}
const User = mongoose.model("user",
    new mongoose.Schema({
    first_name: { type: String, default: null },
    last_name: { type: String, default: null },
    email: { type: String, unique: true },
    hash: {type: String },
    id: {type: mongoose.Schema.Types.ObjectId},
    token: {type: String},
    organizationId: {type: Number },
    roles: [String]
}));

if(argv['secret']==undefined) {
    console.log('No secret defined. Program will close with exit code 1')
    process.exit(1);
}

//mongoose.connect("mongodb://alex:q1w2e3r4@localhost:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false")
mongoose.connect("mongodb://root:example@localhost:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false")
    .then(
    () => {
        console.log('Connected to MongoDB')
        },
    err => {
        console.log(err)
    }
);
app.use(express.json({ limit: "50mb" }));

app.use(cors({
    origin: ['http://localhost:8100', 'http://localhost:4200', 'http://localhost:5000'],
    methods: "GET, PUT, POST, DELETE"
}))


// @ts-ignore
grpcServer.server.addService(taskProto.TaskService.service, {
    addUserDataToTaskListForProject: async (call, callback) => {
        console.log('reached')
        const [records] = await Promise.all([User.find().where('_id').in(call.request.userList).exec()]);
        console.log(records)
        callback(null, records);
}})




app.post("/register", async (req, res) => {
        try {
            const { first_name, last_name, email, password } = req.body;

            if (!(email && password && first_name && last_name)) {
                res.status(400).send("Invalid request");
            }

            if (await User.findOne({ email })) {
                return res.status(409).send("User Already Exist. Please Login");
            }

            const encryptedPassword = await bcrypt.hash(password, 10);
            const roles = ["Member"];
            const organization = undefined;
            const user = await User.create({
                first_name,
                last_name,
                email: email.toLowerCase(),
                hash: encryptedPassword,
                roles : roles,
                organization: organization
            });

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
    const token =
        req.body.token || req.query.token || req.headers["x-access-token"];
    if (!token) {
        console.log('Token needed')
        return res.status(403).send("A token is required for authentication");
    }
    const decoded = jwt.verify(token, argv['secret']);
    const readable = decoded as Token;
    try {
        await User
            .findByIdAndUpdate(readable.user_id, {organizationId: req.body.organizationId}, {new: true}).exec().then(
                result => {
                    res.send(result)
                }
            )
    } catch(e) {
        console.log(e)
    }

})

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!(email && password)) {
            res.status(400).send("All input is required");
        }
        let roles = null;
        let organization = null;
        let user = null;

        try {
            user =await User.findOne({ email });
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
                    expiresIn: "1000d",
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
app.get("/test", verifyToken("Member"), (req, res) => {
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