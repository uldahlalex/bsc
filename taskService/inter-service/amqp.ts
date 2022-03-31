import amqp, {Channel} from "amqplib/callback_api";
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

amqp.connect(url, function (error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function (error1, channel: Channel) {
        if (error1) {
            throw error1;
        }
        var exchange = 'activity';

        channel.assertExchange(exchange, 'topic', {
            durable: false
        });

        channel.assertQueue('', {
            exclusive: true
        }, function (error2, q) {
            if (error2) {
                throw error2;
            }
            console.log('Connected to AMQP');
            const args = ["activity.*"];
            args.forEach(function (key) {
                channel.bindQueue(q.queue, exchange, key);
            });

        });
        taskChannel = channel;
    });
});

export function publish(exchange, routingKey, content) {
    taskChannel.publish(exchange, routingKey, content);
}