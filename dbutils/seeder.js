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
    for(let i =0; i<100; i++) {
        let session = driver.session();
        session.run('MATCH(t:Task) WHERE ID(t)=$superIdentity\n' +
            'CREATE (s:Task {name: $subtask})<-[:CHILDREN]-(t)',
            {
                superIdentity: 26,
                subtask: faker.git.commitMessage()
            }).then(res => {
            console.log(res);
            session.close().then(result => {
                console.log(result)
            })
        })
    }
}

//52 - 61
async function createOrganizations() {
    for(let i = 0; i<10; i++){
        let session = driver.session();
        session.run('' +
            'CREATE (o: Organization {name: $name});',
            {
                name: 'Organization_'+i
            }).then(res => {
                session.close();
        })
    }
}

async function createProjects() {
    for (let i = 52; i<62; i++) {
        for (let k = 0; k < 10; k++) {
            let session = driver.session();
            session.run('' +
                'MATCH (o:Organization) WHERE ID(o)=$orgId \n' +
                'CREATE (p:Project {name: $name})<-[:CHILDREN]-(o)',
                {
                    orgId: i,
                    name: "Project_"+k
                }).then(res => {
                    console.log(res);
                session.close();
            })
        }
    }
}

async function createTasks() {
    for(let i = 112; i<209; i++) {
        for(let k = 0; k<10; k++) {
            let session= driver.session();
            session.run(
            'MATCH (p:Task) WHERE ID(p)=$projectId \n' +
            'CREATE (t:Task {name: $name})<-[:CHILDREN]-(p)', {
                projectId: i,
                    name: "Task_"+k
                })
        }
    }
}
