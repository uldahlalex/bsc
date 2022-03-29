import * as shared from './infrastructure.shared';
import * as cassandra from 'cassandra-driver';




const client: cassandra.Client = shared.cassandraClient;

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

export function deleteAllActionsForUser(userId): boolean | cassandra.types.Row[] {
    let res;
    client.execute('DELETE FROM actions where userid = ?', [
        userId
    ], {prepare: true},  (err, result) => {
        if(err) {
            res = false;
        } else {
            res = result.rows;
        }
    });
    return res;
}

export function rollBack(actions: any) {
    return client.execute('INSERT INTO actions JSON \'?\';', [
        actions
    ], {prepare: true})
}