/**
 * Created by sawmawngolestani on 2017-02-15.
 */
import {InsightResponse, ICourse}  from "./IInsightFacade";

import Log from "../Util";

"use strict";
let JSZip = require("jszip");
let fs = require("fs");
let parse5 = require("parse5");
let http = require("http");

export class Course implements ICourse {
    public dept: string;
    public id: string;
    public avg: number;
    public instructor: string;
    public title: string;
    public pass: number;
    public fail: number;
    public size: number;
    public audit: number;
    public uuid: string;
    public year: number;

    constructor() {};
}

export class Room {
    public fullname: string;
    public shortname: string;
    public number: string;
    public name: string;
    public address: string;
    public lat: number;
    public lon: number;
    public seats: number;
    public type: string;
    public furniture: string;
    public href: string;

    constructor() {};
}

export class IResponse implements InsightResponse {
    code: number;
    body: {}; // the actual response
}

export class DataSetHandler {

    static buildingList: Room[] = [];

    constructor() {
        //Log.trace("DataSetClassImpl::init()")
    }

    addDataset(id: string, content: string, data: {[id: string]: Array<ICourse>}): Promise<InsightResponse> {
        let inResponse: InsightResponse = new IResponse();
        console.log("addDataset");
        let that = this;
        return new Promise(function (fulfill, reject) {
            return that.unzipFile(id, content)
                .then(function (jsonObjectFiles: any) {
                    //console.log(jsonObjectFiles);
                    //console.log("BUILDING LIST IN UNZIP: " + JSON.stringify(that.buildingList));
                    if (jsonObjectFiles.length === 0) {
                        return reject({code: 400, body: {error: "No data found"}});
                    }
                    data[id] = jsonObjectFiles;
                    //console.log("writing json: " + id);
                    let exists: boolean = fs.existsSync(id + '.json');
                    if (exists) {
                        fs.writeFileSync(id + '.json', JSON.stringify(jsonObjectFiles));
                        inResponse.code = 201;
                        fulfill(inResponse);
                    } else if (!exists) {
                        fs.writeFileSync(id + '.json', JSON.stringify(jsonObjectFiles));
                        inResponse.code = 204;
                        fulfill(inResponse);
                    }
                    //console.log('Writing done: There are now ' + jsonObjectFiles.length + ' courses');
                }).catch(function (err: any) {
                    inResponse.code = 400;
                    inResponse.body = {error: 'error: ' + err};
                    reject(inResponse);
                    console.log("addDataset error: " + err);
                });
        });
    }

    removeDataset(id: string): Promise<InsightResponse> {
        let exists: boolean = fs.existsSync(id + '.json');
        let inResponse: InsightResponse = new IResponse();
        return new Promise(function (fulfill, reject) {
            if (exists) {
                fs.unlinkSync(id + '.json');
                inResponse.code = 204;
                inResponse.body = {success: 'The file was successfully removed'};
                fulfill(inResponse);
            } else if (!exists) {
                inResponse.code = 404;
                inResponse.body = {error: 'The resource did not exist'};
                reject(inResponse);
            }
        });
    }

    unzipFile(id: string, content: string): Promise<Array<JSON>> {
        let that = this;
        return new Promise(function (fulfill, reject) {
            let promisesFiles: Promise<any>[] = [];

            //console.log("loadAsync");
            let zip = new JSZip();
            zip.loadAsync(content, {base64: true})
                .then(function (zip: any) {


                    if (id === "rooms") {

                        zip.file("index.htm")
                            .async("string")
                            .then(function (content: string) {
                                //console.log("opening rooms");
                                let doc = parse5.parse(content);
                                let buildingList = that.getBuildings(doc);
                                //console.log(buildingList);
                                for (let buildingName of buildingList) {
                                    promisesFiles.push(that.getRoomsFromBuilding(zip, buildingName));
                                }
                                Promise.all(promisesFiles).then(function (allRoomsInBuildings) {
                                    let merged = [].concat.apply([], allRoomsInBuildings);
                                    //console.log("MERGED: " + merged);
                                    fulfill(merged);
                                })
                                    .catch(function (error) {
                                        reject("ERROR GETTING ROOMS: " + error);
                                    });
                            });


                    } else {
                        zip.forEach(function (relativePath: String, file: JSZipObject) {
                            //console.log(relativePath);
                            if (file.dir == false) {
                                promisesFiles.push(file.async("string")
                                    .then(function (stringFile) {
                                        return that.parseData(stringFile);
                                    }));
                            }
                        });
                        //console.log('length of promise files:' + promisesFiles.length);
                        Promise.all(promisesFiles).then(function (allFilesProcessed) {
                            let filtered = that.filterJsonFiles(allFilesProcessed);
                            fulfill(filtered);
                        });
                    }
                }).catch(function (err: any) {
                reject(err);
            });
        });
    }

