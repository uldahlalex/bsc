const grpc = require('grpc')
const PROTO_PATH = './protos/task.proto'
const TaskService = grpc.load(PROTO_PATH).TaskService
const grpcClient = new TaskService('localhost:50051', grpc.credentials.createInsecure());

export function addUserDataToTaskListForProject(args) {
    grpcClient.addUserDataToTaskListForProject(args, (grpcError, grpcResult) => {
        if (!grpcError) {
            
        } else {

        }
    });
}