import {expect} from 'chai';
import InsightFacade from "../src/controller/InsightFacade";
import {WhereClause, QueryRequest, InsightResponse} from "../src/controller/IInsightFacade";
import {QueryHandler} from "../src/controller/QueryHandler";

let fs = require("fs");

describe("QueryTest", function () {

    const inFac = new InsightFacade();
    const querySetH = new QueryHandler();

    before(function (done) {
        let testCourse = {
            dept: "TEST",
            id: "",
            avg: 50,
            instructor: "Reed",
            title: "Testing",
            pass: 78,
            fail: 45,
            size: 123,
            audit: 3,
            uuid: "uuid",
            year: 2008
        };
        inFac.data["test"] = [testCourse];


        let file = fs.readFileSync("courses.zip", 'base64');
        inFac.addDataset("courses", file).then(function (responseId) {
            let file = fs.readFileSync("rooms.zip", 'base64');
            done();
            //return inFac.addDataset("rooms", file);
        })
        .catch(function (err) {
            ////console.log(err);
        });
    });

    it("test where mcomparators", function () {
        let testCourse = {
            dept: "TEST",
            id: "",
            avg: 50,
            instructor: "Reed",
            title: "Testing",
            pass: 78,
            fail: 45,
            size: 123,
            audit: 3,
            uuid: "uuid",
            year: 2008
        };

        let testWhere: WhereClause = {
            "GT": {
                "test_avg": 5
            }
        };
        expect(querySetH.fulfillsWhere(testCourse, testWhere)).to.equal(true);
        
        testWhere = {
            "GT": {
                "test_avg": 75
            }
        };
        expect(querySetH.fulfillsWhere(testCourse, testWhere)).to.equal(false);
        
        testWhere = {
            "GT": {
                "test_avg": 50
            }
        };
        expect(querySetH.fulfillsWhere(testCourse, testWhere)).to.equal(false);


        
        testWhere = {
            "LT": {
                "test_avg": 5
            }
        };
        expect(querySetH.fulfillsWhere(testCourse, testWhere)).to.equal(false);

        testWhere = {
            "LT": {
                "test_avg": 75
            }
        };
        expect(querySetH.fulfillsWhere(testCourse, testWhere)).to.equal(true);

        testWhere = {
            "LT": {
                "test_avg": 50
            }
        };
        expect(querySetH.fulfillsWhere(testCourse, testWhere)).to.equal(false);



        testWhere = {
            "EQ": {
                "test_avg": 75
            }
        };
        expect(querySetH.fulfillsWhere(testCourse, testWhere)).to.equal(false);

        testWhere = {
            "EQ": {
                "test_avg": 50
            }
        };
        expect(querySetH.fulfillsWhere(testCourse, testWhere)).to.equal(true);

    });

    it("test where SCOMPARISON", function () {
        let testCourse = {
            dept: "TEST",
            id: "",
            avg: 50,
            instructor: "Reed",
            title: "Testing",
            pass: 78,
            fail: 45,
            size: 123,
            audit: 3,
            uuid: "uuid",
            year: 2008
        };

        let testWhere: WhereClause = {
            "IS": {
                "test_dept": "TEST"
            }
        };
        expect(querySetH.fulfillsWhere(testCourse, testWhere)).to.equal(true);

        testWhere = {
            "IS": {
                "test_dept": "CPSC"
            }
        };
        expect(querySetH.fulfillsWhere(testCourse, testWhere)).to.equal(false);

        testWhere = {
            "IS": {
                "test_instructor": "Reed"
            }
        };
        expect(querySetH.fulfillsWhere(testCourse, testWhere)).to.equal(true);

        testWhere = {
            "IS": {
                "test_instructor": "*ed"
            }
        };
        expect(querySetH.fulfillsWhere(testCourse, testWhere)).to.equal(true);

        testWhere = {
            "IS": {
                "test_instructor": "*Re"
            }
        };
        expect(querySetH.fulfillsWhere(testCourse, testWhere)).to.equal(false);

        testWhere = {
            "IS": {
                "test_instructor": "Re*"
            }
        };
        expect(querySetH.fulfillsWhere(testCourse, testWhere)).to.equal(true);

        testWhere = {
            "IS": {
                "test_instructor": "ed*"
            }
        };
        expect(querySetH.fulfillsWhere(testCourse, testWhere)).to.equal(false);
    });

    it("test where NOT", function () {
        let testCourse = {
            dept: "TEST",
            id: "",
            avg: 50,
            instructor: "Reed",
            title: "Testing",
            pass: 78,
            fail: 45,
            size: 123,
            audit: 3,
            uuid: "uuid",
            year: 2008
        };

        let testWhere: WhereClause = {
            "NOT": {
                "IS": {
                    "test_dept": "TEST"
                }
            }
        };
        expect(querySetH.fulfillsWhere(testCourse, testWhere)).to.equal(false);

        testWhere = {
            "NOT": {
                "IS": {
                    "test_dept": "CPSC"
                }
            }
        };
        expect(querySetH.fulfillsWhere(testCourse, testWhere)).to.equal(true);

        testWhere = {
            "NOT": {
                "GT": {
                    "test_avg": 75
                }
            }
        };
        expect(querySetH.fulfillsWhere(testCourse, testWhere)).to.equal(true);
    });

    it("test where logic", function () {
        let testCourse = {
            dept: "TEST",
            id: "",
            avg: 50,
            instructor: "Reed",
            title: "Testing",
            pass: 78,
            fail: 45,
            size: 123,
            audit: 3,
            uuid: "uuid",
            year: 2008
        };

        let testWhere: WhereClause = {
            "OR": [
                {
                    "IS": {
                        "test_dept": "TEST"
                    }
                },
                {
                    "GT": {
                        "test_avg": 75
                    }
                }
            ]
        };
        expect(querySetH.fulfillsWhere(testCourse, testWhere)).to.equal(true);

        testWhere = {
            "OR": [
                {
                    "IS": {
                        "test_dept": "CPSC"
                    }
                },
                {
                    "GT": {
                        "test_avg": 75
                    }
                }
            ]
        };
        expect(querySetH.fulfillsWhere(testCourse, testWhere)).to.equal(false);

        testWhere = {
            "AND": [
                {
                    "IS": {
                        "test_dept": "TEST"
                    }
                },
                {
                    "GT": {
                        "test_avg": 75
                    }
                }
            ]
        };
        expect(querySetH.fulfillsWhere(testCourse, testWhere)).to.equal(false);

        testWhere = {
            "AND": [
                {
                    "IS": {
                        "test_dept": "TEST"
                    }
                },
                {
                    "GT": {
                        "test_avg": 30
                    }
                }
            ]
        };
        expect(querySetH.fulfillsWhere(testCourse, testWhere)).to.equal(true);

        testWhere = {
            "AND": [
                {
                    "IS": {
                        "test_dept": "TEST"
                    }
                },
                {
                    "GT": {
                        "test_avg": 30
                    }
                },
                {
                    "LT": {
                        "test_avg": 55
                    }
                }
            ]
        };
        expect(querySetH.fulfillsWhere(testCourse, testWhere)).to.equal(true);
    });





    it("validate query", function () {
        let query: any = {};
        expect(querySetH.validateQuery(query).error.code).to.equal(400);

        query = {WHERE: {}};
        expect(querySetH.validateQuery(query).error.code).to.equal(400);

        query = {WHERE: {}, OPTIONS:{}};
        expect(querySetH.validateQuery(query).error.code).to.equal(400);

        query = {WHERE: {}, OPTIONS:{COLUMNS:[], FORM:""}};
        expect(querySetH.validateQuery(query).error.code).to.equal(400);

        // FORM isn't TABLE
        query = {
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
                "FORM":"TABLE1"
            }
        };
        expect(querySetH.validateQuery(query).error.code).to.equal(400);

        // ORDER isn't in COLUMNS
        query = {
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
                "ORDER":"courses_id",
                "FORM":"TABLE"
            }
        };
        expect(querySetH.validateQuery(query).error.code).to.equal(400);
    });

    it("MCOMPARATOR expects a number key", function () {
        let query = {
            "WHERE":{
                "GT":{
                    "courses_id":97
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
        expect(querySetH.validateQuery(query).error.code).to.equal(400);
    });

    it("MCOMPARATOR expects a number", function () {
        let query = {
            "WHERE":{
                "GT":{
                    "courses_avg":"97"
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
        expect(querySetH.validateQuery(query).error.code).to.equal(400);
    });

    it("Invalid filter name", function () {
        let query = {
            "WHERE":{
                "GT1":{
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
        expect(querySetH.validateQuery(query).error.code).to.equal(400);
    });

    it("Valid query", function () {
        let query = {
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
        let val = querySetH.validateQuery(query);
        expect(val.error.code).to.equal(200);
    });

    it("Two filters in where clause", function () {
        let query = {
            "WHERE":{
                "GT":{
                    "courses_avg":97
                },
                "IS":{
                    "courses_id":"test"
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
        expect(querySetH.validateQuery(query).error.code).to.equal(400);
    });

    it("Two keys in filter", function () {
        let query = {
            "WHERE":{
                "GT":{
                    "courses_avg":97,
                    "courses_pass":97
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
        expect(querySetH.validateQuery(query).error.code).to.equal(400);
    });

    it("Empty filter", function () {
        let query = {
            "WHERE":{
                "GT":{}
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
        expect(querySetH.validateQuery(query).error.code).to.equal(400);
    });

    it("Empty where", function () {
        let query = {
            "WHERE":{},
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };
        let val = querySetH.validateQuery(query);
        ////console.log(val.error.body);
        expect(val.error.code).to.equal(200);
    });

    it("No columns", function () {
        let query: any = {
            "WHERE":{
                "GT":{
                    "courses_avg":97
                }
            },
            "OPTIONS":{
                "FORM":"TABLE"
            }
        };
        expect(querySetH.validateQuery(query).error.code).to.equal(400);
    });

    it("No options", function () {
        let query: any = {
            "WHERE":{
                "IS":{
                    "courses_dept":"cpsc"
                }
            }
        };
        expect(querySetH.validateQuery(query).error.code).to.equal(400);
    });

    it("full query no options", function () {
        let testQuery: any = {
            "WHERE":{
                "IS":{
                    "courses_dept":"cpsc"
                }
            }
        };

        return new Promise(function (resolve, reject) {
            return inFac.performQuery(testQuery)
                .then(function (result: InsightResponse) {
                    expect.fail();
                    reject(result);
                })
                .catch(function (result: InsightResponse) {
                    ////console.log(result);
                    expect(result.code).to.eq(400);
                    resolve(result);
                })

        });
    });

    it("No where", function () {
        let query: any = {
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };
        expect(querySetH.validateQuery(query).error.code).to.equal(400);
    });

    it("No form", function () {
        let query: any = {
            "WHERE":{
                "GT":{
                    "courses_avg":97
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_avg"
                ]
            }
        };
        expect(querySetH.validateQuery(query).error.code).to.equal(400);
    });

    it("Empty columns", function () {
        let query: any = {
            "WHERE":{
                "GT":{
                    "courses_avg":97
                }
            },
            "OPTIONS":{
                "COLUMNS":[],
                "FORM":"TABLE"
            }
        };
        expect(querySetH.validateQuery(query).error.code).to.equal(400);
    });

    it("can't query on multiple datasets", function () {
        let query = {
            "WHERE":{
                "GT":{
                    "courses_avg":97
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "a_dept",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };
        expect(querySetH.validateQuery(query).error.code).to.equal(400);
    });

    it("nested error in logic", function () {
        let query = {
            "WHERE":{
                "OR":[
                    {
                        "AND":[
                            {
                                "GT":{
                                    "courses_avg":90
                                }
                            },
                            {
                                "IS":{
                                    "courses_dept":"adhe"
                                }
                            }
                        ]
                    },
                    {
                        "EQ":{
                            "courses_avg":"95"
                        }
                    }
                ]
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_id",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };
        expect(querySetH.validateQuery(query).error.code).to.equal(400);
    });

    it("empty OR", function () {
        let query: {WHERE: {OR: Array<any>}; OPTIONS: {COLUMNS: (string|string|string)[]; ORDER: string; FORM: string}} = {
            "WHERE": {
                "OR": []
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "courses_avg"
                ],
                "ORDER": "courses_avg",
                "FORM": "TABLE"
            }
        };
        expect(querySetH.validateQuery(query).error.code).to.equal(400);
    });

    it("IS expects string", function () {
        let query = {
            "WHERE":{
                "IS":{
                    "courses_dept":97
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
        expect(querySetH.validateQuery(query).error.code).to.equal(400);
    });

    it("IS expects string key", function () {
        let query = {
            "WHERE":{
                "IS":{
                    "courses_avg":"97"
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
        expect(querySetH.validateQuery(query).error.code).to.equal(400);
    });

    it("invalid query", function () {
        let query:any = "this is invalid";
        expect(querySetH.validateQuery(query).error.code).to.equal(400);
    });

    it("ORDER should have one key", function () {
        let query:any = {
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
                "ORDER":["courses_avg", "courses_dept"],
                "FORM":"TABLE"
            }
        };
        expect(querySetH.validateQuery(query).error.code).to.equal(400);
    });

    it("logic without array", function () {
        let query:any = {
            "WHERE":{
                "OR":{
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
        expect(querySetH.validateQuery(query).error.code).to.equal(400);
    });




    it("test query", function () {
        let testQuery: QueryRequest = {
            "WHERE":{
                "GT":{
                    "test_avg":97
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "test_dept",
                    "test_avg"
                ],
                "ORDER":"test_avg",
                "FORM":"TABLE"
            }
        };

        return new Promise(function (resolve, reject) {
            inFac.performQuery(testQuery)
                .then(function (result) {
                    resolve(result);
                })
                .catch(function (err) {
                    reject(err);
                })

        });
    });

    it("query on courses", function () {
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

        return new Promise(function (resolve, reject) {
            return inFac.performQuery(testQuery)
                .then(function (result) {
                    ////console.log(result);
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
                    expect(result.body).deep.eq(expectedResult);
                    resolve(result);
                })
                .catch(function (err) {
                    reject(err);
                })
        });
    });

    it("complex query on courses", function () {
        let testQuery: QueryRequest = {
            "WHERE":{
                "OR":[
                    {
                        "AND":[
                            {
                                "GT":{
                                    "courses_avg":90
                                }
                            },
                            {
                                "IS":{
                                    "courses_dept":"adhe"
                                }
                            }
                        ]
                    },
                    {
                        "EQ":{
                            "courses_avg":95
                        }
                    }
                ]
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_id",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };

        return new Promise(function (resolve, reject) {
            return inFac.performQuery(testQuery)
                .then(function (result) {
                    ////console.log(result);
                    let expectedResult = { render: 'TABLE',
                        result:
                            [ { courses_dept: 'adhe', courses_id: '329', courses_avg: 90.02 },
                                { courses_dept: 'adhe', courses_id: '412', courses_avg: 90.16 },
                                { courses_dept: 'adhe', courses_id: '330', courses_avg: 90.17 },
                                { courses_dept: 'adhe', courses_id: '412', courses_avg: 90.18 },
                                { courses_dept: 'adhe', courses_id: '330', courses_avg: 90.5 },
                                { courses_dept: 'adhe', courses_id: '330', courses_avg: 90.72 },
                                { courses_dept: 'adhe', courses_id: '329', courses_avg: 90.82 },
                                { courses_dept: 'adhe', courses_id: '330', courses_avg: 90.85 },
                                { courses_dept: 'adhe', courses_id: '330', courses_avg: 91.29 },
                                { courses_dept: 'adhe', courses_id: '330', courses_avg: 91.33 },
                                { courses_dept: 'adhe', courses_id: '330', courses_avg: 91.33 },
                                { courses_dept: 'adhe', courses_id: '330', courses_avg: 91.48 },
                                { courses_dept: 'adhe', courses_id: '329', courses_avg: 92.54 },
                                { courses_dept: 'adhe', courses_id: '329', courses_avg: 93.33 },
                                { courses_dept: 'rhsc', courses_id: '501', courses_avg: 95 },
                                { courses_dept: 'bmeg', courses_id: '597', courses_avg: 95 },
                                { courses_dept: 'bmeg', courses_id: '597', courses_avg: 95 },
                                { courses_dept: 'cnps', courses_id: '535', courses_avg: 95 },
                                { courses_dept: 'cnps', courses_id: '535', courses_avg: 95 },
                                { courses_dept: 'cpsc', courses_id: '589', courses_avg: 95 },
                                { courses_dept: 'cpsc', courses_id: '589', courses_avg: 95 },
                                { courses_dept: 'crwr', courses_id: '599', courses_avg: 95 },
                                { courses_dept: 'crwr', courses_id: '599', courses_avg: 95 },
                                { courses_dept: 'crwr', courses_id: '599', courses_avg: 95 },
                                { courses_dept: 'crwr', courses_id: '599', courses_avg: 95 },
                                { courses_dept: 'crwr', courses_id: '599', courses_avg: 95 },
                                { courses_dept: 'crwr', courses_id: '599', courses_avg: 95 },
                                { courses_dept: 'crwr', courses_id: '599', courses_avg: 95 },
                                { courses_dept: 'sowk', courses_id: '570', courses_avg: 95 },
                                { courses_dept: 'econ', courses_id: '516', courses_avg: 95 },
                                { courses_dept: 'edcp', courses_id: '473', courses_avg: 95 },
                                { courses_dept: 'edcp', courses_id: '473', courses_avg: 95 },
                                { courses_dept: 'epse', courses_id: '606', courses_avg: 95 },
                                { courses_dept: 'epse', courses_id: '682', courses_avg: 95 },
                                { courses_dept: 'epse', courses_id: '682', courses_avg: 95 },
                                { courses_dept: 'kin', courses_id: '499', courses_avg: 95 },
                                { courses_dept: 'kin', courses_id: '500', courses_avg: 95 },
                                { courses_dept: 'kin', courses_id: '500', courses_avg: 95 },
                                { courses_dept: 'math', courses_id: '532', courses_avg: 95 },
                                { courses_dept: 'math', courses_id: '532', courses_avg: 95 },
                                { courses_dept: 'mtrl', courses_id: '564', courses_avg: 95 },
                                { courses_dept: 'mtrl', courses_id: '564', courses_avg: 95 },
                                { courses_dept: 'mtrl', courses_id: '599', courses_avg: 95 },
                                { courses_dept: 'musc', courses_id: '553', courses_avg: 95 },
                                { courses_dept: 'musc', courses_id: '553', courses_avg: 95 },
                                { courses_dept: 'musc', courses_id: '553', courses_avg: 95 },
                                { courses_dept: 'musc', courses_id: '553', courses_avg: 95 },
                                { courses_dept: 'musc', courses_id: '553', courses_avg: 95 },
                                { courses_dept: 'musc', courses_id: '553', courses_avg: 95 },
                                { courses_dept: 'nurs', courses_id: '424', courses_avg: 95 },
                                { courses_dept: 'nurs', courses_id: '424', courses_avg: 95 },
                                { courses_dept: 'obst', courses_id: '549', courses_avg: 95 },
                                { courses_dept: 'psyc', courses_id: '501', courses_avg: 95 },
                                { courses_dept: 'psyc', courses_id: '501', courses_avg: 95 },
                                { courses_dept: 'econ', courses_id: '516', courses_avg: 95 },
                                { courses_dept: 'adhe', courses_id: '329', courses_avg: 96.11 } ] };
                    expect(result.body).deep.eq(expectedResult);
                    resolve(result);
                })
                .catch(function (err) {
                    reject(err);
                })
        });
    });

    it("query read dataset from file", function () {
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

        return new Promise(function (resolve, reject) {
            let file = fs.readFileSync("courses.zip", 'base64');
            return inFac.addDataset("courses", file).then(function (responseId) {
                let newInFac = new InsightFacade();
                return newInFac.performQuery(testQuery)
                    .then(function (result) {
                        ////console.log(result);
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
                        expect(result.body).deep.eq(expectedResult);
                        resolve(result);
                    })
                    .catch(function (err) {
                        reject(err);
                    })
            });

        });
    });

    it("query on multiple datasets", function () {
        let testQuery: QueryRequest = {
            "WHERE":{
                "OR":[
                    {
                        "AND":[
                            {
                                "GT":{
                                    "a_avg":90
                                }
                            },
                            {
                                "IS":{
                                    "b_dept":"ache"
                                }
                            }
                        ]
                    },
                    {
                        "EQ":{
                            "c_avg":95
                        }
                    }
                ]
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_id",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };

        return new Promise(function (resolve, reject) {
            return inFac.performQuery(testQuery)
                .then(function (result) {
                    reject(result);
                })
                .catch(function (err) {
                    expect(err.body.missing).to.deep.equal(["a", "b", "c"]);
                    resolve(err);
                })

        });
    });

    it("get course year", function () {
        let testQuery: QueryRequest = {
            "WHERE":{
                "IS":{
                    "courses_uuid": "86962"
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_year"
                ],
                "FORM":"TABLE"
            }
        };

        return new Promise(function (resolve, reject) {
            return inFac.performQuery(testQuery)
                .then(function (result) {
                    //console.log(result);
                    let expectedResult = { render: 'TABLE',
                        result:
                            [ { courses_year: 2007 } ] };
                    expect(result.body).deep.eq(expectedResult);
                    resolve(result);
                })
                .catch(function (err) {
                    reject(err);
                })
        });
    });

    it("query on rooms", function () {
        let testQuery: QueryRequest = {
            "WHERE": {
                "IS": {
                    "rooms_name": "DMP_*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        };

        return new Promise(function (resolve, reject) {
            return inFac.performQuery(testQuery)
                .then(function (result) {
                    //console.log(result);
                    let expectedResult = {
                        "render": "TABLE",
                        "result": [{
                            "rooms_name": "DMP_101"
                        }, {
                            "rooms_name": "DMP_110"
                        }, {
                            "rooms_name": "DMP_201"
                        }, {
                            "rooms_name": "DMP_301"
                        }, {
                            "rooms_name": "DMP_310"
                        }]
                    };
                    expect(result.body).deep.eq(expectedResult);
                    resolve(result);
                })
                .catch(function (err) {
                    reject(err);
                });

        });
    });

    it("query on rooms with dist", function () {
        let testQuery: QueryRequest = {"WHERE":{"DIST":{"distance":100,"building":"DMP"}},"OPTIONS":{"COLUMNS":["rooms_fullname","rooms_shortname","rooms_number","rooms_name","rooms_address","rooms_lat","rooms_lon","rooms_seats","rooms_type","rooms_furniture","rooms_href"],"FORM":"TABLE"}};

        return new Promise(function (resolve, reject) {
            return inFac.performQuery(testQuery)
                .then(function (result) {
                    console.log(JSON.stringify(result));
                    //expect(result.body).deep.eq(expectedResult);
                    resolve(result);
                })
                .catch(function (err) {
                    reject(err);
                });

        });
    });

    it("another query on rooms", function () {
        let testQuery: QueryRequest = {
            "WHERE": {
                "IS": {
                    "rooms_address": "*Agrono*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_address", "rooms_name"
                ],
                "FORM": "TABLE"
            }
        };

        return new Promise(function (resolve, reject) {
            return inFac.performQuery(testQuery)
                .then(function (result) {
                    //console.log(result);
                    let body: any = result.body;
                    let expectedResult = {
                        "render": "TABLE",
                        "result": [{
                            "rooms_address": "6363 Agronomy Road",
                            "rooms_name": "ORCH_4074"
                        }, {
                            "rooms_address": "6363 Agronomy Road",
                            "rooms_name": "ORCH_4068"
                        }, {
                            "rooms_address": "6363 Agronomy Road",
                            "rooms_name": "ORCH_4058"
                        }, {
                            "rooms_address": "6363 Agronomy Road",
                            "rooms_name": "ORCH_4018"
                        }, {
                            "rooms_address": "6363 Agronomy Road",
                            "rooms_name": "ORCH_4004"
                        }, {
                            "rooms_address": "6363 Agronomy Road",
                            "rooms_name": "ORCH_3074"
                        }, {
                            "rooms_address": "6363 Agronomy Road",
                            "rooms_name": "ORCH_3068"
                        }, {
                            "rooms_address": "6363 Agronomy Road",
                            "rooms_name": "ORCH_3058"
                        }, {
                            "rooms_address": "6363 Agronomy Road",
                            "rooms_name": "ORCH_3018"
                        }, {
                            "rooms_address": "6363 Agronomy Road",
                            "rooms_name": "ORCH_3004"
                        }, {
                            "rooms_address": "6363 Agronomy Road",
                            "rooms_name": "ORCH_1001"
                        }, {
                            "rooms_address": "6363 Agronomy Road",
                            "rooms_name": "ORCH_4072"
                        }, {
                            "rooms_address": "6363 Agronomy Road",
                            "rooms_name": "ORCH_4062"
                        }, {
                            "rooms_address": "6363 Agronomy Road",
                            "rooms_name": "ORCH_4052"
                        }, {
                            "rooms_address": "6363 Agronomy Road",
                            "rooms_name": "ORCH_4016"
                        }, {
                            "rooms_address": "6363 Agronomy Road",
                            "rooms_name": "ORCH_4002"
                        }, {
                            "rooms_address": "6363 Agronomy Road",
                            "rooms_name": "ORCH_3072"
                        }, {
                            "rooms_address": "6363 Agronomy Road",
                            "rooms_name": "ORCH_3062"
                        }, {
                            "rooms_address": "6363 Agronomy Road",
                            "rooms_name": "ORCH_3052"
                        }, {
                            "rooms_address": "6363 Agronomy Road",
                            "rooms_name": "ORCH_3016"
                        }, {
                            "rooms_address": "6363 Agronomy Road",
                            "rooms_name": "ORCH_3002"
                        }, {
                            "rooms_address": "6245 Agronomy Road V6T 1Z4",
                            "rooms_name": "DMP_310"
                        }, {
                            "rooms_address": "6245 Agronomy Road V6T 1Z4",
                            "rooms_name": "DMP_201"
                        }, {
                            "rooms_address": "6245 Agronomy Road V6T 1Z4",
                            "rooms_name": "DMP_101"
                        }, {
                            "rooms_address": "6245 Agronomy Road V6T 1Z4",
                            "rooms_name": "DMP_301"
                        }, {
                            "rooms_address": "6245 Agronomy Road V6T 1Z4",
                            "rooms_name": "DMP_110"
                        }]
                    };
                    expect(body.result).to.deep.include.members(expectedResult.result);
                    resolve(result);
                })
                .catch(function (err) {
                    reject(err);
                })

        });
    });

    it("test course year with uuid", function () {
        let testQuery: QueryRequest = {
            "WHERE":{
                "AND":[
                    {
                        "EQ":{
                            "courses_year":2007
                        }
                    },
                    {
                        "IS":{
                            "courses_dept":"cpsc"
                        }
                    },
                    {
                        "IS":{
                            "courses_id":"121"
                        }
                    }
                ]
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_uuid"
                ],
                "ORDER":"courses_uuid",
                "FORM":"TABLE"
            }
        };

        return new Promise(function (resolve, reject) {
            return inFac.performQuery(testQuery)
                .then(function (result) {
                    let body: any = result.body;
                    let expectedResult = {"render":"TABLE","result":[{"courses_uuid":"90511"},{"courses_uuid":"90512"},{"courses_uuid":"90513"},{"courses_uuid":"90514"}]};
                    expect(result.body).deep.eq(expectedResult);
                    resolve(result);
                })
                .catch(function (err) {
                    reject(err);
                })
        });
    });








    it("Valid query with transformations", function () {
        let query = {
            "WHERE": {
                "NOT": {
                    "EQ": {
                        "courses_year": 1900
                    }
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "average",
                    "sections",
                    "totalFails",
                    "totalPasses"
                ],
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["courses_dept", "courses_id"],
                "APPLY": [{
                    "average": {
                        "AVG": "courses_avg"
                    }
                },
                {
                    "sections": {
                        "COUNT": "courses_uuid"
                    }
                },
                {
                    "totalFails": {
                        "SUM": "courses_fail"
                    }
                },
                {
                    "totalPasses": {
                        "SUM": "courses_pass"
                    }
                }]
            }
        };
        let val = querySetH.validateQuery(query);
        //console.log(val.error.body);
        expect(val.error.code).to.equal(200);
    });

    it("missing group in transformations", function () {
        let query: any = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats"
                ],
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "APPLY": [{
                    "maxSeats": {
                        "MAX": "rooms_seats"
                    }
                }]
            }
        };
        let val = querySetH.validateQuery(query);
        expect(val.error.code).to.equal(400);
    });

    it("missing apply in transformations", function () {
        let query: any = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats"
                ],
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"]
            }
        };
        let val = querySetH.validateQuery(query);
        expect(val.error.code).to.equal(400);
    });

    it("group can't be empty", function () {
        let query: any = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats"
                ],
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": [],
                "APPLY": [{
                    "maxSeats": {
                        "MAX": "rooms_seats"
                    }
                }]
            }
        };
        let val = querySetH.validateQuery(query);
        expect(val.error.code).to.equal(400);
    });

    it("apply name can't have underscores", function () {
        let query: any = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats"
                ],
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "max_Seats": {
                        "MAX": "rooms_seats"
                    }
                }]
            }
        };
        let val = querySetH.validateQuery(query);
        expect(val.error.code).to.equal(400);
    });

    it("columns must be in group", function () {
        let query: any = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_seats",
                    "maxSeats"
                ],
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "maxSeats": {
                        "MAX": "rooms_seats"
                    }
                }]
            }
        };
        let val = querySetH.validateQuery(query);
        expect(val.error.code).to.equal(400);
    });

    it("columns must be in apply", function () {
        let query: any = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "minSeats"
                ],
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "maxSeats": {
                        "MAX": "rooms_seats"
                    }
                }]
            }
        };
        let val = querySetH.validateQuery(query);
        expect(val.error.code).to.equal(400);
    });

    it("MAX/MIN/AVG/SUM should be on numeric value", function () {
        let query = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats"
                ],
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "maxSeats": {
                        "MAX": "rooms_shortname"
                    }
                }]
            }
        };
        let val = querySetH.validateQuery(query);
        expect(val.error.code).to.equal(400);
    });

    it("Order columns should be in COLUMNS", function () {
        let query = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["rooms_shortname", "maxSeats", "rooms_name"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "maxSeats": {
                        "MAX": "rooms_seats"
                    }
                }]
            }
        };
        let val = querySetH.validateQuery(query);
        //console.log(val.error.body);
        expect(val.error.code).to.equal(400);
    });

    it("GROUP key invalid", function () {
        let query = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats"
                ],
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname", "invalid"],
                "APPLY": [{
                    "maxSeats": {
                        "MAX": "rooms_seats"
                    }
                }]
            }
        };
        let val = querySetH.validateQuery(query);
        //console.log(val.error.body);
        expect(val.error.code).to.equal(400);
    });

    it("APPLY key invalid", function () {
        let query = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats"
                ],
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "maxSeats": {
                        "MAX": "rooms_seats"
                    },
                    "invalid": {
                        "MAX": "rooms_seats"
                    }
                }]
            }
        };
        let val = querySetH.validateQuery(query);
        //console.log(val.error.body);
        expect(val.error.code).to.equal(400);
    });

    it("APPLY too many tokens", function () {
        let query = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats"
                ],
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "maxSeats": {
                        "MAX": "rooms_seats",
                        "MIN": "rooms_seats"
                    }
                }]
            }
        };
        let val = querySetH.validateQuery(query);
        //console.log(val.error.body);
        expect(val.error.code).to.equal(400);
    });






    it("Sort on multiple keys", function () {
        let testQuery: any = {
            "WHERE":{
                "GT":{
                    "courses_avg":98
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_pass"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["courses_pass", "courses_dept"]
                },
                "FORM":"TABLE"
            }
        };

        return new Promise(function (resolve, reject) {
            return inFac.performQuery(testQuery)
                .then(function (result) {
                    //console.log(result);
                    let expectedResult = {
                            "render": "TABLE",
                            "result": [{
                                "courses_dept": "spph",
                                "courses_pass": 82
                            }, {
                                "courses_dept": "spph",
                                "courses_pass": 82
                            }, {
                                "courses_dept": "epse",
                                "courses_pass": 25
                            }, {
                                "courses_dept": "epse",
                                "courses_pass": 24
                            }, {
                                "courses_dept": "epse",
                                "courses_pass": 24
                            }, {
                                "courses_dept": "epse",
                                "courses_pass": 22
                            }, {
                                "courses_dept": "epse",
                                "courses_pass": 17
                            }, {
                                "courses_dept": "epse",
                                "courses_pass": 17
                            }, {
                                "courses_dept": "nurs",
                                "courses_pass": 16
                            }, {
                                "courses_dept": "nurs",
                                "courses_pass": 16
                            }, {
                                "courses_dept": "cnps",
                                "courses_pass": 16
                            }, {
                                "courses_dept": "nurs",
                                "courses_pass": 14
                            }, {
                                "courses_dept": "nurs",
                                "courses_pass": 14
                            }, {
                                "courses_dept": "nurs",
                                "courses_pass": 14
                            }, {
                                "courses_dept": "nurs",
                                "courses_pass": 14
                            }, {
                                "courses_dept": "nurs",
                                "courses_pass": 12
                            }, {
                                "courses_dept": "nurs",
                                "courses_pass": 12
                            }, {
                                "courses_dept": "epse",
                                "courses_pass": 12
                            }, {
                                "courses_dept": "eece",
                                "courses_pass": 12
                            }, {
                                "courses_dept": "eece",
                                "courses_pass": 12
                            }, {
                                "courses_dept": "epse",
                                "courses_pass": 11
                            }, {
                                "courses_dept": "epse",
                                "courses_pass": 11
                            }, {
                                "courses_dept": "epse",
                                "courses_pass": 10
                            }, {
                                "courses_dept": "math",
                                "courses_pass": 9
                            }, {
                                "courses_dept": "math",
                                "courses_pass": 9
                            }
                            ]
                        }

                        ;
                    expect(result.body).deep.eq(expectedResult);
                    resolve(result);
                })
                .catch(function (err) {
                    reject(err);
                })
        });
    });



    it("Query with MIN", function () {
        let testQuery: any = {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    "GT": {
                        "rooms_seats": 200
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "minSeats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["minSeats"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "minSeats": {
                        "MIN": "rooms_seats"
                    }
                }]
            }
        };

        return new Promise(function (resolve, reject) {
            return inFac.performQuery(testQuery)
                .then(function (result) {
                    //console.log(result);
                    let expectedResult = {
                        "render": "TABLE",
                        "result": [{
                            "rooms_shortname": "OSBO",
                            "minSeats": 442
                        }, {
                            "rooms_shortname": "HEBB",
                            "minSeats": 375
                        }, {
                            "rooms_shortname": "LSC",
                            "minSeats": 350
                        }, {
                            "rooms_shortname": "SRC",
                            "minSeats": 299
                        }, {
                            "rooms_shortname": "ANGU",
                            "minSeats": 260
                        }, {
                            "rooms_shortname": "PHRM",
                            "minSeats": 236
                        }, {
                            "rooms_shortname": "LSK",
                            "minSeats": 205
                        }
                        ]
                    };
                    expect(result.body).deep.eq(expectedResult);
                    resolve(result);
                })
                .catch(function (err) {
                    reject(err);
                })
        });
    });

    it("Query with AVG", function () {
        let testQuery: any = {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "courses_dept": "cpsc"
                    }
                }, {
                    "GT": {
                        "courses_avg": 90
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "avgGrade"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["avgGrade", "courses_id"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["courses_dept", "courses_id"],
                "APPLY": [{
                    "avgGrade": {
                        "AVG": "courses_avg"
                    }
                }]
            }
        };

        return new Promise(function (resolve, reject) {
            return inFac.performQuery(testQuery)
                .then(function (result) {
                    //console.log(result);
                    let expectedResult = {
                            "render": "TABLE",
                            "result": [{
                                "courses_dept": "cpsc",
                                "courses_id": "589",
                                "avgGrade": 95
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "503",
                                "avgGrade": 94.5
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "501",
                                "avgGrade": 92.55
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "449",
                                "avgGrade": 92.46
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "507",
                                "avgGrade": 91.8
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "490",
                                "avgGrade": 91.3
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "445",
                                "avgGrade": 91.3
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "540",
                                "avgGrade": 90.85
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "522",
                                "avgGrade": 90.7
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "527",
                                "avgGrade": 90.65
                            }
                            ]
                        };
                    expect(result.body).deep.eq(expectedResult);
                    resolve(result);
                })
                .catch(function (err) {
                    reject(err);
                })
        });
    });

    it("Query with COUNT", function () {
        let testQuery: any = {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "courses_dept": "cpsc"
                    }
                }, {
                    "GT": {
                        "courses_avg": 90
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "avgGrade"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["avgGrade", "courses_id"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["courses_dept", "courses_id"],
                "APPLY": [{
                    "avgGrade": {
                        "COUNT": "courses_avg"
                    }
                }]
            }
        };

        return new Promise(function (resolve, reject) {
            return inFac.performQuery(testQuery)
                .then(function (result) {
                    //console.log(result);
                    let expectedResult = {
                            "render": "TABLE",
                            "result": [{
                                "courses_dept": "cpsc",
                                "courses_id": "490",
                                "avgGrade": 5
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "449",
                                "avgGrade": 5
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "501",
                                "avgGrade": 4
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "540",
                                "avgGrade": 2
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "527",
                                "avgGrade": 2
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "589",
                                "avgGrade": 1
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "522",
                                "avgGrade": 1
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "507",
                                "avgGrade": 1
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "503",
                                "avgGrade": 1
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "445",
                                "avgGrade": 1
                            }
                            ]
                        };
                    expect(result.body).deep.eq(expectedResult);
                    resolve(result);
                })
                .catch(function (err) {
                    reject(err);
                })
        });
    });

    it("Query with SUM", function () {
        let testQuery: any = {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "courses_dept": "cpsc"
                    }
                }, {
                    "GT": {
                        "courses_avg": 90
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "avgGrade"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["avgGrade"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["courses_dept", "courses_id"],
                "APPLY": [{
                    "avgGrade": {
                        "SUM": "courses_pass"
                    }
                }]
            }
        };

        return new Promise(function (resolve, reject) {
            return inFac.performQuery(testQuery)
                .then(function (result) {
                    //console.log(result);
                    let expectedResult = {
                            "render": "TABLE",
                            "result": [{
                                "courses_dept": "cpsc",
                                "courses_id": "540",
                                "avgGrade": 226
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "490",
                                "avgGrade": 99
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "449",
                                "avgGrade": 64
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "501",
                                "avgGrade": 48
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "507",
                                "avgGrade": 38
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "527",
                                "avgGrade": 36
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "445",
                                "avgGrade": 32
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "522",
                                "avgGrade": 14
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "503",
                                "avgGrade": 12
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "589",
                                "avgGrade": 2
                            }
                            ]
                        };
                    expect(result.body).deep.eq(expectedResult);
                    resolve(result);
                })
                .catch(function (err) {
                    reject(err);
                })
        });
    });

    it("Query with empty where", function () {
        let testQuery: any = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_furniture"
                ],
                "ORDER": "rooms_furniture",
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_furniture"],
                "APPLY": []
            }
        };

        return new Promise(function (resolve, reject) {
            return inFac.performQuery(testQuery)
                .then(function (result) {
                    //console.log(result);
                    let expectedResult = {
                        "render": "TABLE",
                        "result": [{
                            "rooms_furniture": "Classroom-Fixed Tables/Fixed Chairs"
                        }, {
                            "rooms_furniture": "Classroom-Fixed Tables/Movable Chairs"
                        }, {
                            "rooms_furniture": "Classroom-Fixed Tables/Moveable Chairs"
                        }, {
                            "rooms_furniture": "Classroom-Fixed Tablets"
                        }, {
                            "rooms_furniture": "Classroom-Hybrid Furniture"
                        }, {
                            "rooms_furniture": "Classroom-Learn Lab"
                        }, {
                            "rooms_furniture": "Classroom-Movable Tables & Chairs"
                        }, {
                            "rooms_furniture": "Classroom-Movable Tablets"
                        }, {
                            "rooms_furniture": "Classroom-Moveable Tables & Chairs"
                        }, {
                            "rooms_furniture": "Classroom-Moveable Tablets"
                        }]
                    };
                    expect(result.body).deep.eq(expectedResult);
                    resolve(result);
                })
                .catch(function (err) {
                    reject(err);
                })

        });
    });






    it("Big query", function () {
        let testQuery: any = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept", "courses_year", "courses_id", "courses_avg", "courses_instructor", "courses_title", "minGrade"
                ],
                "ORDER": "courses_dept",
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["courses_dept", "courses_year", "courses_id", "courses_avg", "courses_instructor", "courses_title"],
                "APPLY": [{
                    "minGrade": {
                        "MIN": "courses_avg"
                    }
                }]
            }
        };

        return new Promise(function (resolve, reject) {
            return inFac.performQuery(testQuery)
                .then(function (result) {
                    resolve(result);
                })
                .catch(function (err) {
                    reject(err);
                })
        });
    });



    it("Query with multiple applys", function () {
        let testQuery: any = {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    "GT": {
                        "rooms_seats": 300
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats",
                    "countName"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["maxSeats"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "maxSeats": {
                        "MAX": "rooms_seats"
                    }
                },
                    {
                        "countName": {
                            "COUNT": "rooms_name"
                        }
                    }]
            }
        };

        return new Promise(function (resolve, reject) {
            return inFac.performQuery(testQuery)
                .then(function (result) {
                    //console.log(result);
                    let expectedResult = {
                            "render": "TABLE",
                            "result": [{
                                "rooms_shortname": "OSBO",
                                "maxSeats": 442,
                                "countName": 1
                            }, {
                                "rooms_shortname": "HEBB",
                                "maxSeats": 375,
                                "countName": 1
                            }, {
                                "rooms_shortname": "LSC",
                                "maxSeats": 350,
                                "countName": 2
                            }
                            ]
                        };
                    expect(result.body).deep.eq(expectedResult);
                    resolve(result);
                })
                .catch(function (err) {
                    reject(err);
                })
        });
    });

    it("Sort on multiple keys 2", function () {
        let testQuery: any = {
            "WHERE": {
                "AND": [{
                    "OR": [{
                        "IS": {
                            "courses_dept": "cpsc"
                        }
                    },{
                        "IS": {
                            "courses_dept": "math"
                        }
                    }]
                }, {
                    "GT": {
                        "courses_avg": 90
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "courses_pass",
                    "courses_avg"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["courses_dept", "courses_pass",  "courses_avg", "courses_id"]
                },
                "FORM": "TABLE"
            }
        };

        return new Promise(function (resolve, reject) {
            return inFac.performQuery(testQuery)
                .then(function (result) {
                    //console.log(result);
                    let expectedResult = {
                            "render": "TABLE",
                            "result": [{
                                "courses_dept": "math",
                                "courses_id": "255",
                                "courses_pass": 50,
                                "courses_avg": 91.1
                            }, {
                                "courses_dept": "math",
                                "courses_id": "532",
                                "courses_pass": 21,
                                "courses_avg": 97.48
                            }, {
                                "courses_dept": "math",
                                "courses_id": "532",
                                "courses_pass": 21,
                                "courses_avg": 97.48
                            }, {
                                "courses_dept": "math",
                                "courses_id": "550",
                                "courses_pass": 17,
                                "courses_avg": 90.94
                            }, {
                                "courses_dept": "math",
                                "courses_id": "550",
                                "courses_pass": 17,
                                "courses_avg": 90.94
                            }, {
                                "courses_dept": "math",
                                "courses_id": "559",
                                "courses_pass": 17,
                                "courses_avg": 90.24
                            }, {
                                "courses_dept": "math",
                                "courses_id": "559",
                                "courses_pass": 17,
                                "courses_avg": 90.24
                            }, {
                                "courses_dept": "math",
                                "courses_id": "534",
                                "courses_pass": 15,
                                "courses_avg": 91.47
                            }, {
                                "courses_dept": "math",
                                "courses_id": "534",
                                "courses_pass": 15,
                                "courses_avg": 91.47
                            }, {
                                "courses_dept": "math",
                                "courses_id": "551",
                                "courses_pass": 15,
                                "courses_avg": 90.73
                            }, {
                                "courses_dept": "math",
                                "courses_id": "551",
                                "courses_pass": 15,
                                "courses_avg": 90.73
                            }, {
                                "courses_dept": "math",
                                "courses_id": "516",
                                "courses_pass": 13,
                                "courses_avg": 92.38
                            }, {
                                "courses_dept": "math",
                                "courses_id": "516",
                                "courses_pass": 13,
                                "courses_avg": 92.38
                            }, {
                                "courses_dept": "math",
                                "courses_id": "546",
                                "courses_pass": 13,
                                "courses_avg": 92.08
                            }, {
                                "courses_dept": "math",
                                "courses_id": "546",
                                "courses_pass": 13,
                                "courses_avg": 92.08
                            }, {
                                "courses_dept": "math",
                                "courses_id": "516",
                                "courses_pass": 12,
                                "courses_avg": 92.75
                            }, {
                                "courses_dept": "math",
                                "courses_id": "516",
                                "courses_pass": 12,
                                "courses_avg": 92.75
                            }, {
                                "courses_dept": "math",
                                "courses_id": "525",
                                "courses_pass": 12,
                                "courses_avg": 92
                            }, {
                                "courses_dept": "math",
                                "courses_id": "525",
                                "courses_pass": 12,
                                "courses_avg": 92
                            }, {
                                "courses_dept": "math",
                                "courses_id": "541",
                                "courses_pass": 11,
                                "courses_avg": 97.09
                            }, {
                                "courses_dept": "math",
                                "courses_id": "541",
                                "courses_pass": 11,
                                "courses_avg": 97.09
                            }, {
                                "courses_dept": "math",
                                "courses_id": "546",
                                "courses_pass": 11,
                                "courses_avg": 91.73
                            }, {
                                "courses_dept": "math",
                                "courses_id": "546",
                                "courses_pass": 11,
                                "courses_avg": 91.73
                            }, {
                                "courses_dept": "math",
                                "courses_id": "510",
                                "courses_pass": 10,
                                "courses_avg": 92.8
                            }, {
                                "courses_dept": "math",
                                "courses_id": "510",
                                "courses_pass": 10,
                                "courses_avg": 92.8
                            }, {
                                "courses_dept": "math",
                                "courses_id": "550",
                                "courses_pass": 10,
                                "courses_avg": 92.3
                            }, {
                                "courses_dept": "math",
                                "courses_id": "550",
                                "courses_pass": 10,
                                "courses_avg": 92.3
                            }, {
                                "courses_dept": "math",
                                "courses_id": "544",
                                "courses_pass": 10,
                                "courses_avg": 92.1
                            }, {
                                "courses_dept": "math",
                                "courses_id": "544",
                                "courses_pass": 10,
                                "courses_avg": 92.1
                            }, {
                                "courses_dept": "math",
                                "courses_id": "545",
                                "courses_pass": 10,
                                "courses_avg": 91.8
                            }, {
                                "courses_dept": "math",
                                "courses_id": "545",
                                "courses_pass": 10,
                                "courses_avg": 91.8
                            }, {
                                "courses_dept": "math",
                                "courses_id": "525",
                                "courses_pass": 10,
                                "courses_avg": 91.8
                            }, {
                                "courses_dept": "math",
                                "courses_id": "525",
                                "courses_pass": 10,
                                "courses_avg": 91.8
                            }, {
                                "courses_dept": "math",
                                "courses_id": "534",
                                "courses_pass": 10,
                                "courses_avg": 91.4
                            }, {
                                "courses_dept": "math",
                                "courses_id": "534",
                                "courses_pass": 10,
                                "courses_avg": 91.4
                            }, {
                                "courses_dept": "math",
                                "courses_id": "544",
                                "courses_pass": 10,
                                "courses_avg": 91.2
                            }, {
                                "courses_dept": "math",
                                "courses_id": "544",
                                "courses_pass": 10,
                                "courses_avg": 91.2
                            }, {
                                "courses_dept": "math",
                                "courses_id": "503",
                                "courses_pass": 10,
                                "courses_avg": 91.2
                            }, {
                                "courses_dept": "math",
                                "courses_id": "503",
                                "courses_pass": 10,
                                "courses_avg": 91.2
                            }, {
                                "courses_dept": "math",
                                "courses_id": "527",
                                "courses_pass": 9,
                                "courses_avg": 99.78
                            }, {
                                "courses_dept": "math",
                                "courses_id": "527",
                                "courses_pass": 9,
                                "courses_avg": 99.78
                            }, {
                                "courses_dept": "math",
                                "courses_id": "502",
                                "courses_pass": 9,
                                "courses_avg": 96.44
                            }, {
                                "courses_dept": "math",
                                "courses_id": "502",
                                "courses_pass": 9,
                                "courses_avg": 96.44
                            }, {
                                "courses_dept": "math",
                                "courses_id": "534",
                                "courses_pass": 9,
                                "courses_avg": 95.56
                            }, {
                                "courses_dept": "math",
                                "courses_id": "534",
                                "courses_pass": 9,
                                "courses_avg": 95.56
                            }, {
                                "courses_dept": "math",
                                "courses_id": "502",
                                "courses_pass": 9,
                                "courses_avg": 94.67
                            }, {
                                "courses_dept": "math",
                                "courses_id": "502",
                                "courses_pass": 9,
                                "courses_avg": 94.67
                            }, {
                                "courses_dept": "math",
                                "courses_id": "541",
                                "courses_pass": 9,
                                "courses_avg": 93.78
                            }, {
                                "courses_dept": "math",
                                "courses_id": "541",
                                "courses_pass": 9,
                                "courses_avg": 93.78
                            }, {
                                "courses_dept": "math",
                                "courses_id": "541",
                                "courses_pass": 9,
                                "courses_avg": 93.11
                            }, {
                                "courses_dept": "math",
                                "courses_id": "541",
                                "courses_pass": 9,
                                "courses_avg": 93.11
                            }, {
                                "courses_dept": "math",
                                "courses_id": "523",
                                "courses_pass": 9,
                                "courses_avg": 93.11
                            }, {
                                "courses_dept": "math",
                                "courses_id": "523",
                                "courses_pass": 9,
                                "courses_avg": 93.11
                            }, {
                                "courses_dept": "math",
                                "courses_id": "545",
                                "courses_pass": 9,
                                "courses_avg": 92.78
                            }, {
                                "courses_dept": "math",
                                "courses_id": "545",
                                "courses_pass": 9,
                                "courses_avg": 92.78
                            }, {
                                "courses_dept": "math",
                                "courses_id": "523",
                                "courses_pass": 9,
                                "courses_avg": 92.67
                            }, {
                                "courses_dept": "math",
                                "courses_id": "523",
                                "courses_pass": 9,
                                "courses_avg": 92.67
                            }, {
                                "courses_dept": "math",
                                "courses_id": "521",
                                "courses_pass": 9,
                                "courses_avg": 91.56
                            }, {
                                "courses_dept": "math",
                                "courses_id": "521",
                                "courses_pass": 9,
                                "courses_avg": 91.56
                            }, {
                                "courses_dept": "math",
                                "courses_id": "551",
                                "courses_pass": 9,
                                "courses_avg": 91
                            }, {
                                "courses_dept": "math",
                                "courses_id": "551",
                                "courses_pass": 9,
                                "courses_avg": 91
                            }, {
                                "courses_dept": "math",
                                "courses_id": "525",
                                "courses_pass": 8,
                                "courses_avg": 93.75
                            }, {
                                "courses_dept": "math",
                                "courses_id": "525",
                                "courses_pass": 8,
                                "courses_avg": 93.75
                            }, {
                                "courses_dept": "math",
                                "courses_id": "545",
                                "courses_pass": 8,
                                "courses_avg": 92.75
                            }, {
                                "courses_dept": "math",
                                "courses_id": "545",
                                "courses_pass": 8,
                                "courses_avg": 92.75
                            }, {
                                "courses_dept": "math",
                                "courses_id": "507",
                                "courses_pass": 8,
                                "courses_avg": 92.63
                            }, {
                                "courses_dept": "math",
                                "courses_id": "507",
                                "courses_pass": 8,
                                "courses_avg": 92.63
                            }, {
                                "courses_dept": "math",
                                "courses_id": "539",
                                "courses_pass": 8,
                                "courses_avg": 91.38
                            }, {
                                "courses_dept": "math",
                                "courses_id": "539",
                                "courses_pass": 8,
                                "courses_avg": 91.38
                            }, {
                                "courses_dept": "math",
                                "courses_id": "508",
                                "courses_pass": 8,
                                "courses_avg": 91.38
                            }, {
                                "courses_dept": "math",
                                "courses_id": "508",
                                "courses_pass": 8,
                                "courses_avg": 91.38
                            }, {
                                "courses_dept": "math",
                                "courses_id": "421",
                                "courses_pass": 8,
                                "courses_avg": 91.38
                            }, {
                                "courses_dept": "math",
                                "courses_id": "421",
                                "courses_pass": 8,
                                "courses_avg": 91.38
                            }, {
                                "courses_dept": "math",
                                "courses_id": "515",
                                "courses_pass": 8,
                                "courses_avg": 90.5
                            }, {
                                "courses_dept": "math",
                                "courses_id": "515",
                                "courses_pass": 8,
                                "courses_avg": 90.5
                            }, {
                                "courses_dept": "math",
                                "courses_id": "545",
                                "courses_pass": 7,
                                "courses_avg": 91.86
                            }, {
                                "courses_dept": "math",
                                "courses_id": "545",
                                "courses_pass": 7,
                                "courses_avg": 91.86
                            }, {
                                "courses_dept": "math",
                                "courses_id": "516",
                                "courses_pass": 7,
                                "courses_avg": 91.71
                            }, {
                                "courses_dept": "math",
                                "courses_id": "516",
                                "courses_pass": 7,
                                "courses_avg": 91.71
                            }, {
                                "courses_dept": "math",
                                "courses_id": "551",
                                "courses_pass": 7,
                                "courses_avg": 91.14
                            }, {
                                "courses_dept": "math",
                                "courses_id": "551",
                                "courses_pass": 7,
                                "courses_avg": 91.14
                            }, {
                                "courses_dept": "math",
                                "courses_id": "589",
                                "courses_pass": 7,
                                "courses_avg": 90.57
                            }, {
                                "courses_dept": "math",
                                "courses_id": "420",
                                "courses_pass": 7,
                                "courses_avg": 90.57
                            }, {
                                "courses_dept": "math",
                                "courses_id": "420",
                                "courses_pass": 7,
                                "courses_avg": 90.57
                            }, {
                                "courses_dept": "math",
                                "courses_id": "440",
                                "courses_pass": 7,
                                "courses_avg": 90.43
                            }, {
                                "courses_dept": "math",
                                "courses_id": "440",
                                "courses_pass": 7,
                                "courses_avg": 90.43
                            }, {
                                "courses_dept": "math",
                                "courses_id": "425",
                                "courses_pass": 7,
                                "courses_avg": 90.29
                            }, {
                                "courses_dept": "math",
                                "courses_id": "425",
                                "courses_pass": 7,
                                "courses_avg": 90.29
                            }, {
                                "courses_dept": "math",
                                "courses_id": "545",
                                "courses_pass": 6,
                                "courses_avg": 96.83
                            }, {
                                "courses_dept": "math",
                                "courses_id": "545",
                                "courses_pass": 6,
                                "courses_avg": 96.83
                            }, {
                                "courses_dept": "math",
                                "courses_id": "532",
                                "courses_pass": 6,
                                "courses_avg": 95
                            }, {
                                "courses_dept": "math",
                                "courses_id": "532",
                                "courses_pass": 6,
                                "courses_avg": 95
                            }, {
                                "courses_dept": "math",
                                "courses_id": "544",
                                "courses_pass": 6,
                                "courses_avg": 94.67
                            }, {
                                "courses_dept": "math",
                                "courses_id": "544",
                                "courses_pass": 6,
                                "courses_avg": 94.67
                            }, {
                                "courses_dept": "math",
                                "courses_id": "552",
                                "courses_pass": 6,
                                "courses_avg": 94.33
                            }, {
                                "courses_dept": "math",
                                "courses_id": "552",
                                "courses_pass": 6,
                                "courses_avg": 94.33
                            }, {
                                "courses_dept": "math",
                                "courses_id": "527",
                                "courses_pass": 6,
                                "courses_avg": 94.17
                            }, {
                                "courses_dept": "math",
                                "courses_id": "527",
                                "courses_pass": 6,
                                "courses_avg": 94.17
                            }, {
                                "courses_dept": "math",
                                "courses_id": "525",
                                "courses_pass": 6,
                                "courses_avg": 92.67
                            }, {
                                "courses_dept": "math",
                                "courses_id": "525",
                                "courses_pass": 6,
                                "courses_avg": 92.67
                            }, {
                                "courses_dept": "math",
                                "courses_id": "527",
                                "courses_pass": 6,
                                "courses_avg": 91.67
                            }, {
                                "courses_dept": "math",
                                "courses_id": "527",
                                "courses_pass": 6,
                                "courses_avg": 91.67
                            }, {
                                "courses_dept": "math",
                                "courses_id": "589",
                                "courses_pass": 6,
                                "courses_avg": 91.5
                            }, {
                                "courses_dept": "math",
                                "courses_id": "539",
                                "courses_pass": 6,
                                "courses_avg": 91.5
                            }, {
                                "courses_dept": "math",
                                "courses_id": "539",
                                "courses_pass": 6,
                                "courses_avg": 91.5
                            }, {
                                "courses_dept": "math",
                                "courses_id": "589",
                                "courses_pass": 6,
                                "courses_avg": 90.83
                            }, {
                                "courses_dept": "math",
                                "courses_id": "525",
                                "courses_pass": 6,
                                "courses_avg": 90.83
                            }, {
                                "courses_dept": "math",
                                "courses_id": "525",
                                "courses_pass": 6,
                                "courses_avg": 90.83
                            }, {
                                "courses_dept": "math",
                                "courses_id": "544",
                                "courses_pass": 6,
                                "courses_avg": 90.5
                            }, {
                                "courses_dept": "math",
                                "courses_id": "544",
                                "courses_pass": 6,
                                "courses_avg": 90.5
                            }, {
                                "courses_dept": "math",
                                "courses_id": "516",
                                "courses_pass": 5,
                                "courses_avg": 93.8
                            }, {
                                "courses_dept": "math",
                                "courses_id": "516",
                                "courses_pass": 5,
                                "courses_avg": 93.8
                            }, {
                                "courses_dept": "math",
                                "courses_id": "501",
                                "courses_pass": 5,
                                "courses_avg": 93.8
                            }, {
                                "courses_dept": "math",
                                "courses_id": "501",
                                "courses_pass": 5,
                                "courses_avg": 93.8
                            }, {
                                "courses_dept": "math",
                                "courses_id": "510",
                                "courses_pass": 5,
                                "courses_avg": 93.6
                            }, {
                                "courses_dept": "math",
                                "courses_id": "510",
                                "courses_pass": 5,
                                "courses_avg": 93.6
                            }, {
                                "courses_dept": "math",
                                "courses_id": "508",
                                "courses_pass": 5,
                                "courses_avg": 93.2
                            }, {
                                "courses_dept": "math",
                                "courses_id": "508",
                                "courses_pass": 5,
                                "courses_avg": 93.2
                            }, {
                                "courses_dept": "math",
                                "courses_id": "589",
                                "courses_pass": 5,
                                "courses_avg": 92.6
                            }, {
                                "courses_dept": "math",
                                "courses_id": "589",
                                "courses_pass": 5,
                                "courses_avg": 92.6
                            }, {
                                "courses_dept": "math",
                                "courses_id": "508",
                                "courses_pass": 5,
                                "courses_avg": 92.4
                            }, {
                                "courses_dept": "math",
                                "courses_id": "508",
                                "courses_pass": 5,
                                "courses_avg": 92.4
                            }, {
                                "courses_dept": "math",
                                "courses_id": "503",
                                "courses_pass": 5,
                                "courses_avg": 92.4
                            }, {
                                "courses_dept": "math",
                                "courses_id": "503",
                                "courses_pass": 5,
                                "courses_avg": 92.4
                            }, {
                                "courses_dept": "math",
                                "courses_id": "502",
                                "courses_pass": 5,
                                "courses_avg": 92.2
                            }, {
                                "courses_dept": "math",
                                "courses_id": "502",
                                "courses_pass": 5,
                                "courses_avg": 92.2
                            }, {
                                "courses_dept": "math",
                                "courses_id": "503",
                                "courses_pass": 5,
                                "courses_avg": 91.8
                            }, {
                                "courses_dept": "math",
                                "courses_id": "503",
                                "courses_pass": 5,
                                "courses_avg": 91.8
                            }, {
                                "courses_dept": "math",
                                "courses_id": "510",
                                "courses_pass": 5,
                                "courses_avg": 90.6
                            }, {
                                "courses_dept": "math",
                                "courses_id": "510",
                                "courses_pass": 5,
                                "courses_avg": 90.6
                            }, {
                                "courses_dept": "math",
                                "courses_id": "501",
                                "courses_pass": 5,
                                "courses_avg": 90.6
                            }, {
                                "courses_dept": "math",
                                "courses_id": "501",
                                "courses_pass": 5,
                                "courses_avg": 90.6
                            }, {
                                "courses_dept": "math",
                                "courses_id": "525",
                                "courses_pass": 4,
                                "courses_avg": 97.25
                            }, {
                                "courses_dept": "math",
                                "courses_id": "525",
                                "courses_pass": 4,
                                "courses_avg": 97.25
                            }, {
                                "courses_dept": "math",
                                "courses_id": "516",
                                "courses_pass": 4,
                                "courses_avg": 96.25
                            }, {
                                "courses_dept": "math",
                                "courses_id": "516",
                                "courses_pass": 4,
                                "courses_avg": 96.25
                            }, {
                                "courses_dept": "math",
                                "courses_id": "544",
                                "courses_pass": 4,
                                "courses_avg": 93.5
                            }, {
                                "courses_dept": "math",
                                "courses_id": "544",
                                "courses_pass": 4,
                                "courses_avg": 93.5
                            }, {
                                "courses_dept": "math",
                                "courses_id": "508",
                                "courses_pass": 4,
                                "courses_avg": 93.5
                            }, {
                                "courses_dept": "math",
                                "courses_id": "508",
                                "courses_pass": 4,
                                "courses_avg": 93.5
                            }, {
                                "courses_dept": "math",
                                "courses_id": "589",
                                "courses_pass": 4,
                                "courses_avg": 92
                            }, {
                                "courses_dept": "math",
                                "courses_id": "515",
                                "courses_pass": 4,
                                "courses_avg": 92
                            }, {
                                "courses_dept": "math",
                                "courses_id": "515",
                                "courses_pass": 4,
                                "courses_avg": 92
                            }, {
                                "courses_dept": "math",
                                "courses_id": "537",
                                "courses_pass": 4,
                                "courses_avg": 91.75
                            }, {
                                "courses_dept": "math",
                                "courses_id": "537",
                                "courses_pass": 4,
                                "courses_avg": 91.75
                            }, {
                                "courses_dept": "math",
                                "courses_id": "516",
                                "courses_pass": 4,
                                "courses_avg": 91.25
                            }, {
                                "courses_dept": "math",
                                "courses_id": "516",
                                "courses_pass": 4,
                                "courses_avg": 91.25
                            }, {
                                "courses_dept": "math",
                                "courses_id": "539",
                                "courses_pass": 4,
                                "courses_avg": 91
                            }, {
                                "courses_dept": "math",
                                "courses_id": "539",
                                "courses_pass": 4,
                                "courses_avg": 91
                            }, {
                                "courses_dept": "math",
                                "courses_id": "217",
                                "courses_pass": 4,
                                "courses_avg": 90.25
                            }, {
                                "courses_dept": "math",
                                "courses_id": "217",
                                "courses_pass": 4,
                                "courses_avg": 90.25
                            }, {
                                "courses_dept": "math",
                                "courses_id": "589",
                                "courses_pass": 3,
                                "courses_avg": 96.33
                            }, {
                                "courses_dept": "math",
                                "courses_id": "510",
                                "courses_pass": 3,
                                "courses_avg": 95.67
                            }, {
                                "courses_dept": "math",
                                "courses_id": "510",
                                "courses_pass": 3,
                                "courses_avg": 95.67
                            }, {
                                "courses_dept": "math",
                                "courses_id": "589",
                                "courses_pass": 3,
                                "courses_avg": 92.67
                            }, {
                                "courses_dept": "math",
                                "courses_id": "589",
                                "courses_pass": 3,
                                "courses_avg": 92.33
                            }, {
                                "courses_dept": "math",
                                "courses_id": "589",
                                "courses_pass": 3,
                                "courses_avg": 92.33
                            }, {
                                "courses_dept": "math",
                                "courses_id": "425",
                                "courses_pass": 3,
                                "courses_avg": 91.33
                            }, {
                                "courses_dept": "math",
                                "courses_id": "425",
                                "courses_pass": 3,
                                "courses_avg": 91.33
                            }, {
                                "courses_dept": "math",
                                "courses_id": "589",
                                "courses_pass": 2,
                                "courses_avg": 93.5
                            }, {
                                "courses_dept": "math",
                                "courses_id": "589",
                                "courses_pass": 2,
                                "courses_avg": 91.5
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "540",
                                "courses_pass": 59,
                                "courses_avg": 90.53
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "540",
                                "courses_pass": 59,
                                "courses_avg": 90.53
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "540",
                                "courses_pass": 54,
                                "courses_avg": 91.22
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "540",
                                "courses_pass": 54,
                                "courses_avg": 91.22
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "490",
                                "courses_pass": 22,
                                "courses_avg": 90.14
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "507",
                                "courses_pass": 19,
                                "courses_avg": 91.79
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "507",
                                "courses_pass": 19,
                                "courses_avg": 91.79
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "445",
                                "courses_pass": 16,
                                "courses_avg": 91.25
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "445",
                                "courses_pass": 16,
                                "courses_avg": 91.25
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "490",
                                "courses_pass": 15,
                                "courses_avg": 92.4
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "490",
                                "courses_pass": 15,
                                "courses_avg": 92.4
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "490",
                                "courses_pass": 15,
                                "courses_avg": 90.27
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "490",
                                "courses_pass": 10,
                                "courses_avg": 90.6
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "490",
                                "courses_pass": 10,
                                "courses_avg": 90.6
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "527",
                                "courses_pass": 9,
                                "courses_avg": 91.22
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "527",
                                "courses_pass": 9,
                                "courses_avg": 91.22
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "527",
                                "courses_pass": 9,
                                "courses_avg": 90.11
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "527",
                                "courses_pass": 9,
                                "courses_avg": 90.11
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "449",
                                "courses_pass": 8,
                                "courses_avg": 93.38
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "449",
                                "courses_pass": 8,
                                "courses_avg": 93.38
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "501",
                                "courses_pass": 8,
                                "courses_avg": 92.75
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "501",
                                "courses_pass": 8,
                                "courses_avg": 92.75
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "449",
                                "courses_pass": 8,
                                "courses_avg": 92.63
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "449",
                                "courses_pass": 8,
                                "courses_avg": 92.63
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "501",
                                "courses_pass": 7,
                                "courses_avg": 92.43
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "501",
                                "courses_pass": 7,
                                "courses_avg": 92.43
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "522",
                                "courses_pass": 7,
                                "courses_avg": 90.71
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "522",
                                "courses_pass": 7,
                                "courses_avg": 90.71
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "503",
                                "courses_pass": 6,
                                "courses_avg": 94.5
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "503",
                                "courses_pass": 6,
                                "courses_avg": 94.5
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "449",
                                "courses_pass": 6,
                                "courses_avg": 93.5
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "449",
                                "courses_pass": 6,
                                "courses_avg": 93.5
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "449",
                                "courses_pass": 6,
                                "courses_avg": 92.5
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "449",
                                "courses_pass": 6,
                                "courses_avg": 92.5
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "490",
                                "courses_pass": 6,
                                "courses_avg": 92
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "490",
                                "courses_pass": 6,
                                "courses_avg": 92
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "501",
                                "courses_pass": 5,
                                "courses_avg": 94
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "501",
                                "courses_pass": 5,
                                "courses_avg": 94
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "501",
                                "courses_pass": 4,
                                "courses_avg": 91
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "501",
                                "courses_pass": 4,
                                "courses_avg": 91
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "449",
                                "courses_pass": 4,
                                "courses_avg": 90.25
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "449",
                                "courses_pass": 4,
                                "courses_avg": 90.25
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "589",
                                "courses_pass": 1,
                                "courses_avg": 95
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "589",
                                "courses_pass": 1,
                                "courses_avg": 95
                            }
                            ]
                        };
                    expect(result.body).deep.eq(expectedResult);
                    resolve(result);
                })
                .catch(function (err) {
                    reject(err);
                })
        });
    });

    it("Sort on multiple keys UP", function () {
        let testQuery: any = {
            "WHERE": {
                "AND": [{
                    "OR": [{
                        "IS": {
                            "courses_dept": "cpsc"
                        }
                    },{
                        "IS": {
                            "courses_dept": "math"
                        }
                    }]
                }, {
                    "GT": {
                        "courses_avg": 90
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "courses_pass",
                    "courses_avg"
                ],
                "ORDER": {
                    "dir": "UP",
                    "keys": ["courses_dept", "courses_pass",  "courses_avg", "courses_id"]
                },
                "FORM": "TABLE"
            }
        };

        return new Promise(function (resolve, reject) {
            return inFac.performQuery(testQuery)
                .then(function (result) {
                    //console.log(result);
                    let expectedResult = {
                            "render": "TABLE",
                            "result": [{
                                "courses_dept": "cpsc",
                                "courses_id": "589",
                                "courses_pass": 1,
                                "courses_avg": 95
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "589",
                                "courses_pass": 1,
                                "courses_avg": 95
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "449",
                                "courses_pass": 4,
                                "courses_avg": 90.25
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "449",
                                "courses_pass": 4,
                                "courses_avg": 90.25
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "501",
                                "courses_pass": 4,
                                "courses_avg": 91
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "501",
                                "courses_pass": 4,
                                "courses_avg": 91
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "501",
                                "courses_pass": 5,
                                "courses_avg": 94
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "501",
                                "courses_pass": 5,
                                "courses_avg": 94
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "490",
                                "courses_pass": 6,
                                "courses_avg": 92
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "490",
                                "courses_pass": 6,
                                "courses_avg": 92
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "449",
                                "courses_pass": 6,
                                "courses_avg": 92.5
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "449",
                                "courses_pass": 6,
                                "courses_avg": 92.5
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "449",
                                "courses_pass": 6,
                                "courses_avg": 93.5
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "449",
                                "courses_pass": 6,
                                "courses_avg": 93.5
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "503",
                                "courses_pass": 6,
                                "courses_avg": 94.5
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "503",
                                "courses_pass": 6,
                                "courses_avg": 94.5
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "522",
                                "courses_pass": 7,
                                "courses_avg": 90.71
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "522",
                                "courses_pass": 7,
                                "courses_avg": 90.71
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "501",
                                "courses_pass": 7,
                                "courses_avg": 92.43
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "501",
                                "courses_pass": 7,
                                "courses_avg": 92.43
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "449",
                                "courses_pass": 8,
                                "courses_avg": 92.63
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "449",
                                "courses_pass": 8,
                                "courses_avg": 92.63
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "501",
                                "courses_pass": 8,
                                "courses_avg": 92.75
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "501",
                                "courses_pass": 8,
                                "courses_avg": 92.75
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "449",
                                "courses_pass": 8,
                                "courses_avg": 93.38
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "449",
                                "courses_pass": 8,
                                "courses_avg": 93.38
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "527",
                                "courses_pass": 9,
                                "courses_avg": 90.11
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "527",
                                "courses_pass": 9,
                                "courses_avg": 90.11
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "527",
                                "courses_pass": 9,
                                "courses_avg": 91.22
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "527",
                                "courses_pass": 9,
                                "courses_avg": 91.22
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "490",
                                "courses_pass": 10,
                                "courses_avg": 90.6
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "490",
                                "courses_pass": 10,
                                "courses_avg": 90.6
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "490",
                                "courses_pass": 15,
                                "courses_avg": 90.27
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "490",
                                "courses_pass": 15,
                                "courses_avg": 92.4
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "490",
                                "courses_pass": 15,
                                "courses_avg": 92.4
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "445",
                                "courses_pass": 16,
                                "courses_avg": 91.25
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "445",
                                "courses_pass": 16,
                                "courses_avg": 91.25
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "507",
                                "courses_pass": 19,
                                "courses_avg": 91.79
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "507",
                                "courses_pass": 19,
                                "courses_avg": 91.79
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "490",
                                "courses_pass": 22,
                                "courses_avg": 90.14
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "540",
                                "courses_pass": 54,
                                "courses_avg": 91.22
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "540",
                                "courses_pass": 54,
                                "courses_avg": 91.22
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "540",
                                "courses_pass": 59,
                                "courses_avg": 90.53
                            }, {
                                "courses_dept": "cpsc",
                                "courses_id": "540",
                                "courses_pass": 59,
                                "courses_avg": 90.53
                            }, {
                                "courses_dept": "math",
                                "courses_id": "589",
                                "courses_pass": 2,
                                "courses_avg": 91.5
                            }, {
                                "courses_dept": "math",
                                "courses_id": "589",
                                "courses_pass": 2,
                                "courses_avg": 93.5
                            }, {
                                "courses_dept": "math",
                                "courses_id": "425",
                                "courses_pass": 3,
                                "courses_avg": 91.33
                            }, {
                                "courses_dept": "math",
                                "courses_id": "425",
                                "courses_pass": 3,
                                "courses_avg": 91.33
                            }, {
                                "courses_dept": "math",
                                "courses_id": "589",
                                "courses_pass": 3,
                                "courses_avg": 92.33
                            }, {
                                "courses_dept": "math",
                                "courses_id": "589",
                                "courses_pass": 3,
                                "courses_avg": 92.33
                            }, {
                                "courses_dept": "math",
                                "courses_id": "589",
                                "courses_pass": 3,
                                "courses_avg": 92.67
                            }, {
                                "courses_dept": "math",
                                "courses_id": "510",
                                "courses_pass": 3,
                                "courses_avg": 95.67
                            }, {
                                "courses_dept": "math",
                                "courses_id": "510",
                                "courses_pass": 3,
                                "courses_avg": 95.67
                            }, {
                                "courses_dept": "math",
                                "courses_id": "589",
                                "courses_pass": 3,
                                "courses_avg": 96.33
                            }, {
                                "courses_dept": "math",
                                "courses_id": "217",
                                "courses_pass": 4,
                                "courses_avg": 90.25
                            }, {
                                "courses_dept": "math",
                                "courses_id": "217",
                                "courses_pass": 4,
                                "courses_avg": 90.25
                            }, {
                                "courses_dept": "math",
                                "courses_id": "539",
                                "courses_pass": 4,
                                "courses_avg": 91
                            }, {
                                "courses_dept": "math",
                                "courses_id": "539",
                                "courses_pass": 4,
                                "courses_avg": 91
                            }, {
                                "courses_dept": "math",
                                "courses_id": "516",
                                "courses_pass": 4,
                                "courses_avg": 91.25
                            }, {
                                "courses_dept": "math",
                                "courses_id": "516",
                                "courses_pass": 4,
                                "courses_avg": 91.25
                            }, {
                                "courses_dept": "math",
                                "courses_id": "537",
                                "courses_pass": 4,
                                "courses_avg": 91.75
                            }, {
                                "courses_dept": "math",
                                "courses_id": "537",
                                "courses_pass": 4,
                                "courses_avg": 91.75
                            }, {
                                "courses_dept": "math",
                                "courses_id": "515",
                                "courses_pass": 4,
                                "courses_avg": 92
                            }, {
                                "courses_dept": "math",
                                "courses_id": "515",
                                "courses_pass": 4,
                                "courses_avg": 92
                            }, {
                                "courses_dept": "math",
                                "courses_id": "589",
                                "courses_pass": 4,
                                "courses_avg": 92
                            }, {
                                "courses_dept": "math",
                                "courses_id": "508",
                                "courses_pass": 4,
                                "courses_avg": 93.5
                            }, {
                                "courses_dept": "math",
                                "courses_id": "508",
                                "courses_pass": 4,
                                "courses_avg": 93.5
                            }, {
                                "courses_dept": "math",
                                "courses_id": "544",
                                "courses_pass": 4,
                                "courses_avg": 93.5
                            }, {
                                "courses_dept": "math",
                                "courses_id": "544",
                                "courses_pass": 4,
                                "courses_avg": 93.5
                            }, {
                                "courses_dept": "math",
                                "courses_id": "516",
                                "courses_pass": 4,
                                "courses_avg": 96.25
                            }, {
                                "courses_dept": "math",
                                "courses_id": "516",
                                "courses_pass": 4,
                                "courses_avg": 96.25
                            }, {
                                "courses_dept": "math",
                                "courses_id": "525",
                                "courses_pass": 4,
                                "courses_avg": 97.25
                            }, {
                                "courses_dept": "math",
                                "courses_id": "525",
                                "courses_pass": 4,
                                "courses_avg": 97.25
                            }, {
                                "courses_dept": "math",
                                "courses_id": "501",
                                "courses_pass": 5,
                                "courses_avg": 90.6
                            }, {
                                "courses_dept": "math",
                                "courses_id": "501",
                                "courses_pass": 5,
                                "courses_avg": 90.6
                            }, {
                                "courses_dept": "math",
                                "courses_id": "510",
                                "courses_pass": 5,
                                "courses_avg": 90.6
                            }, {
                                "courses_dept": "math",
                                "courses_id": "510",
                                "courses_pass": 5,
                                "courses_avg": 90.6
                            }, {
                                "courses_dept": "math",
                                "courses_id": "503",
                                "courses_pass": 5,
                                "courses_avg": 91.8
                            }, {
                                "courses_dept": "math",
                                "courses_id": "503",
                                "courses_pass": 5,
                                "courses_avg": 91.8
                            }, {
                                "courses_dept": "math",
                                "courses_id": "502",
                                "courses_pass": 5,
                                "courses_avg": 92.2
                            }, {
                                "courses_dept": "math",
                                "courses_id": "502",
                                "courses_pass": 5,
                                "courses_avg": 92.2
                            }, {
                                "courses_dept": "math",
                                "courses_id": "503",
                                "courses_pass": 5,
                                "courses_avg": 92.4
                            }, {
                                "courses_dept": "math",
                                "courses_id": "503",
                                "courses_pass": 5,
                                "courses_avg": 92.4
                            }, {
                                "courses_dept": "math",
                                "courses_id": "508",
                                "courses_pass": 5,
                                "courses_avg": 92.4
                            }, {
                                "courses_dept": "math",
                                "courses_id": "508",
                                "courses_pass": 5,
                                "courses_avg": 92.4
                            }, {
                                "courses_dept": "math",
                                "courses_id": "589",
                                "courses_pass": 5,
                                "courses_avg": 92.6
                            }, {
                                "courses_dept": "math",
                                "courses_id": "589",
                                "courses_pass": 5,
                                "courses_avg": 92.6
                            }, {
                                "courses_dept": "math",
                                "courses_id": "508",
                                "courses_pass": 5,
                                "courses_avg": 93.2
                            }, {
                                "courses_dept": "math",
                                "courses_id": "508",
                                "courses_pass": 5,
                                "courses_avg": 93.2
                            }, {
                                "courses_dept": "math",
                                "courses_id": "510",
                                "courses_pass": 5,
                                "courses_avg": 93.6
                            }, {
                                "courses_dept": "math",
                                "courses_id": "510",
                                "courses_pass": 5,
                                "courses_avg": 93.6
                            }, {
                                "courses_dept": "math",
                                "courses_id": "501",
                                "courses_pass": 5,
                                "courses_avg": 93.8
                            }, {
                                "courses_dept": "math",
                                "courses_id": "501",
                                "courses_pass": 5,
                                "courses_avg": 93.8
                            }, {
                                "courses_dept": "math",
                                "courses_id": "516",
                                "courses_pass": 5,
                                "courses_avg": 93.8
                            }, {
                                "courses_dept": "math",
                                "courses_id": "516",
                                "courses_pass": 5,
                                "courses_avg": 93.8
                            }, {
                                "courses_dept": "math",
                                "courses_id": "544",
                                "courses_pass": 6,
                                "courses_avg": 90.5
                            }, {
                                "courses_dept": "math",
                                "courses_id": "544",
                                "courses_pass": 6,
                                "courses_avg": 90.5
                            }, {
                                "courses_dept": "math",
                                "courses_id": "525",
                                "courses_pass": 6,
                                "courses_avg": 90.83
                            }, {
                                "courses_dept": "math",
                                "courses_id": "525",
                                "courses_pass": 6,
                                "courses_avg": 90.83
                            }, {
                                "courses_dept": "math",
                                "courses_id": "589",
                                "courses_pass": 6,
                                "courses_avg": 90.83
                            }, {
                                "courses_dept": "math",
                                "courses_id": "539",
                                "courses_pass": 6,
                                "courses_avg": 91.5
                            }, {
                                "courses_dept": "math",
                                "courses_id": "539",
                                "courses_pass": 6,
                                "courses_avg": 91.5
                            }, {
                                "courses_dept": "math",
                                "courses_id": "589",
                                "courses_pass": 6,
                                "courses_avg": 91.5
                            }, {
                                "courses_dept": "math",
                                "courses_id": "527",
                                "courses_pass": 6,
                                "courses_avg": 91.67
                            }, {
                                "courses_dept": "math",
                                "courses_id": "527",
                                "courses_pass": 6,
                                "courses_avg": 91.67
                            }, {
                                "courses_dept": "math",
                                "courses_id": "525",
                                "courses_pass": 6,
                                "courses_avg": 92.67
                            }, {
                                "courses_dept": "math",
                                "courses_id": "525",
                                "courses_pass": 6,
                                "courses_avg": 92.67
                            }, {
                                "courses_dept": "math",
                                "courses_id": "527",
                                "courses_pass": 6,
                                "courses_avg": 94.17
                            }, {
                                "courses_dept": "math",
                                "courses_id": "527",
                                "courses_pass": 6,
                                "courses_avg": 94.17
                            }, {
                                "courses_dept": "math",
                                "courses_id": "552",
                                "courses_pass": 6,
                                "courses_avg": 94.33
                            }, {
                                "courses_dept": "math",
                                "courses_id": "552",
                                "courses_pass": 6,
                                "courses_avg": 94.33
                            }, {
                                "courses_dept": "math",
                                "courses_id": "544",
                                "courses_pass": 6,
                                "courses_avg": 94.67
                            }, {
                                "courses_dept": "math",
                                "courses_id": "544",
                                "courses_pass": 6,
                                "courses_avg": 94.67
                            }, {
                                "courses_dept": "math",
                                "courses_id": "532",
                                "courses_pass": 6,
                                "courses_avg": 95
                            }, {
                                "courses_dept": "math",
                                "courses_id": "532",
                                "courses_pass": 6,
                                "courses_avg": 95
                            }, {
                                "courses_dept": "math",
                                "courses_id": "545",
                                "courses_pass": 6,
                                "courses_avg": 96.83
                            }, {
                                "courses_dept": "math",
                                "courses_id": "545",
                                "courses_pass": 6,
                                "courses_avg": 96.83
                            }, {
                                "courses_dept": "math",
                                "courses_id": "425",
                                "courses_pass": 7,
                                "courses_avg": 90.29
                            }, {
                                "courses_dept": "math",
                                "courses_id": "425",
                                "courses_pass": 7,
                                "courses_avg": 90.29
                            }, {
                                "courses_dept": "math",
                                "courses_id": "440",
                                "courses_pass": 7,
                                "courses_avg": 90.43
                            }, {
                                "courses_dept": "math",
                                "courses_id": "440",
                                "courses_pass": 7,
                                "courses_avg": 90.43
                            }, {
                                "courses_dept": "math",
                                "courses_id": "420",
                                "courses_pass": 7,
                                "courses_avg": 90.57
                            }, {
                                "courses_dept": "math",
                                "courses_id": "420",
                                "courses_pass": 7,
                                "courses_avg": 90.57
                            }, {
                                "courses_dept": "math",
                                "courses_id": "589",
                                "courses_pass": 7,
                                "courses_avg": 90.57
                            }, {
                                "courses_dept": "math",
                                "courses_id": "551",
                                "courses_pass": 7,
                                "courses_avg": 91.14
                            }, {
                                "courses_dept": "math",
                                "courses_id": "551",
                                "courses_pass": 7,
                                "courses_avg": 91.14
                            }, {
                                "courses_dept": "math",
                                "courses_id": "516",
                                "courses_pass": 7,
                                "courses_avg": 91.71
                            }, {
                                "courses_dept": "math",
                                "courses_id": "516",
                                "courses_pass": 7,
                                "courses_avg": 91.71
                            }, {
                                "courses_dept": "math",
                                "courses_id": "545",
                                "courses_pass": 7,
                                "courses_avg": 91.86
                            }, {
                                "courses_dept": "math",
                                "courses_id": "545",
                                "courses_pass": 7,
                                "courses_avg": 91.86
                            }, {
                                "courses_dept": "math",
                                "courses_id": "515",
                                "courses_pass": 8,
                                "courses_avg": 90.5
                            }, {
                                "courses_dept": "math",
                                "courses_id": "515",
                                "courses_pass": 8,
                                "courses_avg": 90.5
                            }, {
                                "courses_dept": "math",
                                "courses_id": "421",
                                "courses_pass": 8,
                                "courses_avg": 91.38
                            }, {
                                "courses_dept": "math",
                                "courses_id": "421",
                                "courses_pass": 8,
                                "courses_avg": 91.38
                            }, {
                                "courses_dept": "math",
                                "courses_id": "508",
                                "courses_pass": 8,
                                "courses_avg": 91.38
                            }, {
                                "courses_dept": "math",
                                "courses_id": "508",
                                "courses_pass": 8,
                                "courses_avg": 91.38
                            }, {
                                "courses_dept": "math",
                                "courses_id": "539",
                                "courses_pass": 8,
                                "courses_avg": 91.38
                            }, {
                                "courses_dept": "math",
                                "courses_id": "539",
                                "courses_pass": 8,
                                "courses_avg": 91.38
                            }, {
                                "courses_dept": "math",
                                "courses_id": "507",
                                "courses_pass": 8,
                                "courses_avg": 92.63
                            }, {
                                "courses_dept": "math",
                                "courses_id": "507",
                                "courses_pass": 8,
                                "courses_avg": 92.63
                            }, {
                                "courses_dept": "math",
                                "courses_id": "545",
                                "courses_pass": 8,
                                "courses_avg": 92.75
                            }, {
                                "courses_dept": "math",
                                "courses_id": "545",
                                "courses_pass": 8,
                                "courses_avg": 92.75
                            }, {
                                "courses_dept": "math",
                                "courses_id": "525",
                                "courses_pass": 8,
                                "courses_avg": 93.75
                            }, {
                                "courses_dept": "math",
                                "courses_id": "525",
                                "courses_pass": 8,
                                "courses_avg": 93.75
                            }, {
                                "courses_dept": "math",
                                "courses_id": "551",
                                "courses_pass": 9,
                                "courses_avg": 91
                            }, {
                                "courses_dept": "math",
                                "courses_id": "551",
                                "courses_pass": 9,
                                "courses_avg": 91
                            }, {
                                "courses_dept": "math",
                                "courses_id": "521",
                                "courses_pass": 9,
                                "courses_avg": 91.56
                            }, {
                                "courses_dept": "math",
                                "courses_id": "521",
                                "courses_pass": 9,
                                "courses_avg": 91.56
                            }, {
                                "courses_dept": "math",
                                "courses_id": "523",
                                "courses_pass": 9,
                                "courses_avg": 92.67
                            }, {
                                "courses_dept": "math",
                                "courses_id": "523",
                                "courses_pass": 9,
                                "courses_avg": 92.67
                            }, {
                                "courses_dept": "math",
                                "courses_id": "545",
                                "courses_pass": 9,
                                "courses_avg": 92.78
                            }, {
                                "courses_dept": "math",
                                "courses_id": "545",
                                "courses_pass": 9,
                                "courses_avg": 92.78
                            }, {
                                "courses_dept": "math",
                                "courses_id": "523",
                                "courses_pass": 9,
                                "courses_avg": 93.11
                            }, {
                                "courses_dept": "math",
                                "courses_id": "523",
                                "courses_pass": 9,
                                "courses_avg": 93.11
                            }, {
                                "courses_dept": "math",
                                "courses_id": "541",
                                "courses_pass": 9,
                                "courses_avg": 93.11
                            }, {
                                "courses_dept": "math",
                                "courses_id": "541",
                                "courses_pass": 9,
                                "courses_avg": 93.11
                            }, {
                                "courses_dept": "math",
                                "courses_id": "541",
                                "courses_pass": 9,
                                "courses_avg": 93.78
                            }, {
                                "courses_dept": "math",
                                "courses_id": "541",
                                "courses_pass": 9,
                                "courses_avg": 93.78
                            }, {
                                "courses_dept": "math",
                                "courses_id": "502",
                                "courses_pass": 9,
                                "courses_avg": 94.67
                            }, {
                                "courses_dept": "math",
                                "courses_id": "502",
                                "courses_pass": 9,
                                "courses_avg": 94.67
                            }, {
                                "courses_dept": "math",
                                "courses_id": "534",
                                "courses_pass": 9,
                                "courses_avg": 95.56
                            }, {
                                "courses_dept": "math",
                                "courses_id": "534",
                                "courses_pass": 9,
                                "courses_avg": 95.56
                            }, {
                                "courses_dept": "math",
                                "courses_id": "502",
                                "courses_pass": 9,
                                "courses_avg": 96.44
                            }, {
                                "courses_dept": "math",
                                "courses_id": "502",
                                "courses_pass": 9,
                                "courses_avg": 96.44
                            }, {
                                "courses_dept": "math",
                                "courses_id": "527",
                                "courses_pass": 9,
                                "courses_avg": 99.78
                            }, {
                                "courses_dept": "math",
                                "courses_id": "527",
                                "courses_pass": 9,
                                "courses_avg": 99.78
                            }, {
                                "courses_dept": "math",
                                "courses_id": "503",
                                "courses_pass": 10,
                                "courses_avg": 91.2
                            }, {
                                "courses_dept": "math",
                                "courses_id": "503",
                                "courses_pass": 10,
                                "courses_avg": 91.2
                            }, {
                                "courses_dept": "math",
                                "courses_id": "544",
                                "courses_pass": 10,
                                "courses_avg": 91.2
                            }, {
                                "courses_dept": "math",
                                "courses_id": "544",
                                "courses_pass": 10,
                                "courses_avg": 91.2
                            }, {
                                "courses_dept": "math",
                                "courses_id": "534",
                                "courses_pass": 10,
                                "courses_avg": 91.4
                            }, {
                                "courses_dept": "math",
                                "courses_id": "534",
                                "courses_pass": 10,
                                "courses_avg": 91.4
                            }, {
                                "courses_dept": "math",
                                "courses_id": "525",
                                "courses_pass": 10,
                                "courses_avg": 91.8
                            }, {
                                "courses_dept": "math",
                                "courses_id": "525",
                                "courses_pass": 10,
                                "courses_avg": 91.8
                            }, {
                                "courses_dept": "math",
                                "courses_id": "545",
                                "courses_pass": 10,
                                "courses_avg": 91.8
                            }, {
                                "courses_dept": "math",
                                "courses_id": "545",
                                "courses_pass": 10,
                                "courses_avg": 91.8
                            }, {
                                "courses_dept": "math",
                                "courses_id": "544",
                                "courses_pass": 10,
                                "courses_avg": 92.1
                            }, {
                                "courses_dept": "math",
                                "courses_id": "544",
                                "courses_pass": 10,
                                "courses_avg": 92.1
                            }, {
                                "courses_dept": "math",
                                "courses_id": "550",
                                "courses_pass": 10,
                                "courses_avg": 92.3
                            }, {
                                "courses_dept": "math",
                                "courses_id": "550",
                                "courses_pass": 10,
                                "courses_avg": 92.3
                            }, {
                                "courses_dept": "math",
                                "courses_id": "510",
                                "courses_pass": 10,
                                "courses_avg": 92.8
                            }, {
                                "courses_dept": "math",
                                "courses_id": "510",
                                "courses_pass": 10,
                                "courses_avg": 92.8
                            }, {
                                "courses_dept": "math",
                                "courses_id": "546",
                                "courses_pass": 11,
                                "courses_avg": 91.73
                            }, {
                                "courses_dept": "math",
                                "courses_id": "546",
                                "courses_pass": 11,
                                "courses_avg": 91.73
                            }, {
                                "courses_dept": "math",
                                "courses_id": "541",
                                "courses_pass": 11,
                                "courses_avg": 97.09
                            }, {
                                "courses_dept": "math",
                                "courses_id": "541",
                                "courses_pass": 11,
                                "courses_avg": 97.09
                            }, {
                                "courses_dept": "math",
                                "courses_id": "525",
                                "courses_pass": 12,
                                "courses_avg": 92
                            }, {
                                "courses_dept": "math",
                                "courses_id": "525",
                                "courses_pass": 12,
                                "courses_avg": 92
                            }, {
                                "courses_dept": "math",
                                "courses_id": "516",
                                "courses_pass": 12,
                                "courses_avg": 92.75
                            }, {
                                "courses_dept": "math",
                                "courses_id": "516",
                                "courses_pass": 12,
                                "courses_avg": 92.75
                            }, {
                                "courses_dept": "math",
                                "courses_id": "546",
                                "courses_pass": 13,
                                "courses_avg": 92.08
                            }, {
                                "courses_dept": "math",
                                "courses_id": "546",
                                "courses_pass": 13,
                                "courses_avg": 92.08
                            }, {
                                "courses_dept": "math",
                                "courses_id": "516",
                                "courses_pass": 13,
                                "courses_avg": 92.38
                            }, {
                                "courses_dept": "math",
                                "courses_id": "516",
                                "courses_pass": 13,
                                "courses_avg": 92.38
                            }, {
                                "courses_dept": "math",
                                "courses_id": "551",
                                "courses_pass": 15,
                                "courses_avg": 90.73
                            }, {
                                "courses_dept": "math",
                                "courses_id": "551",
                                "courses_pass": 15,
                                "courses_avg": 90.73
                            }, {
                                "courses_dept": "math",
                                "courses_id": "534",
                                "courses_pass": 15,
                                "courses_avg": 91.47
                            }, {
                                "courses_dept": "math",
                                "courses_id": "534",
                                "courses_pass": 15,
                                "courses_avg": 91.47
                            }, {
                                "courses_dept": "math",
                                "courses_id": "559",
                                "courses_pass": 17,
                                "courses_avg": 90.24
                            }, {
                                "courses_dept": "math",
                                "courses_id": "559",
                                "courses_pass": 17,
                                "courses_avg": 90.24
                            }, {
                                "courses_dept": "math",
                                "courses_id": "550",
                                "courses_pass": 17,
                                "courses_avg": 90.94
                            }, {
                                "courses_dept": "math",
                                "courses_id": "550",
                                "courses_pass": 17,
                                "courses_avg": 90.94
                            }, {
                                "courses_dept": "math",
                                "courses_id": "532",
                                "courses_pass": 21,
                                "courses_avg": 97.48
                            }, {
                                "courses_dept": "math",
                                "courses_id": "532",
                                "courses_pass": 21,
                                "courses_avg": 97.48
                            }, {
                                "courses_dept": "math",
                                "courses_id": "255",
                                "courses_pass": 50,
                                "courses_avg": 91.1
                            }
                            ]
                        };
                    expect(result.body).deep.eq(expectedResult);
                    resolve(result);
                })
                .catch(function (err) {
                    reject(err);
                })
        });
    });

    it("Query with special characters", function () {
        let testQuery: any = {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    "GT": {
                        "rooms_seats": 300
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "m\nax'Seats",
                    "countName"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["m\nax'Seats"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "m\nax'Seats": {
                        "MAX": "rooms_seats"
                    }
                },
                    {
                        "countName": {
                            "COUNT": "rooms_name"
                        }
                    }]
            }
        };

        return new Promise(function (resolve, reject) {
            return inFac.performQuery(testQuery)
                .then(function (result) {
                    let expectedResult = {
                            "render": "TABLE",
                            "result": [{
                                "rooms_shortname": "OSBO",
                                "m\nax'Seats": 442,
                                "countName": 1
                            }, {
                                "rooms_shortname": "HEBB",
                                "m\nax'Seats": 375,
                                "countName": 1
                            }, {
                                "rooms_shortname": "LSC",
                                "m\nax'Seats": 350,
                                "countName": 2
                            }
                            ]
                        };
                    expect(result.body).deep.eq(expectedResult);
                    resolve(result);
                })
                .catch(function (err) {
                    reject(err);
                })
        });
    });
});

