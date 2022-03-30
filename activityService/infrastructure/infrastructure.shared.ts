import cassandra from "cassandra-driver";
import minimist from 'minimist';
const argv = minimist(process.argv.slice(1));

var seeder: cassandra.Client = new cassandra.Client({
    contactPoints: ['localhost:9042']
})

seeder.connect(function(e) {
    var query = "create keyspace IF NOT EXISTS mykeyspace with replication = {'class': 'org.apache.cassandra.locator.NetworkTopologyStrategy', 'datacenter1': '3'};";
    return client.execute(query, function(e, res) {
        return console.log(e, res);
    });
});


var client;

if(argv['client']==undefined || argv['pass']==undefined) {
    client = new cassandra.Client({
        contactPoints: ['localhost:9042'],
        localDataCenter: 'datacenter1',
        keyspace: 'mykeyspace'
    });
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

client.connect(function(e) {
    let table = "CREATE TABLE IF NOT EXISTS Actions (\n" +
        "   userId text,\n" +
        "   actionType text,\n" +
        "   endpoint text,\n" +
        "   service text,\n" +
        "   bodyItems text,\n" +
        "   organizationId bigint,\n" +
        "   eventTime timestamp,\n" +
        "   PRIMARY KEY(userId, eventTime)\n" +
        ") WITH CLUSTERING ORDER BY (eventtime DESC);\n"
    let organizationIndex = "CREATE INDEX IF NOT EXISTS organizationid ON mykeyspace.actions (organizationid);";
    client.execute(table);
    client.execute(organizationIndex);
})

export const cassandraClient = client;