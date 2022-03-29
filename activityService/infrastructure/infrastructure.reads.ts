import * as shared from './infrastructure.shared';


const client = shared.cassandraClient;

export function getRecords(query, entityId, limit) {
    return client.execute(query, [
        entityId,
        limit,
    ], {prepare: true});
}

export function getAllActionsForUser(userId) {
    return client.execute('SELECT * FROM actions WHERE userid = ?;', [
        userId
    ], {prepare: true});
}
