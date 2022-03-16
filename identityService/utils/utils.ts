import {Token} from "./models";
import jwt from "jsonwebtoken";
import minimist from 'minimist';
import * as amqpClient from '../inter-service/amqp'

const argv = minimist(process.argv.slice(1));

export function getToken(req): Token {
    return jwt.verify(req.body.token || req.query.token || req.headers["x-access-token"], argv['secret']) as Token;
}

export function authorize(...role) {
    return (req, res, next) => {
        const token = getToken(req);
        if (!token) {
            return res.status(403).send("A token is required for authentication");
        }
        try {
            if (token.roles.includes(role[0])) {
                return next();
            } else {
                return res.status(401).send('Only ' + role + ' allowed')
            }
        } catch (err) {
            return res.status(401).send("Try again");
        }
    }
}

export function emitToActivityService(...message) {
    return (req, res, next) => {
        const token = getToken(req);
        let dto = {
            userid: token.user_id,
            organizationid: token.organization,
            actiontype: req.method,
            bodyitems: req.body,
            endpoint: req.route.path,
            service: 'identity'
        };
        amqpClient.publish('topic_logs', 'topic.critical', Buffer.from(JSON.stringify(dto)))
        return next();
    }
}