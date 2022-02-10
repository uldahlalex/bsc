import minimist from 'minimist';
import http from "http";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from 'cors';
import mongoose from "mongoose";
import express from "express";
import {Kafka, logLevel} from "kafkajs";

const argv = minimist(process.argv.slice(1));
const port = argv['port'] || 3000;
const app = express();
const server = http.createServer(app);
const userModel = mongoose.model("user", new mongoose.Schema({
    first_name: { type: String, default: null },
    last_name: { type: String, default: null },
    email: { type: String, unique: true },
    password: { type: String },
    token: { type: String },
}));
const kafkaConsumer = new Kafka({
    logLevel: logLevel.ERROR,
    brokers: ['localhost:9092'],
    clientId: 'identity',
}).consumer({ groupId: 'test-group' });

async function kafkaInit() {
    await kafkaConsumer.connect()
    await kafkaConsumer.subscribe({ topic: 'test-topic', fromBeginning: true })
    await kafkaConsumer.run({
        eachMessage: async ({ message }) => {
            console.log({
                value: message.value.toString(),
            })
        },
    })
}
kafkaInit().then(r => {
    console.log(r);
    console.log('Initialized kafka connection')
});
mongoose.connect("mongodb://root:example@localhost:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false").then(
    () => {
        console.log('Connected to MongoDB')
        },
    err => {
        console.log(err)
    }
);
app.use(express.json({ limit: "50mb" }));

app.use(cors({
    origin: 'http://localhost:8100',
    methods: "GET, PUT"
}))

app.post("/register", async (req, res) => {
        try {
            const { first_name, last_name, email, password } = req.body;

            if (!(email && password && first_name && last_name)) {
                res.status(400).send("Invalid request");
            }

            if (await userModel.findOne({ email })) {
                return res.status(409).send("User Already Exist. Please Login");
            }

            const encryptedPassword = await bcrypt.hash(password, 10);

            const user = await userModel.create({
                first_name,
                last_name,
                email: email.toLowerCase(),
                hash: encryptedPassword,
            });

            user.token = jwt.sign(
                {user_id: user._id, email},
                argv['secret'],
                {
                    expiresIn: "2h",
                }
            );
            return res.status(201).json(user);
        } catch (err) {
            console.log(err);
        }
    });



app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!(email && password)) {
            res.status(400).send("All input is required");
        }
        const user = await userModel.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            user.token = jwt.sign(
                {user_id: user._id, email},
                argv['secret'],
                {
                    expiresIn: "2h",
                }
            );
            return res.status(200).json(user);
        }

        res.status(400).send("Invalid Credentials");
    } catch (err) {
        console.log(err);
    }
});
app.get("/test", verifyToken, (req, res) => {
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

function verifyToken(req: any, res: any, next: any) {
    const token =
        req.body.token || req.query.token || req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    try {
        const decoded = jwt.verify(token, argv['secret']);
        console.log(jwt.decode(token));
        req.user = decoded;
    } catch (err) {
        return res.status(401).send("Try again");
    }
    return next();
}

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});