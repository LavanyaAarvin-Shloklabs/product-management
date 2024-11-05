class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    async create(data) {
        return this.model.create(data);
    }

    async findAll(filter = {}, options = {}) {
        const {select, sort, populate} = options;
        let query = this.model.find(filter);
        if (select) query = query.select(select);
        if (sort) query = query.sort(sort);
        if (populate) query = query.populate(populate);
        return query.exec();
    }

    async findById(id, options = {}) {
        const {select, sort, populate} = options;
        let query = this.model.findById(id);
        if (select) query = query.select(select);
        if (sort) query = query.sort(sort);
        if (populate) query = query.populate(populate);
        return query.exec();
    }

    async updateById(id, data) {
        return this.model.findByIdAndUpdate(id, data, {runValidators: true, new: true});
    }

    async deleteById(id) {
        return this.model.findByIdAndDelete(id);
    }

}

module.exports = BaseRepository;
