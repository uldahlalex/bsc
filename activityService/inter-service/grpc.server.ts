const grpc = require('grpc');
const deleteSagaProto = grpc.load(__dirname+'/protos/delete-saga.proto')
import * as grpcClient from './grpc.client';

export var server = new grpc.Server()

export function initGrpcServer() {
    server.bind('127.0.0.1:50053', grpc.ServerCredentials.createInsecure())
    console.log('Server running at http://127.0.0.1:50053')
    server.start()
}



server.addService(deleteSagaProto.DeleteSaga.service, {
    notifyActivityService: async (call, callback) => {
        console.log(call.request.userId);
        grpcClient.notifyActivity("abc").then(result => {
            callback(null, result);
        })
    }
})