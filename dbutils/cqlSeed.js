const { Client } = require("cassandra-driver");

async function run() {
    const client = new Client({
        cloud: {
            secureConnectBundle: "./secure-connect-activity.zip",
        },
        credentials: {
            username: "",
            password: "",
        }, keyspace: 'activity'
    }, );

    await client.connect();

    // Execute a query
    const rs = await client.execute(`
CREATE TABLE Actions (
    userId text,
    actionType text,
    endpoint text,
    service text,
    bodyItems text,
    organizationId bigint,
    eventTime timestamp,
    PRIMARY KEY(userId, eventTime)
) WITH CLUSTERING ORDER BY (eventtime DESC)`);

    await client.shutdown();
}

// Run the async function
run();