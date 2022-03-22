import * as shared from './infrastructure.shared';
import {getToken} from "../utils/utils";
let driver = shared.neo4Driver;

export function markTaskAsDone(req) {
    let session = driver.session();
    return session.run(
        'MATCH (o:Organization) WHERE ID(o)=$organizationId \n' +
        'WITH o as organization \n' +
        'MATCH (organization)-[:CHILDREN]->(p:Project) WHERE ID(p)=$projectId \n' +
        'WITH p as project \n' +
        'MATCH (project)-[:CHILDREN*]->(t:Task) WHERE ID(t)=$taskId \n' +
        'WITH t as task \n' +
        'SET task.done = true \n' +
        'RETURN task;', {
        organizationId: Number(req.params.organizationId),
        projectId: Number(req.params.projectId),
        taskId: Number(req.params.taskId)
    }).then(result => {
        session.close();
        return result.records.length > 0;
    })
}

export function markTaskAsUndone(req) {
    let session = driver.session();
    return session.run(
        'MATCH (o:Organization) WHERE ID(o)=$organizationId\n' +
        'WITH o as organization\n' +
        'MATCH (organization)-[:CHILDREN]->(p:Project) WHERE ID(p)=$projectId\n' +
        'WITH p as project\n' +
        'MATCH (project)-[:CHILDREN*]->(t:Task) WHERE ID(t)=$taskId\n' +
        'with t as task\n' +
        'SET task.done = false\n' +
        'RETURN task;', {
        organizationId: Number(req.params.organizationId),
        projectId: Number(req.params.projectId),
        taskId: Number(req.params.taskId)
    }).then(result => {
      session.close();
      return result.records.length > 0
    })
}

export function createProjectForOrganization(req) {
    let session = driver.session();
    return session.run(
        'MATCH (o: Organization) WHERE ID(o)=$organizationId\n' +
        'WITH o as organization\n' +
        'CREATE p=(project:Project {name: $name, description: $description, createdAt: datetime()})<-[:CHILDREN]-(organization)\n' +
        'WITH COLLECT(p) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value;', {
        organizationId: Number(req.params.organizationId),
        name: req.body.name,
        description: req.body.description
    }).then((result: any) => {
        session.close();
        let dto = result.records[0]._fields[0];
        dto.children = null;
        return dto;
    })
}

export function createOrganization(req) {
    let session = driver.session();
    return session.run('' +
        'CREATE p=(o:Organization {name: $name}) ' +
        'WITH COLLECT(p) AS ps ' +
        'CALL apoc.convert.toTree(ps) YIELD value ' +
        'RETURN value;', {
        name: req.body.name
    }).then((result: any) => {
        session.close();
        return result.records[0];
    })
}

export function createTaskForProject(req) {
    const token = getToken(req);
    let session = driver.session();
    return session.run('' +
        'MATCH (o:Organization) WHERE ID(o)=$organizationId \n' +
        'WITH o as organization \n' +
        'MATCH (organization)-[:CHILDREN]->(p:Project) WHERE ID(p)=$projectId \n' +
        'WITH p as project \n' +
        'CREATE collect=(t:Task {' +
        'name: $name, ' +
        'description: $description, ' +
        'createdAt: datetime(), ' +
        'createdBy: $createdBy ' +
        '})<-[:CHILDREN]-(project) ' +
        'WITH COLLECT(collect) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value;',
        {
            organizationId: Number(req.params.organizationId),
            projectId: Number(req.params.projectId),
            name: req.body.name,
            description: req.body.description,
            createdBy: token.user_id
        })
        .then((result: any) => {
            session.close();
            let dto = result.records[0]._fields[0];
            dto.children = null;
            return dto;
        })
}

