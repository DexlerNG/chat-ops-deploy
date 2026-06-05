"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDBRepository = exports.FindOptions = void 0;
class FindOptions {
    constructor() {
        this.limit = 100;
        this.lean = false;
    }
}
exports.FindOptions = FindOptions;
class MongoDBRepository {
    constructor(Model) {
        this.Model = Model;
    }
    getModel() {
        return this.Model;
    }
    create(payload) {
        return this.Model.create(payload);
    }
    findById(id) {
        return this.Model.findOne({ _id: id });
    }
    findOne(condition = {}, sort, options) {
        const result = this.Model.findOne(condition).sort(sort);
        if (options === null || options === void 0 ? void 0 : options.lean)
            return result.lean();
        return result;
    }
    find(condition, sort, options) {
        try {
            if (options === null || options === void 0 ? void 0 : options.page) {
                delete condition.page;
                delete condition.limit;
                if (options.lean) {
                    return this.Model.paginate(condition, {
                        sort,
                        page: options.page,
                        limit: options.limit
                    }).lean();
                }
                return this.Model.paginate(condition, {
                    sort,
                    page: options.page,
                    limit: options.limit,
                });
            }
            else {
                if (options === null || options === void 0 ? void 0 : options.lean)
                    return this.Model.find(condition).sort(sort).lean();
                return this.Model.find(condition).sort(sort);
            }
        }
        catch (e) {
            console.log(e);
            return this.Model.find(condition).sort(sort);
        }
    }
    deleteMany(condition = {}) {
        return this.Model.deleteMany(condition);
    }
    insertMany(data = []) {
        if (data.length === 0)
            return [];
        return this.Model.insertMany(data);
    }
    countDocuments(condition = {}) {
        return this.Model.countDocuments(condition);
    }
    updateMany(query = {}, update = {}) {
        return this.Model.updateMany(query, update);
    }
    upsert(query = {}, update = {}) {
        return this.Model.updateOne(query, update, {
            upsert: true,
            setDefaultsOnInsert: true
        });
    }
    findOneAndUpdate(filter, update, options = {}) {
        return this.Model.findOneAndUpdate(filter, update, Object.assign({ new: true }, options));
    }
    bulkWrite(bulkWritePayload) {
        return this.Model.bulkWrite(bulkWritePayload);
    }
}
exports.MongoDBRepository = MongoDBRepository;
//# sourceMappingURL=repository.js.map