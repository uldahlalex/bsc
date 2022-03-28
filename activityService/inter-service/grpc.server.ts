const grpc = require('grpc');
const deleteSagaProto = grpc.load(__dirname + '/protos/delete-saga.proto')
import * as grpcClient from './grpc.client';
import * as cqlWriter from '../infrastructure/infrastructure.writes';
import * as cqlReader from '../infrastructure/infrastructure.reads';

export var server = new grpc.Server()

export function initGrpcServer() {
    server.bind('127.0.0.1:50053', grpc.ServerCredentials.createInsecure())
    console.log('Server running at http://127.0.0.1:50053')
    server.start()
}

server.addService(deleteSagaProto.DeleteSaga.service, {
    deleteSagaService: async (call, callback) => {
        let rollbackValue = await cqlReader.getAllActionsForUser(call.request.userId).then(result => {
            return result.rows;
        })
        let callbackValue;
        let deletion = cqlWriter.deleteAllActionsForUser(call.request.userId);
        if(deletion==false) {
            callbackValue = false;
        } else {
            await grpcClient.deleteSaga(call.request.userId).then(result => {
                if (result.isDeleted == false) {
                    cqlWriter.rollBack(rollbackValue);
                    callbackValue = false;
                } else {
                    callbackValue = true;
                }
        })
        callback(null, callbackValue);
    }
}})

