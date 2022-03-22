import amqp, {Channel} from "amqplib/callback_api";
import {Activity} from "../utils/models";
import * as cqlWriter from '../infrastructure/infrastructure.writes';

let taskRepo;
let taskChannel: Channel;
let instanceQ;

/**
 * PERSIST DATA TO CASSANDRA UPON AMQP MESSAGES
 */
export function init() {
    amqp.connect('amqp://localhost', function(error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }
            var exchange = 'topic_logs'; //Exhanges route messages to queues using routing keys (binding = link between queue and exchange)
            //channels are used for publishing or consuming messages from a queue
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
