
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
