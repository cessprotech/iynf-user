import { Model } from 'mongoose';

import { Logger, LogService } from '@core/logger';
import { BadRequestException } from '@nestjs/common';

interface PopulateInterface {
    path: string
}

export type PopulateOptions = PopulateInterface[] | undefined;

interface apiMethods {
    query: any;
    queryString: Record<string, any>;
    filter(): this;
    sort(): this;
    limitFields(): this;
    paginate(): this;
    populate(populateOptions: PopulateOptions): this;
    apiMethods(): apiMethods;
}

class ApiFeatures {
    protected query: any;
    protected queryString: any;

    api(Model: Model<any>, queryString: Record<string, any>) {
        this.query = Model.find();
        this.queryString = queryString;

        return new ApiFeaturesMethod(this.query, this.queryString);
    }

    
}

class ApiFeaturesMethod {
    public query: any;
    protected queryString: any;
    private logger = new LogService();

    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
        
        this.logger.setContext('ApiFeatures');
    }

    filter() {
        if (Object.keys(this.queryString).length !== 0) {
            const queryObj = { ...this.queryString };
            const excludeObj = ['page', 'sort', 'limit', 'fields', 'search'];

            // REMOVE THE KEYS IN excludeObj from queryObj
            excludeObj.forEach((el) => delete queryObj[el]);

            // CHANGE (lt, gt, lte, gte) to ($lt, $gt, $lte, $gte)
            let stringObj = JSON.stringify(queryObj);

            stringObj = stringObj.replace(
                /\b(gt|lt|lte|lte)\b/g,
                (match) => `$${match}`
            );

            this.query.find(JSON.parse(stringObj));
        }
        return this;
    }
    
    search(fields: string[]) {
        //s='{w:'ba', f:'firstName,lastName'}'
        try {
            const queries = this.queryString.search;
            const w = queries?.w, f = queries?.f;

            if (w && f) {
                const searchFields = f.split(',');

                const finalFields = searchFields.filter(el => fields.includes(el));
                
                let invalidFields = (searchFields.filter(el => !fields.includes(el))).join(',');

                if (invalidFields.length === 0 && finalFields.length !== 0) {
                    const searchQuery = finalFields.map(field => {
                        return {
                            [field]: { $regex: w, $options: "i" }
                        }
                    })
                    this.query.find({ $or : searchQuery });
                }
                else throw new BadRequestException(`Cannot search ${w} in ${invalidFields} field(s)`);
                    
            }
            
        } catch (error) {
            this.logger.error(error.message, error.stack);
            if (error.message.includes('Cannot search')) throw error;
        }
        
        return this;
    }

    sort() {
        // sort='price,age,-name' - Query
        
        if (this.queryString.sort) {
            // sort takes values in this format sort('price age -name')
            const sortVal = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortVal);

            return this;
        }

        this.query = this.query.sort('createdAt');

        return this;
    }

    limitFields() {
        // limit='price,age,-name' - Query
        if (this.queryString.fields) {
            // select takes values in this format select('price age -name')
            const fieldsVal = this.queryString.fields.split(',').join(' ');

            this.query = this.query.select(fieldsVal);
        }

        this.query = this.query.select('-v');

        return this;
    }

    paginate() {
        // PAGINATION
        const page = this.queryString.page || 1;
        const limit = +this.queryString.limit || 9;

        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }

    populate(populateOptions: PopulateOptions) {
        // POPULATION
        if (populateOptions === undefined) return this;

        this.query = this.query.populate(populateOptions);

        return this;
    }
}

export default ApiFeatures;
