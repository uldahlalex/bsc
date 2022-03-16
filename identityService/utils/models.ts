import mongoose from "mongoose";

export interface User {
    _id: string,
    first_name: string,
    last_name: string,
    email: string,
    roles: [string],
    organizationId: number
}

export interface Token {
    user_id: string
    email: string
    roles: [string],
    organization: string
    iat: number,
    exp: number
}

export const User = mongoose.model("user",
    new mongoose.Schema({
        first_name: {type: String, default: null},
        last_name: {type: String, default: null},
        email: {type: String, unique: true},
        hash: {type: String},
        id: {type: mongoose.Schema.Types.ObjectId},
        token: {type: String},
        organizationId: {type: Number},
        roles: [String]
    }));
