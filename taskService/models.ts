export interface Task {
    createdAt: CreatedAt
    createdBy: string
    userInfo: any;
    children: Task[]
    _type: string
    name: string
    description: string
    _id: Id
}

export interface Id {
    low: number
    high: number
}

export interface CreatedAt {
    year: Year
    month: Month
    day: Day
    hour: Hour
    minute: Minute
    second: Second
    nanosecond: Nanosecond
    timeZoneOffsetSeconds: TimeZoneOffsetSeconds
}

export interface Year {
    low: number
    high: number
}

export interface Month {
    low: number
    high: number
}

export interface Day {
    low: number
    high: number
}

export interface Hour {
    low: number
    high: number
}

export interface Minute {
    low: number
    high: number
}

export interface Second {
    low: number
    high: number
}

export interface Nanosecond {
    low: number
    high: number
}

export interface TimeZoneOffsetSeconds {
    low: number
    high: number
}

export interface Token {
    user_id: string
    email: string
    roles: [string],
    organization: string
    iat: number,
    exp: number
}
