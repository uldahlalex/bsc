/**
 * Script to seed TaskStore (Neo4j)
 */
/*
const {Connection} = require('cypher-query-builder');
const {faker} = require('@faker-js/faker');
const cypher = require('cypher-query-builder');

const db = new Connection('bolt://localhost', {
    username: 'neo4j',
    password: 'test'
})

function createOneTaskNode() {
    db.createNode('task', 'Task', {
        title: faker.git.commitMessage(),
        description: faker.lorem.sentence(),
        authorId: faker.random.alphaNumeric(),
    })
        .run()
        .then(r => console.log(r));
}

function relateNodeToOtherNode() {
    db.matchNode('task', 'Task', {identity: 0})
        .create(cypher.relation('out', 'rel','SUBTASK'))
        .matchNode('task', 'Task', {identity: 1})
        .run();
}

relateNodeToOtherNode();
*/

const neo4j = require('neo4j-driver');
const driver = neo4j.driver('bolt://localhost',
    neo4j.auth.basic('neo4j', 'test'));
const {faker} = require('@faker-js/faker');
const parser = require('parse-neo4j');

function createOneTaskNode() {
    session.run('' +
        'CREATE (task:Task {' +
        'title: $title, ' +
        'description: $description,' +
        'authorId: $authorId }) RETURN task',
        {
            title: faker.git.commitMessage(),
            description: faker.lorem.sentence(),
            authorId: faker.random.alphaNumeric(),
        }).then(result => {
            console.log(result)
    })
}

function createRelationship() {
    session.run('' +
        'MATCH (a:Task), (b:Task)\n' +
        'WHERE ID(a) = $aIdentity AND ID(b) = $bIdentity\n' +
        'CREATE (a)-[:SUBTASK]->(b);',
        {
            aIdentity: 2,
            bIdentity: 0
        }).then(result => {
          console.log(result);
        })
}

function getAll() {
    let result = session.run('' +
        'MATCH (n) RETURN (n)');

    /*var parsedResult = result
        .then(parser.parse)
        .then(function(parsed){
            parsed.forEach(function(parsedRecord) {
                console.log(parsedRecord);
            });
        })
        .catch(function(parseError) {
            console.log(parseError);
        });
    console.log(parsedResult);*/
    console.log(JSON.stringify(result, null, 3))
}

function seed() {
    for(let i =0; i<10; i++) {
        let session = driver.session();
        session.run('MATCH(t:Task) WHERE ID(t)=$superIdentity\n' +
            'CREATE (s:Task {name: $subtask})<-[:CHILDREN]-(t)',
            {
                superIdentity: 4,
                subtask: faker.git.commitMessage()
            }).then(res => {
            console.log(res);
            session.close().then(result => {
                console.log(result)
            })
        })
    }
}
seed()


function queryTree() {
    let session = driver.session();
    session.run('MATCH p=(t:Task)-[:SUBTASKOF]->()\n' +
        'WITH COLLECT(p) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value')
        .then(parser.parse)
        .then(function(parsed){
            parsed.forEach(function(parsedRecord) {
                console.log(parsedRecord);
            });
            session.close()
        })
        .catch(function(parseError) {
            console.log(parseError);
        });
}
function revQueryTree() {
    let session = driver.session();
    session.run('MATCH p=(t:Task)-[:SUBTASKOF]->()\n' +
        'WITH COLLECT(p) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value')
        .then(parser.parse)
        .then(function(parsed){
            parsed.forEach(function(parsedRecord) {
                console.log(parsedRecord);
            });
            session.close()
        })
        .catch(function(parseError) {
            console.log(parseError);
        });
}