    parseData(file: any) {
        let jsonObject: any;
        try {
            jsonObject = JSON.parse(file);
            return jsonObject;
        } catch (err) {
            //console.log("Couldn't Parse file " + err);
        }
    }

    filterJsonFiles(jsonObjects: any): Array<ICourse> {
        let courses: Array<ICourse> = [];
        let that = this;
        //console.log('entered filterJsonFiles: ' + jsonObjects);
        for (let file of jsonObjects) {
            if (file == null) {
                //console.log("file is null");
                continue;
            }
            let result: Array<any> = file["result"];
            if (Array.isArray(result) && result.length != 0) {
                for (let crse of result) {
                    let keys = Object.keys(crse);
                    let course: ICourse = new Course;
                    if (that.isValidSection(keys)) {
                        course.dept = crse["Subject"];
                        course.id = crse["Course"];
                        course.avg = crse["Avg"];
                        course.instructor = crse["Professor"];
                        course.title = crse["Title"];
                        course.pass = crse["Pass"];
                        course.fail = crse["Fail"];
                        course.size = course.pass + course.fail;
                        course.audit = crse["Audit"];
                        course.uuid = crse["id"].toString();
                        if (crse["Section"] == "overall") {
                            course.year = 1900;
                        } else {
                            course.year = parseInt(crse["Year"]);
                        }
                    } else {
                        //console.log("COURSE WITH INVALID KEYS FOUND: " + course);
                    }
                    courses.push(course);
                }
            }
        }
        return courses;
    }


    isValidSection(arrayKeys: Array<String>): Boolean {
        let validFields: Array<String> =
            ["Subject", "Course", "Avg", "Professor", "Title", "Pass", "Fail", "Audit", "id"];
        for (let field of validFields) {
            if (!arrayKeys.includes(field)) {
                return false;
            }
        }
        return true;
    }

    getBuildings(body: any): string[] {
        if (body.childNodes == null || body.tagName === "th") {
            return [];
        }
        let buildings: string[] = [];
        let classValue = DataSetHandler.getClassOfNode(body);
        if (classValue != null) {
            if (classValue.includes("views-field-field-building-code")) {
                let text = body.childNodes.filter(function (obj: any) {
                    return obj.nodeName === "#text";
                })[0];
                if (text.value != null) {
                    buildings.push(text.value.trim());
                }
            }
        }
        for (let child of body.childNodes) {
            buildings = buildings.concat(this.getBuildings(child));
        }
        return buildings;
    }

    getRoomsFromBuilding(zip: any, buildingName: string): Promise<any> {
        let that = this;
        return zip.file("campus/discover/buildings-and-classrooms/" + buildingName)
            .async("string")
            .then(function(content: string) {
                let doc = parse5.parse(content);
                //console.log("finding rooms in building: " + buildingName);
                let rooms = that.findRoomsInBuilding(doc);
                let buildingInfo = that.getBuildingInfo(doc);
                buildingInfo.shortname = buildingName;
                return that.addLatLongToBuilding(buildingInfo)
                    .then(function (building) {
                        for (let room of rooms) {
                            room.fullname = buildingInfo.fullname;
                            room.address = buildingInfo.address;
                            room.shortname = buildingInfo.shortname;
                            room.name = room.shortname + "_" + room.number;
                            room.lat = buildingInfo.lat;
                            room.lon = buildingInfo.lon;
                        }
                        //console.log("ROOMS: " + JSON.stringify(rooms));
                        return rooms;
                    });
            });
    }