export function createSubtask(req) {
    let session = driver.session();
    const token = getToken(req);
    return session.run('' +
        'MATCH (o:Organization) WHERE ID(o)=$organizationId \n' +
        'WITH o as organization \n' +
        'MATCH (organization)-[:CHILDREN]->(p:Project) WHERE ID(p)=$projectId \n' +
        'WITH p as project \n' +
        'MATCH (project)-[:CHILDREN*]->(t:Task) WHERE ID(t)=$taskId\n' +
        'WITH t as task\n' +
        'CREATE collect=(t:Task {' +
        'name: $name, ' +
        'description: $description, ' +
        'createdAt: datetime(), ' +
        'createdBy: $createdBy ' +
        '})<-[:CHILDREN]-(task)\n' +
        'WITH COLLECT(collect) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value;', {
        organizationId: Number(req.params.organizationId),
        projectId: Number(req.params.projectId),
        taskId: Number(req.params.taskId),
        name: req.body.name,
        description: req.body.description,
        createdBy: token.user_id
    }).then((result: any) => {
        session.close();
        let dto = result.records[0]._fields[0];
        dto.children = null;
        return dto;
    })
}

export function deleteSubtasks(req) {
    let session = driver.session();
    return session.run('' +
        'MATCH (o:Organization) WHERE ID(o)=$organizationId\n' +
        'WITH o as organization \n' +
        'MATCH (organization)-[:CHILDREN]->(p:Project) WHERE ID(p)=$projectId\n' +
        'WITH p as project \n' +
        'MATCH (project)-[:CHILDREN]->(t:Task) WHERE ID(t)=$taskId\n' +
        'WITH t as task\n' +
        'MATCH (task)-[:CHILDREN*]->(n)\n' +
        'DETACH DELETE n;', {
        organizationId: Number(req.params.organizationId),
        projectId: Number(req.params.projectId),
        taskId: Number(req.params.taskId),
    }).then(result => {
        session.close();
        return true
    })
}

export function deleteTask(req) {
    let session = driver.session();
    return session.run('' +
        'MATCH (o:Organization) WHERE ID(o)=$organizationId\n' +
        'WITH o as organization \n' +
        'MATCH (organization)-[:CHILDREN]->(p:Project) WHERE ID(p)=$projectId\n' +
        'WITH p as project \n' +
        'MATCH (project)-[:CHILDREN]->(t:Task) WHERE ID(t)=$taskId\n' +
        'WITH t as task\n' +
        'MATCH (task)-[:CHILDREN*]->(n)\n' +
        'DETACH DELETE n, task;', {
        organizationId: Number(req.params.organizationId),
        projectId: Number(req.params.projectId),
        taskId: Number(req.params.taskId),
    }).then(result => {
        session.close();
        return result;
    })
}










/*
app.post('/organizations/createAndJoin', utils.emitToActivityService('T'), async (req, res) => {
    let session = driver.session();
    session.run('' +
        'CREATE (o:Organization {name: $name}) RETURN o;', {
        name: req.body.name
    }).then((result: any) => {
        session.close();
        try {
            grpcClient.joinOrganizationUponCreation(
                {
                    userId: req.body.userId,
                    organizationId: result.records[0]._fields[0].identity.low
                }, (grpcError, grpcResult) => {
                    if (!grpcError) {
                        console.log('Successfully updated org ID for user')
                    } else {
                        //ROLLBACK
                        console.error(grpcError)
                        let session = driver.session();
                        session.run('' +
                            'MATCH (o:Organization) WHERE ID(o)=$organizationId\n' +
                            'DETACH DELETE (o);', {
                            organizationId: result.records[0]._fields[0].identity.low
                        }).then(result => {
                            res.send('Error adding user to organization; No organization added')
                        })
                    }
                })
        } catch (e) {
            //ROLLBACK
            console.error(e)
            let session = driver.session();
            session.run('' +
                'MATCH (o:Organization) WHERE ID(o)=$organizationId\n' +
                'DETACH DELETE (o);', {
                organizationId: result.records[0]._fields[0].identity.low
            }).then(result => {
                res.send('Error adding user to organization; No organization added')
            })
        }

        res.send(result.records[0]._fields)
    })
})*/