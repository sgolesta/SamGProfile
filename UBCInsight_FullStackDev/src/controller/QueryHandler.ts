/**
 * Created by sawmawngolestani on 2017-02-15.
 */

import {InsightResponse, QueryRequest, WhereClause, ICourse} from "./IInsightFacade";

import Log from "../Util";

"use strict";
import {Room} from "./DataSetHandler";

let fs = require("fs");

export class QueryHandler {

    buildingList: Room[];

    constructor() {
        //Log.trace('QueryHandlerImpl::init()');
    }

    performQuery(query: QueryRequest, data: {[id: string]: Array<ICourse>}): Promise <InsightResponse> {
        let that = this;
        return new Promise(function (resolve, reject) {
            let where = query.WHERE;
            let options = query.OPTIONS;

            let val = that.validateQuery(query);
            let ids = val.ids;
            console.log("Query on dataset " + ids);

            if (val.error.code !== 200) {
                //console.log("returning 400 code");
                return reject(val.error);
            }

            let missingIDs = [];
            for (let id of ids) {
                if (!data[id]) {
                    if (fs.existsSync(id + ".json")) {
                        data[id] = JSON.parse(fs.readFileSync(id + ".json", 'utf8'));
                    } else {
                        missingIDs.push(id);
                    }
                }
            }

            if (missingIDs.length > 0) {
                return reject({code: 424, body: {missing: missingIDs}});
            }

            let returnedCourses: ICourse[] = [];

            for (let course of data[ids[0]]) {
                if (that.fulfillsWhere(course, where)) {
                    returnedCourses.push(course);
                }
            }

            if (query.TRANSFORMATIONS) {
                let groups: any = {};
                for (let course of returnedCourses) {
                    let groupedCourse: any = {};
                    for (let groupString of query.TRANSFORMATIONS.GROUP) {
                        let courseDataName = groupString.split('_')[1];
                        groupedCourse[courseDataName] = course[courseDataName];
                    }
                    let groupKey = JSON.stringify(groupedCourse);
                    if (!groups.hasOwnProperty(groupKey)) {
                        groups[groupKey] = [];
                    }
                    groups[groupKey].push(course);
                }
                returnedCourses = [];
                //console.log("groups: " + JSON.stringify(groups));
                for (let groupString in groups) {
                    let group = JSON.parse(groupString);
                    if (query.TRANSFORMATIONS.APPLY.length > 0) {
                        for (let apply of query.TRANSFORMATIONS.APPLY) {
                            for (let applyKey in apply) {
                                for (let applyToken in apply[applyKey]) {
                                    let applyValue = apply[applyKey][applyToken].split('_')[1];
                                    let result = -1;
                                    let seenValues: any[] = [];
                                    for (let course of groups[groupString]) {
                                        if (applyToken === "MAX") {
                                            if (course[applyValue] > result) {
                                                result = course[applyValue];
                                            }
                                        } else if (applyToken === "MIN") {
                                            if (result === -1) {
                                                result = course[applyValue];
                                            } else if (course[applyValue] < result) {
                                                result = course[applyValue];
                                            }
                                        } else if (applyToken === "AVG") {
                                            if (result === -1) {
                                                result = 0;
                                            }
                                            let x = course[applyValue] * 10;
                                            x = Number(x.toFixed(0));
                                            result += x;
                                        } else if (applyToken === "COUNT") {
                                            if (result === -1) {
                                                result = 0;
                                            }
                                            if (!seenValues.includes(course[applyValue])) {
                                                result++;
                                                seenValues.push(course[applyValue]);
                                            }
                                        } else if (applyToken === "SUM") {
                                            if (result === -1) {
                                                result = course[applyValue];
                                            } else {
                                                result += course[applyValue];
                                            }
                                        }
                                    }
                                    if (applyToken === "AVG") {
                                        result = result / groups[groupString].length;
                                        result = result / 10;
                                        result = Number(result.toFixed(2));
                                    }
                                    group[applyKey] = result;
                                }
                            }
                        }
                        returnedCourses.push(group);
                        //console.log("adding group");
                    } else {
                        returnedCourses.push(group);
                    }
                }
                //console.log(returnedCourses);
            }

            if (options.ORDER) {
                if (typeof options.ORDER === "string") {
                    returnedCourses.sort(function (a: ICourse, b: ICourse) {
                        let courseDataName = options.ORDER.split('_')[1];
                        if (a[courseDataName] < b[courseDataName]) return -1;
                        if (a[courseDataName] > b[courseDataName]) return 1;
                        return 0;
                    });
                } else {
                    returnedCourses.sort(function (a: ICourse, b: ICourse) {
                        if (options.ORDER.dir === "DOWN") {
                            let temp = a;
                            a = b;
                            b = temp;
                        }
                        for (let key of options.ORDER.keys) {
                            let courseDataName = key.indexOf('_') > -1 ? key.split('_')[1] : key;
                            if (a[courseDataName] < b[courseDataName]) return -1;
                            if (a[courseDataName] > b[courseDataName]) return 1;
                        }
                        return 0;
                    });
                }
            }

            let results: any[] = [];

            for (let course of returnedCourses) {
                let courseObj: any = {};
                for (let column of options.COLUMNS) {
                    let propertyName = column.indexOf('_') > -1 ? column.split('_')[1] : column;
                    courseObj[column] = course[propertyName];
                }
                results.push(courseObj);
            }

            let returnObj: InsightResponse = {
                code: 200,
                body: {
                    render: 'TABLE',
                    result: results
                }
            };

            resolve(returnObj);
        });
    }

