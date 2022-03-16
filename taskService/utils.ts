import jwt from "jsonwebtoken";
import minimist from 'minimist';
import {Token} from "./models";
const argv = minimist(process.argv.slice(1));
import * as amqpClient from './amqp';
import amqp from "amqplib/callback_api";

export function joinUserDetailsAndTasks(userDetailsArray: any[], project) {
    let count = 0;
    innerTraverse(project);
    function innerTraverse(t) {
        if (t.children != undefined) {
            t.children.forEach(each => {
                each.user = userDetailsArray[count]
                count++;
                if (each.children != undefined) {
                    innerTraverse(each);
                }
            })
        }
    }
    return project;
}

export function traverseProjectForAllTaskCreatedBy(project): string[] {
    let ids = [];
    innerTraverse(project)
    function innerTraverse(t) {
        if (t.children != undefined) {
            t.children.forEach(each => {
                ids.push(each.createdBy);
                if (each.children != undefined) {
                    innerTraverse(each);
                }
            })
        }
    }
    return ids;
}

export function authorize(...role) {
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
                return res.status(401).send('Only ' + role + ' allowed')
            }
        } catch (err) {
            return res.status(401).send("Try again");
        }
        return next();
    }
}

export function emitToActivityService(...message) {
    return (req, res, next) => {
        const token =
            req.body.token || req.query.token || req.headers["x-access-token"];
        const readable = jwt.verify(token, argv['secret']) as Token;
        let dto = {
            userid: readable.user_id,
            organizationid: readable.organization,
            actiontype: req.method,
            bodyitems: req.body,
            endpoint: req.route.path,
            service: 'task'
        };
        amqpClient.publish('topic_logs', 'topic.critical', Buffer.from(JSON.stringify(dto)))
        return next();
    }
}


