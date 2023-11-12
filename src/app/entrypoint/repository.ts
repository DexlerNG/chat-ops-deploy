"use strict";
import DeployModel from "./model";
import {MongoDBRepository} from "../repository";
class DeployRepository extends MongoDBRepository{
    constructor() {
        super(DeployModel);
    }
}

export = new DeployRepository();
