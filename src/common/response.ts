"use strict";
import {Response} from "express";

const success = (res:Response, data: any, code: number = 200) => {
    return res.status(code).json({data});
};

const paginated = (res: Response, data: any, code: number = 200) => {
    data.page = parseInt(data.page);
    return res.status(code).json({
        total: data.totalDocs || data.total || 0,
        page:  data.page || 1,
        pages: data.totalPages || data.pages || 0,
        limit: data.limit || 50,
        data: data.docs
    });
};


const error = (res: Response, error: string | any = "Oops. An Error Occurred", code: number = 500) => {
    return res.status(code).json({
        error
    });
};

export = {
    error,
    paginated,
    success
}
