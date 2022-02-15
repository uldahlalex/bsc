const PROTO_PATH = "./task.proto";

const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");

var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true
});

const TaskService = grpc.loadPackageDefinition(packageDefinition).TaskService;
const client = new TaskService(
    "localhost:30043",
    grpc.credentials.createInsecure()
);


module.exports = client;