import amqp, {Channel} from "amqplib/callback_api";
import {Activity} from "../utils/models";
import * as cqlWriter from '../infrastructure/infrastructure.writes';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(1));
const pass = argv['amqpPass'];
const user = argv['amqpUser'];
let url;

if (user && pass) {
    url = 'amqps://fttqsedw:'+pass+'@kangaroo.rmq.cloudamqp.com/'+user;
} else {
    url = 'amqp://localhost'
}

let taskChannel: Channel;

export function init() {
    amqp.connect(url, function(error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }
            var exchange = 'activity';
            channel.assertExchange(exchange, 'topic', {
                durable: false
            });

            channel.assertQueue('', {
                exclusive: true
            }, function(error2, q) {
                if (error2) {
                    throw error2;
                }
                console.log('Connected to AMQP');
                const args = ["activity.*"];
                args.forEach(function(key) {
                    channel.bindQueue(q.queue, exchange, key);
                });

                channel.consume(q.queue, function(msg) {
                    const activity = JSON.parse((msg.content.toString('utf8'))) as Activity;
                    activity.bodyitems = JSON.stringify(activity.bodyitems).toString();
                    cqlWriter.insertAction(activity);
                }, {
                    noAck: true
                });
            });
            taskChannel = channel;
        });
    });
}
