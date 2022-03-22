import * as shared from './infrastructure.shared';
let driver = shared.neo4Driver;


export function getOrganizations() {
    let session = driver.session();
    return session.run(
        'MATCH collect=(o:Organization)\n' +
        'WITH COLLECT(collect) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value;').then((result: any) => {
        session.close();
        return result.records;
    })
}

export function getProjectsForOrganization(req) {
    let session = driver.session();
    return session.run(
        'MATCH (o:Organization) WHERE ID(o)=$organizationId\n' +
        'WITH o as organization\n' +
        'MATCH collect=(organization)-[:CHILDREN]->(p:Project)\n' +
        'WITH COLLECT(collect) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value', {
            organizationId: Number(req.params.organizationId),
        }).then((result: any) => {
        session.close();
        return result.records[0]._fields[0].children
    })
}

export function getProjectFromOrganization(req) {
    let session = driver.session();
    return session.run(
        'MATCH (o:Organization) WHERE ID(o)=$organizationId\n' +
        'WITH o as organization\n' +
        'MATCH collect=(p:Project)<-[:CHILDREN]-(organization) WHERE ID(p)=$projectId\n' +
        'WITH COLLECT(collect) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value;', {
            organizationId: Number(req.params.organizationId),
            projectId: Number(req.params.projectId),
        }).then((result: any) => {
        session.close();
        let dto = result.records[0]._fields[0];
        dto.children = null;
        return dto;
    })
}

export function getTasksForProject(req){
    let session = driver.session();
    return session.run('' +
        'MATCH (o:Organization) WHERE ID(o)=$organizationId\n' +
        'WITH o as organization\n' +
        'MATCH (p:Project)<-[:CHILDREN]-(organization) WHERE ID(p)=$projectId\n' +
        'WITH p as projects\n' +
        'MATCH collect=(projects)-[:CHILDREN*]->(t:Task)\n' +
        'WITH COLLECT(collect) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value;', {
        organizationId: Number(req.params.organizationId),
        projectId: Number(req.params.projectId)
    }).then((result: any) => {
        session.close();
        return result.records[0]._fields[0].children
    })
}

export function getTasksForProjectWithUserData(req) {
    let session = driver.session();
    return session.run('' +
        'MATCH (o:Organization) WHERE ID(o)=$organizationId\n' +
        'WITH o as organization\n' +
        'MATCH (p:Project)<-[:CHILDREN]-(organization) WHERE ID(p)=$projectId\n' +
        'WITH p as projects\n' +
        'MATCH collect=(projects)-[:CHILDREN*]->(t:Task)\n' +
        'WITH COLLECT(collect) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value;', {
        organizationId: Number(req.params.organizationId),
        projectId: Number(req.params.projectId)
    }).then((result: any) => {
        session.close();
        return result.records[0]._fields[0];
    })
}