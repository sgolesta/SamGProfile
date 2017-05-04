/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse, QueryRequest, ICourse} from "./IInsightFacade";

import Log from "../Util";

"use strict";
import {DataSetHandler, Room} from "./DataSetHandler";
import {QueryHandler} from "./QueryHandler";
let fs = require("fs");

export default class InsightFacade implements IInsightFacade {
    public queryH: QueryHandler = new QueryHandler;
    public dataSetH: DataSetHandler = new DataSetHandler;
    public data: { [id: string]: Array<ICourse>} = {};
    public buildingList: Room[] = new Array();
    constructor() {
        //Log.trace('InsightFacadeImpl::init()');
    }

    addDataset(id: string, content: string): Promise<InsightResponse> {
        return this.dataSetH.addDataset(id, content, this.data);
    }


    removeDataset(id: string): Promise<InsightResponse> {
        this.data[id] = null;
        return this.dataSetH.removeDataset(id);
    }

    performQuery(query: QueryRequest): Promise <InsightResponse> {
        this.queryH.buildingList = DataSetHandler.buildingList;
        return this.queryH.performQuery(query, this.data);
    }

}