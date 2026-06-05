"use strict";
const mongoose_1 = require("mongoose");
const entity_1 = require("./entity");
const schema = new mongoose_1.Schema({
    chatProvider: { type: String },
    repoProvider: { type: String },
    CICDProvider: { type: String },
    channel: {
        type: String
    },
    text: {
        type: String,
        allowNull: false
    },
    service: {
        type: String,
        allowNull: false
    },
    env: {
        type: String,
        allowNull: false
    },
    branch: {
        type: String,
        allowNull: false
    },
    pipelineId: {
        type: String,
    },
    pipelineNumber: {
        type: String,
    },
    threadId: {
        type: String,
        required: true
    },
    user: {
        type: Object,
        required: true
    },
    status: {
        type: String,
        default: entity_1.DeployStatus.processing
    }
}, {
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id;
            // delete ret.createdAt;
            // delete ret.updatedAt;
            delete ret.__v;
            delete ret._id;
        }
    },
    strict: false,
    timestamps: true
});
module.exports = (0, mongoose_1.model)("deploy_logs", schema);
//# sourceMappingURL=model.js.map