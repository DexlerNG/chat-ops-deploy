export class FindOptions {
    [x: string]: any
    page?: number
    limit?: number = 100
    lean?: boolean = false

}

export class MongoDBRepository {
    constructor(private readonly Model: any) {}

    getModel() {
        return this.Model;
    }

    create(payload: any) {
        return this.Model.create(payload);
    }

    findById(id: string) {
        return this.Model.findOne({_id: id});
    }

    findOne(condition: any = {}, sort?: any, options?: FindOptions) {
        const result = this.Model.findOne(condition).sort(sort);

        if (options?.lean) return result.lean();

        return result;
    }

    find(condition: any, sort?: any, options?: FindOptions) {
        try {
            if (options?.page) {
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
            } else {
                if (options?.lean)
                    return this.Model.find(condition).sort(sort).lean();

                return this.Model.find(condition).sort(sort);
            }
        } catch (e) {
            console.log(e);

            return this.Model.find(condition).sort(sort);
        }
    }

    deleteMany(condition: any = {}) {
        return this.Model.deleteMany(condition);
    }

    insertMany(data: any[] = []) {
        if (data.length === 0)
            return [];

        return this.Model.insertMany(data);
    }

    countDocuments(condition: any = {}) {
        return this.Model.countDocuments(condition);
    }

    updateMany(query: any = {}, update: any = {}) {
        return this.Model.updateMany(query, update);
    }

    upsert(query: any = {}, update: any = {}) {
        return this.Model.updateOne(query, update, {
            upsert: true,
            setDefaultsOnInsert: true
        });
    }

    findOneAndUpdate(filter: any, update: any, options: any = {}) {
        return this.Model.findOneAndUpdate(filter, update, {
            new: true,
            ...options
        });
    }

    bulkWrite(bulkWritePayload: any){
        return this.Model.bulkWrite(bulkWritePayload);
    }
}
