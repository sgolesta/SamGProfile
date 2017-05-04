/**
 * Created by sawmawngolestani on 2017-01-26.
 */

import {expect} from 'chai';
import {InsightResponse, QueryRequest} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";
import {IResponse, DataSetHandler, Room} from "../src/controller/DataSetHandler";

describe("InsightFacadeSpec", function () {
    "use strict";
    let fs = require("fs");
    let iFacade: InsightFacade = null;
    let file: any = null;
    let id: string = "courses";
    let zip: string = 'courses.zip';
    let dataSetH: DataSetHandler = new DataSetHandler();

    beforeEach(function () {
        iFacade = new InsightFacade();
        readZippedFile();
        if (fs.existsSync(id+".json")) {
            fs.unlinkSync(id+".json");
        }
    });

    afterEach(function () {
        iFacade = null;
        file = null;
    });

    function readZippedFile() {
        //let options = {base64: true};

        try {
            file = fs.readFileSync(zip, 'base64');
        } catch (err) {
            //console.log(err);
        }
    }

    // create a simple zipped file with one or two courses and then read it from disk and use it for testing
    // create base64 representation of zipped file to pass on to test case

    it("Test Unzip File", function () {
        //console.log("Starting Test Unzip File");
        return dataSetH.unzipFile(id, file).then(function (unzipped) {
            //Log.test('Value: ' + JSON.stringify(unzipped));
            expect(unzipped).to.equal(unzipped);
        }).catch(function (err) {
            //console.log(JSON.stringify(err));
            expect.fail();
        })
    });

    it("Test Parse File", function () {
        return new Promise(function (fulfill, reject) {
            dataSetH.unzipFile(id, file).then(function (unzipped) {
                let jsonObject;
                try {
                    //console.log("about to parseData");
                    jsonObject = dataSetH.parseData(unzipped);
                    //console.log("came back from parsing");
                    fulfill(jsonObject);
                    //console.log("test promise fulfilled");
                } catch (err) {
                    //console.log("rejected");
                    expect.fail();
                    reject(err);
                }
            })
        }).catch(function (err) {
            //console.log(err);
            expect.fail();
        })
    });

    it('Test addDataSet', function () {
        let iResponse: InsightResponse = new IResponse();
        return iFacade.addDataset(id, file).then(function (responseId) {
            iResponse.code = 204;
            expect(responseId).instanceof(IResponse);
            expect(responseId).deep.eq(iResponse);
        });
    });

    it('Test addDataSet different format', function () {
        let iResponse: InsightResponse = new IResponse();
        let testFile = fs.readFileSync("test_courses.zip", 'base64');
        return iFacade.addDataset(id, testFile).then(function (responseId) {
            iResponse.code = 204;
            expect(responseId).instanceof(IResponse);
            expect(responseId).deep.eq(iResponse);
        });
    });

    it('Test addDataSet on zip with no data', function () {
        let iResponse: InsightResponse = new IResponse();
        let testFile = fs.readFileSync("no_data.zip", 'base64');
        return iFacade.addDataset(id, testFile).then(function (responseId) {
            expect.fail();
        })
            .catch(function (err: InsightResponse) {
                //console.log(JSON.stringify(err));
                expect(err.code).to.equal(400);
            });
    });

    it('Test addDataSet on non zip file', function () {
        let iResponse: InsightResponse = new IResponse();
        let testFile = fs.readFileSync("image.png", 'base64');
        return iFacade.addDataset(id, testFile).then(function (responseId) {
            expect.fail();
        })
            .catch(function (err: InsightResponse) {
                expect(err.code).to.equal(400);
            });
    });

    it('Test addDataSet on empty string', function () {
        let iResponse: InsightResponse = new IResponse();
        return iFacade.addDataset(id, "").then(function (responseId) {
            expect.fail();
        })
            .catch(function (err: InsightResponse) {
                expect(err.code).to.equal(400);
            });
    });

    it('Test addDataSet on zip with mixed data', function () {
        let iResponse: InsightResponse = new IResponse();
        let testFile = fs.readFileSync("mixed_data.zip", 'base64');
        return new Promise(function (fulfill, reject) {
            return iFacade.addDataset(id, testFile).then(function (responseId) {
                iResponse.code = 204;
                expect(responseId).instanceof(IResponse);
                expect(responseId).deep.eq(iResponse);

                let testQuery: QueryRequest = {
                    "WHERE":{
                        "GT":{
                            "courses_avg":0
                        }
                    },
                    "OPTIONS":{
                        "COLUMNS":[
                            "courses_dept",
                            "courses_avg"
                        ],
                        "FORM":"TABLE"
                    }
                };
                return iFacade.performQuery(testQuery)
                    .then(function (result) {
                        let resultBody = result.body as {result: any[]};
                        //console.log("checking result length: " + resultBody["result"].length);
                        //console.log(JSON.stringify(resultBody["result"]));
                        expect(resultBody["result"].length).to.equal(3);
                        fulfill(result);
                    });
            })
                .catch(function (err: InsightResponse) {
                    expect.fail();
                    reject(err);
                });
        });

    });

    it("Test removeDataSet", function () {
        let iResponse: InsightResponse = new IResponse();
        return iFacade.addDataset(id, file).then(function (responseId) {
            iResponse.code = 204;
            expect(responseId).instanceof(IResponse);
            expect(responseId).deep.eq(iResponse);
            return iFacade.removeDataset(id).then(function (responseId) {
                iResponse.code = 204;
                iResponse.body = {success: 'The file was successfully removed'};
                expect(responseId).deep.eq(iResponse);
                expect(responseId.body).deep.eq(iResponse.body);
            });
        });
    });


    it("Test removeDataSet when no file exists", function () {
        let iResponse: InsightResponse = new IResponse();
        return iFacade.addDataset(id, file).then(function (responseId) {
            iResponse.code = 204;
            expect(responseId).instanceof(IResponse);
            expect(responseId).deep.eq(iResponse);
            return iFacade.removeDataset(id).then(function (responseId1) {
                iResponse.code = 204;
                iResponse.body = {success: 'The file was successfully removed'};
                expect(responseId1).deep.eq(iResponse);
                expect(responseId1.body).deep.eq(iResponse.body);
                return iFacade.removeDataset(id).then(function (responseId2) {
                    expect.fail();
                }).catch(function (err) {
                    iResponse.code = 404;
                    iResponse.body = {error: 'The resource did not exist'};
                    expect(err).deep.eq(iResponse);
                })
            });
        });
    });


    it("Open rooms zip", function () {
        let roomsZip = fs.readFileSync("rooms.zip", 'base64');
        return dataSetH.unzipFile("rooms", roomsZip).then(function (unzipped) {
            console.log("UNZIP FILE");
        }).catch(function (err) {
            console.log(JSON.stringify(err));
            expect.fail();
        })
    });

    it("add Lat and Lon", function () {
        let room: Room = new Room;
        room.address = "1874 East Mall";
        return dataSetH.addLatLongToBuilding(room).then(function (returnedRoom) {
            //console.log("returned room: " + returnedRoom);
            let elat: number = 49.26862;
            let elon: number = -123.25237;
            expect(returnedRoom.lat).to.deep.eq(elat);
            expect(returnedRoom.lon).to.deep.eq(elon);
        }).catch(function (err) {
            //console.log('error returned: ' + err);
            expect.fail(err);
        });
    });

});