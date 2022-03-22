import cassandra from "cassandra-driver";
import minimist from 'minimist';
const argv = minimist(process.argv.slice(1));



const alt = new cassandra.Client({
    contactPoints: ['localhost:9042'],
    localDataCenter: 'datacenter1',
    keyspace: 'mykeyspace'
});

const client = new cassandra.Client({
    cloud: {
        secureConnectBundle: "./secure-connect-activity.zip",
    },
    credentials: {
        username: argv['client'],
        password: argv['pass'],
    }, keyspace: 'activity'
}, );

client.connect().then(r => console.log('Connected'));

export function insertAction(activity) {
    console.log('Persisting action')
    const query = 'INSERT INTO actions (actiontype, bodyitems, endpoint, eventtime, organizationid, service, userid) VALUES (?, ?, ?, ?, ?, ?, ?);';
    client.execute(query, [
        activity.actiontype,
        activity.bodyitems,
        activity.endpoint,
        new Date(),
        activity.organizationid,
        activity.service,
        activity.userid
    ]).then(r => {
        console.log('Persisted activity');
        console.log(r.rows);
    });
}

export function getRecords(query, entityId, limit) {
    console.log('Retrieving records')
    return client.execute(query, [
        entityId,
        limit,
    ], {prepare: true});
}