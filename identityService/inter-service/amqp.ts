import amqp, {Channel} from "amqplib/callback_api";

let taskRepo;
let taskChannel: Channel;
let instanceQ;

amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function (error1, channel: Channel) {
        if (error1) {
            throw error1;
        }
        var exchange = 'topic_logs';

        channel.assertExchange(exchange, 'topic', {
            durable: false
        });

        channel.assertQueue('', {
            exclusive: true
        }, function (error2, q) {
            if (error2) {
                throw error2;
            }
            console.log(' [*] Waiting for logs. To exit press CTRL+C');
            const args = ["#", "topic.*", "*.critical"];
            args.forEach(function (key) {
                channel.bindQueue(q.queue, exchange, key);
            });

        });
        taskChannel = channel;
    });
});

export function publish(arg, kwarg, zarg) {
    taskChannel.publish(arg, kwarg, zarg);
}