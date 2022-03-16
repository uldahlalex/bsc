export function joinUserDetailsAndTasks(userDetailsArray: any[], project) {
    let count = 0;
    innerTraverse(project);

    function innerTraverse(t) {
        if (t.children != undefined) {
            t.children.forEach(each => {
                each.user = userDetailsArray[count]
                count++;
                if (each.children != undefined) {
                    innerTraverse(each);
                }
            })
        }
    }

    return project;
}

export function traverseProjectForAllTaskCreatedBy(project): string[] {
    let ids = [];
    innerTraverse(project)

    function innerTraverse(t) {
        if (t.children != undefined) {
            t.children.forEach(each => {
                ids.push(each.createdBy);
                if (each.children != undefined) {
                    innerTraverse(each);
                }
            })
        }
    }

    return ids;
}


