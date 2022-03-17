const grpc = require('grpc')
const PROTO_PATH = __dirname + '/protos/delete-saga.proto'
const deleteSagaProto = grpc.load(PROTO_PATH).DeleteSaga
const deleteSagaProtoInstance = new deleteSagaProto('localhost:50052', grpc.credentials.createInsecure());

export function notifyActivity(id) {
    return deleteSagaProtoInstance.notifyActivityService(
        {
            UserIdMessage: id
        }, (grpcError, grpcResult) => {
          return grpcResult;
        });
}