    fulfillsWhere(course: ICourse, where: WhereClause): boolean {
        let filterName = "";
        let that = this;
        for (let filter in where) {
            filterName = filter;
        }

        if (filterName === "") {
            return true;
        } else if (filterName === "AND" || filterName === "OR") {
            let filterList = where[filterName] as WhereClause[];
            return that.fulfillsLogic(course, filterName, filterList);
        } else if (filterName === "LT" || filterName === "GT" || filterName === "EQ" || filterName === "IS") {
            let keyName = "";
            for (let key in where[filterName]) {
                keyName = key;
            }
            let courseDataName = keyName.split('_')[1];
            let testValue = where[filterName][keyName];
            let courseValue = course[courseDataName];
            if (filterName === "LT") {
                return courseValue < testValue;
            } else if (filterName === "GT") {
                return courseValue > testValue;
            } else if (filterName === "EQ") {
                return courseValue === testValue;
            } else if (filterName === "IS") {
                let testString = testValue as string;
                if (testString.charAt(0) === "*") {
                    testString = "." + testString;
                }
                if (testString.slice(-1) === "*") {
                    testString = testString.substring(0, testString.length - 1) + ".*";
                }
                let expression = "^" + testString + "$";
                let regexp = new RegExp(expression);
                return regexp.test(courseValue);
            }
        } else if (filterName === "NOT") {
            return !that.fulfillsWhere(course, where[filterName]);
        } else if (filterName === "DIST") {


            let fromBuilding: string = where[filterName].building;
            let distance: number = where[filterName].distance;

            let buildingObject: Room;

            for (let building of that.buildingList) {
                if (building.shortname === fromBuilding) {
                    buildingObject = building;
                    break;
                }
            }

            if (!course["lat"] || !course["lon"] || buildingObject == null) {
                return false;
            }

            let lat1 = buildingObject.lat;
            let lon1 = buildingObject.lon;
            let lat2 = course["lat"];
            let lon2 = course["lon"];

            let radlat1 = Math.PI * lat1/180;
            let radlat2 = Math.PI * lat2/180;
            let theta = lon1-lon2;
            let radtheta = Math.PI * theta/180;
            let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            dist = Math.acos(dist);
            dist = dist * 180/Math.PI;
            dist = dist * 60 * 1.1515;
            dist = dist * 1.609344;
            dist = dist * 1000;

            //console.log("Building " + course["address"] + " to " + fromBuilding + " is " + dist + "m");

            return dist < distance;

        }
        return false;
    }

    fulfillsLogic(course: ICourse, filterName: string, filterList: WhereClause[]): boolean {
        let that = this;
        for (let filter of filterList) {
            let filterResult = that.fulfillsWhere(course, filter);
            if (filterName === "OR" && filterResult) {
                return true;
            } else if (filterName === "AND" && !filterResult) {
                return false;
            }
        }
        return filterName === "AND";
    }

