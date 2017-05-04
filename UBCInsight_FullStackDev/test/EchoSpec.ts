/**
 * Created by rtholmes on 2016-10-31.
 */

import Server from "../src/rest/Server";
import {expect} from 'chai';
import chai = require('chai');
import chaiHttp = require('chai-http');

chai.use(chaiHttp);

import Log from "../src/Util";
import {InsightResponse, QueryRequest} from "../src/controller/IInsightFacade";
import Response = ChaiHttp.Response;

describe("EchoSpec", function () {

    let fs = require("fs");

    let server: Server;

    let URL = "http://localhost:4321";

    function sanityCheck(response: InsightResponse) {
        expect(response).to.have.property('code');
        expect(response).to.have.property('body');
        expect(response.code).to.be.a('number');
    }

    before(function (done) {
        Log.test('Before: ' + (<any>this).test.parent.title);
        server = new Server(4321);
        server.start().then(function (response) {
            console.log("Server started: " + response);
            done();
        });
    });

    beforeEach(function () {
        Log.test('BeforeTest: ' + (<any>this).currentTest.title);
    });

    after(function () {
        Log.test('After: ' + (<any>this).test.parent.title);
    });

    afterEach(function () {
        Log.test('AfterTest: ' + (<any>this).currentTest.title);
    });

    it("Should be able to echo", function () {
        let out = Server.performEcho('echo');
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(200);
        expect(out.body).to.deep.equal({message: 'echo...echo'});
    });

    it("Should be able to echo silence", function () {
        let out = Server.performEcho('');
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(200);
        expect(out.body).to.deep.equal({message: '...'});
    });

    it("Should be able to handle a missing echo message sensibly", function () {
        let out = Server.performEcho(undefined);
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(400);
        expect(out.body).to.deep.equal({error: 'Message not provided'});
    });

    it("Should be able to handle a null echo message sensibly", function () {
        let out = Server.performEcho(null);
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(400);
        expect(out.body).to.have.property('error');
        expect(out.body).to.deep.equal({error: 'Message not provided'});
    });

    it("echo", function () {
        let obj: any = {params: {msg: "test"}};
        let obj2: any = {json: function(code: any, body: any) {}};
        let fn = function () {};
        Server.echo(obj, obj2, fn);
    });




    it("PUT description", function () {
        return chai.request(URL)
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync("./rooms.zip"), "rooms.zip")
            .then(function (res: Response) {
                Log.trace('then:');
                // some assertions
                expect(res.status).to.equal(201);
            })
            .catch(function (err) {
                Log.trace('catch:');
                console.log(err);
                expect.fail();
            });
    });

    it("POST description", function () {
        let testQuery: QueryRequest = {
            "WHERE":{
                "GT":{
                    "courses_avg":97
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };
        return chai.request(URL)
            .post('/query')
            .send(testQuery)
            .then(function (res: Response) {
                Log.trace('then:');
                let expectedResult = { render: 'TABLE',
                    result:
                        [ { courses_dept: 'epse', courses_avg: 97.09 },
                            { courses_dept: 'math', courses_avg: 97.09 },
                            { courses_dept: 'math', courses_avg: 97.09 },
                            { courses_dept: 'epse', courses_avg: 97.09 },
                            { courses_dept: 'math', courses_avg: 97.25 },
                            { courses_dept: 'math', courses_avg: 97.25 },
                            { courses_dept: 'epse', courses_avg: 97.29 },
                            { courses_dept: 'epse', courses_avg: 97.29 },
                            { courses_dept: 'nurs', courses_avg: 97.33 },
                            { courses_dept: 'nurs', courses_avg: 97.33 },
                            { courses_dept: 'epse', courses_avg: 97.41 },
                            { courses_dept: 'epse', courses_avg: 97.41 },
                            { courses_dept: 'cnps', courses_avg: 97.47 },
                            { courses_dept: 'cnps', courses_avg: 97.47 },
                            { courses_dept: 'math', courses_avg: 97.48 },
                            { courses_dept: 'math', courses_avg: 97.48 },
                            { courses_dept: 'educ', courses_avg: 97.5 },
                            { courses_dept: 'nurs', courses_avg: 97.53 },
                            { courses_dept: 'nurs', courses_avg: 97.53 },
                            { courses_dept: 'epse', courses_avg: 97.67 },
                            { courses_dept: 'epse', courses_avg: 97.69 },
                            { courses_dept: 'epse', courses_avg: 97.78 },
                            { courses_dept: 'crwr', courses_avg: 98 },
                            { courses_dept: 'crwr', courses_avg: 98 },
                            { courses_dept: 'epse', courses_avg: 98.08 },
                            { courses_dept: 'nurs', courses_avg: 98.21 },
                            { courses_dept: 'nurs', courses_avg: 98.21 },
                            { courses_dept: 'epse', courses_avg: 98.36 },
                            { courses_dept: 'epse', courses_avg: 98.45 },
                            { courses_dept: 'epse', courses_avg: 98.45 },
                            { courses_dept: 'nurs', courses_avg: 98.5 },
                            { courses_dept: 'nurs', courses_avg: 98.5 },
                            { courses_dept: 'epse', courses_avg: 98.58 },
                            { courses_dept: 'nurs', courses_avg: 98.58 },
                            { courses_dept: 'nurs', courses_avg: 98.58 },
                            { courses_dept: 'epse', courses_avg: 98.58 },
                            { courses_dept: 'epse', courses_avg: 98.7 },
                            { courses_dept: 'nurs', courses_avg: 98.71 },
                            { courses_dept: 'nurs', courses_avg: 98.71 },
                            { courses_dept: 'eece', courses_avg: 98.75 },
                            { courses_dept: 'eece', courses_avg: 98.75 },
                            { courses_dept: 'epse', courses_avg: 98.76 },
                            { courses_dept: 'epse', courses_avg: 98.76 },
                            { courses_dept: 'epse', courses_avg: 98.8 },
                            { courses_dept: 'spph', courses_avg: 98.98 },
                            { courses_dept: 'spph', courses_avg: 98.98 },
                            { courses_dept: 'cnps', courses_avg: 99.19 },
                            { courses_dept: 'math', courses_avg: 99.78 },
                            { courses_dept: 'math', courses_avg: 99.78 } ] };
                expect(res.body).deep.eq(expectedResult);
                // some assertions
            })
            .catch(function (err) {
                Log.trace('catch:');
                // some assertions
                console.log(err);
                expect.fail();
            });
    });

});
