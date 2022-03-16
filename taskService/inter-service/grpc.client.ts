import * as utils from '../utils/utils';
const grpc = require('grpc')
const PROTO_PATH = __dirname + '/protos/task-identity.proto'
const taskIdentityJoinProto = grpc.load(PROTO_PATH).TaskIdentityJoin
const taskIdentityJoinProtoInstance = new taskIdentityJoinProto('localhost:50051', grpc.credentials.createInsecure());

export function addUserDataToTaskListForProject(project, res) {
    let ids: string[] = utils.traverseProjectForAllTaskCreatedBy(project);
    return taskIdentityJoinProtoInstance.addUserDataToTaskListForProject(
        {
            userList: ids
        }, (grpcError, grpcResult) => {
                res.send(utils.joinUserDetailsAndTasks(grpcResult.users, project).children);
        });
}