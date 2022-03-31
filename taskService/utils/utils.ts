import jwt from "jsonwebtoken";
import minimist from 'minimist';
import {Token} from "./models";
const argv = minimist(process.argv.slice(1));
import * as amqpClient from '../inter-service/amqp';

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

export function getToken(req): Token {
    return jwt.decode(req.body.token || req.query.token || req.headers["x-access-token"], argv['secret']) as Token;
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

export function emitToActivityService() {
    return (req, res, next) => {
        const token = getToken(req);
        let dto = {
            userid: token.user_id,
            organizationid: token.organization,
            actiontype: req.method,
            bodyitems: req.body,
            endpoint: req.route.path,
            service: 'task'
        };
        amqpClient.publish('activity', 'activity.task',
            Buffer.from(JSON.stringify(dto)))
        return next();
    }
}


