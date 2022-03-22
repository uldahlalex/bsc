import * as mongooseRead from '../infrastructure/infrastructure.reads';

const grpc = require('grpc');
const taskIdentityJoinProto = grpc.load(__dirname+'/protos/task-identity.proto')

export var server = new grpc.Server()

export function initGrpcServer() {
    server.bind('127.0.0.1:50051', grpc.ServerCredentials.createInsecure())
    console.log('Server running at http://127.0.0.1:50051')
    server.start()
}

server.addService(taskIdentityJoinProto.TaskIdentityJoin.service, {
    addUserDataToTaskListForProject: async (call, callback) => {
        mongooseRead.getUserInfosFromListOfIds(call.request.userList).then(res => {
            callback(null, res);
        })
    }
})

