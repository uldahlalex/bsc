import cassandra from "cassandra-driver";
import minimist from 'minimist';
const argv = minimist(process.argv.slice(1));

let client;

if(argv['client']==undefined || argv['pass']==undefined) {
    client = new cassandra.Client({
        contactPoints: ['localhost:9042'],
        localDataCenter: 'datacenter1',
        keyspace: 'mykeyspace'
    });
    //Possibly create new schema here for local development
} else {
    client = new cassandra.Client({
        cloud: {
            secureConnectBundle: "./secure-connect-activity.zip",
        },
        credentials: {
            username: argv['client'],
            password: argv['pass'],
        }, keyspace: 'activity'
    }, );
}

client.connect().then(r => console.log('Connected to Cassandra'));

export function insertAction(activity) {
    const query = 'INSERT INTO actions (actiontype, bodyitems, endpoint, eventtime, organizationid, service, userid) VALUES (?, ?, ?, ?, ?, ?, ?);';
    client.execute(query, [
        activity.actiontype,
        activity.bodyitems,
        activity.endpoint,
        new Date(),
        activity.organizationid,
        activity.service,
        activity.userid
    ]).then(() => {});
}

export function getRecords(query, entityId, limit) {
    return client.execute(query, [
        entityId,
        limit,
    ], {prepare: true});
}