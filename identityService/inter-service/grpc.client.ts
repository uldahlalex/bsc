const grpc = require('grpc')
const PROTO_PATH = __dirname + '/protos/delete-saga.proto'
const deleteSagaProto = grpc.load(PROTO_PATH).DeleteSaga
const deleteSagaProtoInstance = new deleteSagaProto('localhost:50053', grpc.credentials.createInsecure());

export async function notifyActivity(id): Promise<boolean> {
    return deleteSagaProtoInstance.notifyActivityService(
        {
            userId: id
        }, (grpcError, grpcResult) => {
            console.log(grpcResult)
            return grpcResult;
        });
}