    validateQuery(query: QueryRequest): {error: InsightResponse, ids: string[]} {
        let idsArray: string[] = [];
        if (query.OPTIONS) {
            if (!query.OPTIONS.COLUMNS || !query.OPTIONS.FORM || query.OPTIONS.FORM !== "TABLE") {
                return {error: {code: 400, body: {error: "Missing options or form"}}, ids: []};
            }
            if (query.OPTIONS.ORDER) {
                if (typeof query.OPTIONS.ORDER === "string") {
                    if (!query.OPTIONS.COLUMNS.includes(query.OPTIONS.ORDER)) {
                        return {error: {code: 400, body: {error: "Order "}}, ids: []};
                    }
                } else if (typeof query.OPTIONS.ORDER === "object") {
                    if (query.OPTIONS.ORDER.dir && query.OPTIONS.ORDER.keys) {
                        if (query.OPTIONS.ORDER.dir !== "UP" && query.OPTIONS.ORDER.dir !== "DOWN") {
                            return {error: {code: 400, body: {error: "Order dir must be UP or DOWN"}}, ids: []};
                        }
                        if (Array.isArray(query.OPTIONS.ORDER.keys) && query.OPTIONS.ORDER.keys.length > 0) {
                            for (let order of query.OPTIONS.ORDER.keys) {
                                console.log("check if " + order + " is in " + query.OPTIONS.COLUMNS);
                                if (!query.OPTIONS.COLUMNS.includes(order)) {
                                    return {error: {code: 400, body: {error: "Order keys must be in COLUMNS"}}, ids: []};
                                }
                            }
                        } else {
                            return {error: {code: 400, body: {error: "Order keys must be an array of length > 0"}}, ids: []};
                        }
                    } else {
                        return {error: {code: 400, body: {error: "Order must have dir and keys"}}, ids: []};
                    }
                } else {
                    return {error: {code: 400, body: {error: "Order must be string or object"}}, ids: []};
                }
            }
        } else {
            return {error: {code: 400, body: {error: "Missing options"}}, ids: []};
        }
        if (query.TRANSFORMATIONS) {
            if (query.TRANSFORMATIONS.GROUP) {
                if (!Array.isArray(query.TRANSFORMATIONS.GROUP) || query.TRANSFORMATIONS.GROUP.length === 0) {
                    return {error: {code: 400, body: {error: "Group must be an array of length > 0"}}, ids: []};
                } else {
                    for (let key of query.TRANSFORMATIONS.GROUP) {
                        idsArray.push(key.split('_')[0]);
                        if (!query.OPTIONS.COLUMNS.includes(key)) {
                            return {error: {code: 400, body: {error: "Group keys must be in COLUMNS"}}, ids: []};
                        }
                    }
                }
            } else {
                return {error: {code: 400, body: {error: "Missing group"}}, ids: []};
            }
            if (query.TRANSFORMATIONS.APPLY) {
                if (Array.isArray(query.TRANSFORMATIONS.APPLY)) {
                    for (let a of query.TRANSFORMATIONS.APPLY) {
                        let keyNum = 0;
                        for (let prop in a) {
                            if (a.hasOwnProperty(prop)) {
                                if (prop.indexOf('_') > -1) {
                                    return {error: {code: 400, body: {error: "Apply key can't have underscores"}}, ids: []};
                                }
                                let tokenNum =0;
                                for (let applyProp in a[prop]) {
                                    if (applyProp === "MAX" || applyProp === "MIN" || applyProp === "AVG" || applyProp === "SUM") {
                                        if (!QueryHandler.isKeyNum(a[prop][applyProp])) {
                                            return {error: {code: 400, body: {error: "MAX/MIN/AVG/SUM should take number"}}, ids: []};
                                        }
                                    } else if (applyProp !== "COUNT") {
                                        return {error: {code: 400, body: {error: "Unknown apply token"}}, ids: []};
                                    }
                                    tokenNum++;
                                }
                                if (tokenNum !== 1) {
                                    return {error: {code: 400, body: {error: "APPLY should have 1 token"}}, ids: []};
                                }
                            }
                            keyNum++;
                        }
                        if (keyNum !== 1) {
                            return {error: {code: 400, body: {error: "APPLY should have 1 key"}}, ids: []};
                        }
                    }
                } else {
                    return {error: {code: 400, body: {error: "Apply mut be an array"}}, ids: []};
                }
            } else {
                return {error: {code: 400, body: {error: "Missing apply"}}, ids: []};
            }
        }
        if (query.WHERE) {
            let id = "";
            if (query.OPTIONS.COLUMNS.length > 0) {
                id = query.OPTIONS.COLUMNS[0].split('_')[0];
                idsArray.push(id);
            } else {
                return {error: {code: 400, body: {error: "Columns can't be empty"}}, ids: []};
            }
            for (let column of query.OPTIONS.COLUMNS) {
                //console.log(column);
                if (column.indexOf('_') > -1) {
                    if (column.split('_')[0] != id) {
                        return {error: {code: 400, body: {error: "Can't query multiple datasets"}}, ids: []};
                    }
                    if (query.TRANSFORMATIONS) {
                        if (!query.TRANSFORMATIONS.GROUP.includes(column)) {
                            return {error: {code: 400, body: {error: "Column must be in group"}}, ids: []};
                        }
                    }
                } else if (query.TRANSFORMATIONS) {
                    let applyHasColumn = false;
                    for (let a of query.TRANSFORMATIONS.APPLY) {
                        for (let prop in a) {
                            if (a.hasOwnProperty(prop)) {
                                if (prop === column) {
                                    applyHasColumn = true;
                                }
                            }
                        }
                    }
                    if (!applyHasColumn) {
                        return {error: {code: 400, body: {error: "Column not in apply"}}, ids: []};
                    }
                } else {
                    return {error: {code: 400, body: {error: "Invalid column"}}, ids: []};
                }
            }
            return this.validateFilter(query.WHERE, idsArray);
        } else {
            return {error: {code: 400, body: {error: "Missing where clause"}}, ids: []};
        }
    }

