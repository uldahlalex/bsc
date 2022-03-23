import * as shared from './infrastructure.shared';
const client = shared.cassandraClient;

export function getRecords(query, entityId, limit) {
    return client.execute(query, [
        entityId,
        limit,
    ], {prepare: true});
}