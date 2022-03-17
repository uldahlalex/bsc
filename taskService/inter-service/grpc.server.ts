const grpc = require('grpc');
const deleteSagaProto = grpc.load(__dirname+'/protos/delete-saga.proto')

export var server = new grpc.Server()

export function initGrpcServer() {
    server.bind('127.0.0.1:50052', grpc.ServerCredentials.createInsecure())
    console.log('Server running at http://127.0.0.1:50052')
    server.start()
}

server.addService(deleteSagaProto.DeleteSaga.service, {
    notifyActivityService: async (call, callback) => {
            callback(null, true);
    }
})