    validateFilter(where: WhereClause, ids: string[]): {error: InsightResponse, ids: string[]} {
        let filterName = "";
        let i = 0;
        for (let filter in where) {
            filterName = filter;
            i++;
        }

        if (i === 0) {
            return {error: {code: 200, body: {error: "valid query"}}, ids: ids};
        } else if (i > 1) {
            return {error: {code: 400, body: {error: "Too many filters in where clause"}}, ids: ids};
        }

        if (filterName === "AND" || filterName === "OR") {
            let filterList = where[filterName] as WhereClause[];
            let i = 0;
            for (let filter of filterList) {
                let val = this.validateFilter(filter, ids);
                if (val.error.code === 400) {
                    return val;
                }
                i++;
            }
            if (i === 0) {
                return {error: {code: 400, body: {error: "Empty logic statement"}}, ids: ids};
            }
            return {error: {code: 200, body: {error: "valid query"}}, ids: ids};
        } else if (filterName === "LT" || filterName === "GT" || filterName === "EQ" || filterName === "IS") {
            let keyName = "";
            let j = 0;
            for (let key in where[filterName]) {
                keyName = key;
                j++;
            }
            if (j > 1) {
                return {error: {code: 400, body: {error: "Too many keys in filter"}}, ids: ids};
            }
            let keyID = keyName.split('_')[0];
            if (!ids.includes(keyID)) {
                ids.push(keyID);
            }
            let keyValue = keyName.split('_')[1];
            if (filterName === "IS") {
                if (!QueryHandler.isKeyString(keyName) || !(typeof where[filterName][keyName] === "string")) {
                    return {error: {code: 400, body: {error: "IS expects string"}}, ids: ids};
                }
            } else {
                if (!QueryHandler.isKeyNum(keyName) || !(typeof where[filterName][keyName] === "number")) {
                    return {error: {code: 400, body: {error: "MCOMPARATOR expects number"}}, ids: ids};
                }
            }
            return {error: {code: 200, body: {error: "valid query"}}, ids: ids};
        } else if (filterName === "NOT") {
            return this.validateFilter(where[filterName], ids);
        } else if (filterName === "DIST") {
            return {error: {code: 200, body: {error: "valid query"}}, ids: ids};
        }
        return {error: {code: 400, body: {error: "Invalid filter name"}}, ids: ids};
    }

    private static isKeyString(key: string): boolean {
        let keyValue = key.split('_')[1];
        return (keyValue === "dept" || keyValue === "id" || keyValue === "instructor" || keyValue === "title" || keyValue === "uuid" || keyValue === "fullname" || keyValue === "shortname" || keyValue === "number" || keyValue === "name" || keyValue === "address" || keyValue === "type" || keyValue === "furniture" || keyValue === "href");
    }

    private static isKeyNum(key: string): boolean {
        let keyValue = key.split('_')[1];
        return (keyValue === "avg" || keyValue === "pass" || keyValue === "fail" || keyValue === "audit" || keyValue === "year" || keyValue === "lat" || keyValue === "lon" || keyValue === "seats" || keyValue === "size");
    }
}