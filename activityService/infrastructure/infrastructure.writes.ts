import * as shared from './infrastructure.shared';




const client = shared.cassandraClient;

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

export function deleteAllActionsForUser(userId) {
    return client.execute('DELETE FROM actions where userid = ?', [
        userId
    ], {prepare: true});
}

export function rollBack(actions: any) {

}