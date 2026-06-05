"use strict";
const success = (res, data, code = 200) => {
    return res.status(code).json({ data });
};
const paginated = (res, data, code = 200) => {
    data.page = parseInt(data.page);
    return res.status(code).json({
        total: data.totalDocs || data.total || 0,
        page: data.page || 1,
        pages: data.totalPages || data.pages || 0,
        limit: data.limit || 50,
        data: data.docs
    });
};
const error = (res, error = "Oops. An Error Occurred", code = 500) => {
    return res.status(code).json({
        error
    });
};
module.exports = {
    error,
    paginated,
    success
};
//# sourceMappingURL=response.js.map