    addLatLongToBuilding(building: Room): Promise<Room> {
        return new Promise(function (resolve, reject) {
            let addressArray: any = building.address.split(" ");
            let urlAddress: string = "";
            let numAddressFields: any = (addressArray.length - 1);

            for (let address in addressArray) {
                if (address == numAddressFields) {
                    urlAddress = urlAddress.concat(addressArray[address]);
                } else {
                    urlAddress = urlAddress.concat(addressArray[address] + "%20");
                }

            }
            //console.log("getting address: " + 'http://skaha.cs.ubc.ca:11316/api/v1/team162/'+urlAddress);
            return http.get('http://skaha.cs.ubc.ca:11316/api/v1/team162/'+urlAddress, function (geoResponse: any) {
                const statusCode = geoResponse.statusCode;
                const contentType = geoResponse.headers['content-type'];

                let error;
                if (statusCode !== 200) {
                    error = new Error(`Request Failed.\n` +
                        `Status Code: ${statusCode}`);
                } else if (!/^application\/json/.test(contentType)) {
                    error = new Error(`Invalid content-type.\n` +
                        `Expected application/json but received ${contentType}`);
                }
                if (error) {
                    //console.log("HTTP GET ERR: " + error.message);
                    reject(error.message);
                    geoResponse.resume();
                    return;
                }
                geoResponse.setEncoding('utf8');
                let data = ' ';

                geoResponse.on('data', function (chunk: any) {
                    data += chunk;
                });

                geoResponse.on('end', function() {
                    let parsed = JSON.parse(data);
                    if (geoResponse.error !== null) {
                        building.lat = parsed.lat;
                        building.lon = parsed.lon;
                        resolve(building);
                    } else {
                        resolve(building);
                    }
                });
            }).on('error', function (err: any) {
                reject(err);
            });
        });
    }

    findRoomsInBuilding(body: any): any[] {
        if (body.childNodes == null) {
            return [];
        }
        let rooms: any[] = [];
        let classValue = DataSetHandler.getClassOfNode(body);
        if (classValue != null) {
            if (classValue.startsWith("odd") || classValue.startsWith("even")) {
                let room = new Room();

                for (let child of body.childNodes) {
                    let childClassValue = DataSetHandler.getClassOfNode(child);
                    if (childClassValue != null) {
                        if (childClassValue.includes("views-field-field-room-number")) {
                            for (let roomNumberChild of child.childNodes) {
                                if (roomNumberChild.tagName === "a") {
                                    room.href = roomNumberChild.attrs.filter(function (obj: any) {
                                        return obj.name === "href";
                                    })[0].value;
                                    for (let aChild of roomNumberChild.childNodes) {
                                        if (aChild.nodeName === "#text") {
                                            room.number = aChild.value;
                                        }
                                    }
                                }
                            }
                        } else if (childClassValue.includes("views-field-field-room-capacity")) {
                            for (let capacityChild of child.childNodes) {
                                if (capacityChild.nodeName === "#text") {
                                    let capacity = capacityChild.value.trim();
                                    room.seats = parseInt(capacity);
                                }
                            }
                        } else if (childClassValue.includes("views-field-field-room-type")) {
                            for (let typeChild of child.childNodes) {
                                if (typeChild.nodeName === "#text") {
                                    room.type = typeChild.value.trim();
                                }
                            }
                        } else if (childClassValue.includes("views-field-field-room-furniture")) {
                            for (let furnitureChild of child.childNodes) {
                                if (furnitureChild.nodeName === "#text") {
                                    room.furniture = furnitureChild.value.trim();
                                }
                            }
                        }
                    }
                }

                rooms.push(room);
            }
        }
        for (let child of body.childNodes) {
            rooms = rooms.concat(this.findRoomsInBuilding(child));
        }
        return rooms;
    }

    getBuildingInfo(body: any): Room {
        if (body.childNodes == null) {
            return null;
        }
        let room = new Room();
        if (body.attrs != null) {
            let idObj = body.attrs.filter(function (obj: any) {
                return obj.name === "id";
            })[0];
            if (idObj != null && idObj.value === "building-info") {
                room.fullname = body.childNodes[1].childNodes[0].childNodes[0].value;
                room.address = body.childNodes[3].childNodes[0].childNodes[0].value;


                let buildingListHasBuilding = false;
                for (let building of DataSetHandler.buildingList) {
                    if (building.fullname === room.fullname) {
                        buildingListHasBuilding = true;
                        break;
                    }
                }
                if (!buildingListHasBuilding) {
                    DataSetHandler.buildingList.push(room);
                }
                return room;
            }
        }
        for (let child of body.childNodes) {
            let result = this.getBuildingInfo(child);
            if (result != null) {
                return result;
            }
        }
        return null;
    }

    static getClassOfNode(node: any): string {
        if (node.attrs == null) {
            return null;
        }
        let classObj = node.attrs.filter(function (obj: any) {
            return obj.name === "class";
        })[0];
        if (classObj == null) {
            return null;
        }
        return classObj.value;
    }
}