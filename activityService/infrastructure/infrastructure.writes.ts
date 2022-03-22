import cassandra from "cassandra-driver";
const client = new cassandra.Client({
    contactPoints: ['localhost:9042'],
    localDataCenter: 'datacenter1',
    keyspace: 'mykeyspace'
});

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
    ]).then(r => console.log('Persisted activity'));
}

export function getRecords(query, entityId, limit) {
    return client.execute(query, [
        entityId,
        limit,
    ], {prepare: true});
}