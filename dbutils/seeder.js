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

function bootStrap() {
    let session = driver.session.run('' +
        '',
        {
            title: faker.git.commitMessage(),
            description: faker.lorem.sentence(),
            authorId: faker.random.alphaNumeric(),
        }).then(result => {
            console.log(result)
    })
}



function seed() {
    for(let i =0; i<10; i++) {
        let session = driver.session();
        session.run('MATCH(t:Task) WHERE ID(t)=$superIdentity\n' +
            'CREATE (s:Task {name: $subtask})<-[:CHILDREN]-(t)',
            {
                superIdentity: 27,
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

