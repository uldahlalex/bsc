import { PrismaClient } from '@prisma/client'
import express from 'express';
import http from 'http';
import minimist from 'minimist';
import axios from 'axios';

const app = express();
const server = http.createServer(app)
const prisma = new PrismaClient()
const { Kafka, logLevel } = require('kafkajs')
const argv = minimist(process.argv.slice(1));
const port = argv['port'] || 3001;
prisma.$connect().then(r => {
    console.log(r);
    console.log('connected');
})
const kafkaProducer = new Kafka({
    logLevel: logLevel.ERROR,
    brokers: ['localhost:9092'],
    clientId: 'identity',
}).producer({ groupId: 'test-group' });

async function kafkaInit() {
    //await kafkaProducer.connect()

}


kafkaInit().then(r => {
    console.log(r)
    console.log('Initialized Kafka connection')
})

app.get('/tasks', async (req, result) => {


})

app.post('/tasks', async(req, res) => {
    await prisma.task.create({
        data: {
            title: "do something",
            desc: "now",
            authorId: 1
        }
    }).then(result => {
        res.send(result);
    })

})

app.get('/sendToIdentity', async (req, res) => {
    /*await kafkaProducer.send({
        topic: 'test-topic',
        messages: [
            {value: 'Hello KafkaJS user!'},
        ],
    })*/
    res.send('sent')
})


server.listen(port, () => {
    console.log('now listening on port '+port)
})


