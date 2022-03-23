const grpc = require('grpc');
const deleteSagaProto = grpc.load(__dirname+'/protos/delete-saga.proto')
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
        console.log(call.request.userId);
        //Only start sending the next SAGA step after a deletion query with returned RB data is ready
        let actions = cqlReader.getAllActionsForUser(call.request.userId).then(result => {
            return result;
        })
        cqlWriter.deleteAllActionsForUser(call.request.userId).then( (result, err) => {
            if(err) {
                callback(null, false)
            }
        })

        await grpcClient.deleteSaga(call.request.userId).then(async result => {
            if (result.isDeleted == true) {
                callback(null, true);
            } else {
                cqlWriter.rollBack(actions);
                callback(null, false)
            }

        })
    }
})