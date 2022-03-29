import * as shared from './infrastructure.shared';

let driver = shared.neo4Driver;

export function markTaskAsDone(organizationId, projectId, taskId) {
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
            organizationId: organizationId,//Number(req.params.organizationId),
            projectId: projectId,//Number(req.params.projectId),
            taskId: taskId//Number(req.params.taskId)
        }).then(result => {
        session.close();
        return result.records.length > 0;
    })
}

export function markTaskAsUndone(organizationId, projectId, taskId) {
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
            organizationId: organizationId,//Number(req.params.organizationId),
            projectId: projectId,//Number(req.params.projectId),
            taskId: taskId//Number(req.params.taskId)
        }).then(result => {
        session.close();
        return result.records.length > 0
    })
}

export function createProjectForOrganization(organizationId, name, description) {
    let session = driver.session();

    return session.run(
        'MATCH (o: Organization) WHERE ID(o)=$organizationId\n' +
        'WITH o as organization\n' +
        'CREATE p=(project:Project {name: $name, description: $description, createdAt: datetime()})<-[:CHILDREN]-(organization)\n' +
        'WITH COLLECT(p) AS ps\n' +
        'CALL apoc.convert.toTree(ps) YIELD value\n' +
        'RETURN value;', {
            organizationId: organizationId,//Number(req.params.organizationId),
            name: name, //req.body.name,
            description: description//req.body.description
        }).then((result: any) => {
        session.close();
        let dto = result.records[0]._fields[0];
        dto.children = null;
        return dto;
    })


}

export function createOrganization(name, id?) {
    let session = driver.session();
    if (id) {
        return session.run('' +
            'CREATE p=(o:Organization {name: $name, ID: 0}) ' +
            'WITH COLLECT(p) AS ps ' +
            'CALL apoc.convert.toTree(ps) YIELD value ' +
            'RETURN value;', {
            name: name//req.body.name
        }).then((result: any) => {
            session.close();
            return result.records[0];
        })
    } else {
        return session.run('' +
            'CREATE p=(o:Organization {name: $name}) ' +
            'WITH COLLECT(p) AS ps ' +
            'CALL apoc.convert.toTree(ps) YIELD value ' +
            'RETURN value;', {
            name: name//req.body.name
        }).then((result: any) => {
            session.close();
            return result.records[0];
        })
    }
}

export function createTaskForProject(userId, organizationId, projectId, name, description) {
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
        'RETURN value;', {
        organizationId: organizationId,//Number(req.params.organizationId),
        projectId: projectId,//Number(req.params.projectId),
        name: name,//req.body.name,
        description: description,//req.body.description,
        createdBy: userId//token.user_id
    })
        .then((result: any) => {
            session.close();
            let dto = result.records[0]._fields[0];
            dto.children = null;
            return dto;
        })
}

export function createSubtask(userId, organizationId, projectId, taskId, name, description) {
    let session = driver.session();
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
        organizationId: organizationId,//Number(req.params.organizationId),
        projectId: projectId,//Number(req.params.projectId),
        taskId: taskId,//Number(req.params.taskId),
        name: name,//req.body.name,
        description: description,//req.body.description,
        createdBy: userId//token.user_id
    }).then((result: any) => {
        session.close();
        let dto = result.records[0]._fields[0];
        dto.children = null;
        return dto;
    })
}

export function deleteSubtasks(organizationId, projectId, taskId) {
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
        organizationId: organizationId,//Number(req.params.organizationId),
        projectId: projectId,//Number(req.params.projectId),
        taskId: taskId//Number(req.params.taskId),
    }).then(result => {
        session.close();
        return true
    })
}

export function deleteTask(organizationId, projectId, taskId) {
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
        organizationId: organizationId,//Number(req.params.organizationId),
        projectId: projectId,//(Number(req.params.projectId),
        taskId: taskId//Number(req.params.taskId),
    }).then(result => {
        session.close();
        return result;
    })
}

export function deleteProject(organizationId, projectId) {
    let session = driver.session();
    return session.run('' +
        'MATCH (o:Organization) WHERE ID(o)=$organizationId\n' +
        'WITH o as organization \n' +
        'MATCH (organization)-[:CHILDREN]->(p:Project) WHERE ID(p)=$projectId\n' +
        'WITH p as project \n' +
        'MATCH (project)-[:CHILDREN*]->(t:Task)\n' +
        'DETACH DELETE t, project;', {
        organizationId: organizationId,//Number(req.params.organizationId),
        projectId: projectId//Number(req.params.projectId),
    }).then(result => {
        session.close();
        return result;
    })
}

export function deleteOrganization(organizationId) {
    let session = driver.session();
    return session.run('' +
        'MATCH (o:Organization) WHERE ID(o)=$organizationId\n' +
        'WITH o as organization \n' +
        'MATCH (organization)-[:CHILDREN*]->(p)\n' +
        'DETACH DELETE p, organization;', {
        organizationId: organizationId//Number(req.params.organizationId),
    }).then(result => {
        session.close();
        return result;
    })
}

export function deleteAllTasksForUser(userId) {
    let session = driver.session();
    return session.run('' +
        'MATCH (t: Task) WHERE t.createdBy = "623b40e9387b8a9cf2230e50"\n' +
        'WITH t as tasks\n' +
        'MATCH (tasks)-[:CHILDREN*]->(p)\n' +
        'DETACH DELETE p, tasks', {
        userId: userId,
    }).then(result => {
        session.close();
        return result;
    })
}
