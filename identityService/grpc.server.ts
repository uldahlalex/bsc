const grpc = require('grpc');

export var server = new grpc.Server()

export function initGrpcServer() {
    server.bind('127.0.0.1:50051', grpc.ServerCredentials.createInsecure())
    console.log('Server running at http://127.0.0.1:50051')
    server.start()
}