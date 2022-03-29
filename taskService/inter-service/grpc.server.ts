const grpc = require('grpc');
const deleteSagaProto = grpc.load(__dirname+'/protos/delete-saga.proto')
import * as mongoWriter from '../infrastructure/infrastructure.writes';

export var server = new grpc.Server()

export function initGrpcServer() {
    server.bind('127.0.0.1:50052', grpc.ServerCredentials.createInsecure())
    console.log('Server running at http://127.0.0.1:50052')
    server.start()
}

server.addService(deleteSagaProto.DeleteSaga.service, {
    deleteSagaService: async (call, callback) => {
        let deletion = mongoWriter.deleteAllTasksForUser(call.request.userId);
        if(deletion) {
            callback(null, true)
        } else {
            callback(null, false)
        }
    }
})

