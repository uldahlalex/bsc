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

export function getProjectByName(projectName) {
    let session = driver.session();
    return session.run(
        'MATCH (o:Project) WHERE (o.name=$projectName)\n' +
        'RETURN (o);', {
            projectName: projectName
        }).then((result: any) => {
        session.close();
        return result.records;
    })
}

export function getOrganizationByName(organizationName) {
    let session = driver.session();
    return session.run(
        'MATCH (o:Organization) WHERE (o.name=$organizationName)\n' +
        'RETURN (o);', {
            organizationName: organizationName
        }).then((result: any) => {
        session.close();
        return result.records;
    })
}

export function getProjectsForOrganization(organizationId) {
    let session = driver.session();
    return session.run(
        'MATCH (o:Organization) WHERE ID(o)=$organizationId\n' +
        'WITH o as organization\n' +
        'MATCH collect=(organization)-[:CHILDREN]->(p:Project)\n' +
        'WITH COLLECT(collect) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value', {
            organizationId: organizationId//Number(req.params.organizationId),
        }).then((result: any) => {
        session.close();
        return result.records[0]._fields[0].children
    })
}

export function getProjectFromOrganization(organizationId, projectId) {
    let session = driver.session();
    return session.run(
        'MATCH (o:Organization) WHERE ID(o)=$organizationId\n' +
        'WITH o as organization\n' +
        'MATCH collect=(p:Project)<-[:CHILDREN]-(organization) WHERE ID(p)=$projectId\n' +
        'WITH COLLECT(collect) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value;', {
            organizationId: organizationId,//Number(req.params.organizationId),
            projectId: projectId//Number(req.params.projectId),
        }).then((result: any) => {
        session.close();
        let dto = result.records[0]._fields[0];
        dto.children = null;
        return dto;
    })
}

export function getTasksForProject(organizationId, projectId){
    let session = driver.session();
    return session.run('' +
        'MATCH (o:Organization) WHERE ID(o)=$organizationId\n' +
        'WITH o as organization\n' +
        'MATCH (p:Project)<-[:CHILDREN]-(organization) WHERE ID(p)=$projectId\n'+
        'WITH p as projects\n' +
        'MATCH collect=(projects)-[:CHILDREN*]->(t:Task)\n' +
        'WITH COLLECT(collect) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value;', {
        organizationId: organizationId,
        projectId: projectId
    }).then((result: any) => {
        session.close();
        return result.records[0]._fields[0].children
    })
}

export function getTasksForProjectWithUserData(organizationId, projectId) {
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
        organizationId: organizationId,
        projectId: projectId
    }).then((result: any) => {
        session.close();
        return result.records[0]._fields[0];
    })
}