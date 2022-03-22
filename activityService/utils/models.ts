export interface Activity {
    actiontype: string;
    bodyitems: string;
    endpoint: string;
    eventtime: Date;
    organizationid: number;
    service: string;
    userid: string;
}

export interface Token {
    user_id: string
    email: string
    roles: [string],
    organization: string
    iat: number,
    exp: number
}