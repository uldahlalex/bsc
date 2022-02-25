const request = require("supertest");
const app = "http://localhost:3002";
const expect = require("chai").expect;

describe("GET /openEndpoint", function () {
    it("Returns 200 if connection to unauthorized endpoint is successful", async function () {
        const response = await request(app)
            .get("/openEndpoint");
        expect(response.status).to.eql(200);

    });
});

describe("POST /login", function (done) {
    it("Returns 201 if successfully logged in", async function () {
        const response = await request(app)
            .post("/login")
            .send({email: 'alex@uldahl.dk', password: "1234"})
        expect(response.status).to.eql(201).then(done)
    });
});
/*
describe("POST /register", function () {
    it("Returns 201 if created new user", async function () {
        const response = await request(app)
            .post("/register")
            .send({email: 'bob@uldahl.dk', password: "1234"})
        expect(response.status).to.eql(201);
    });
});
*/