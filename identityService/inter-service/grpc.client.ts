const grpc = require('grpc')
const PROTO_PATH = __dirname + '/protos/delete-saga.proto'
const deleteSagaProto = grpc.load(PROTO_PATH).DeleteSaga
const deleteSagaProtoInstance = new deleteSagaProto('localhost:50053', grpc.credentials.createInsecure());

export function notifyActivity(id): Promise<any>{
    return new Promise( (resolve) => {
        return deleteSagaProtoInstance.notifyActivityService(
            {
                userId: id
            }, async (grpcError, grpcResult) => {
                let dto = await grpcResult;
                console.log(dto);
                resolve(grpcResult);
            })
    })
}