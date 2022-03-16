import {Token} from "./models";
import jwt from "jsonwebtoken";
import minimist from 'minimist';
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

