const BaseRepository = require("./baseRepository");

class BaseRepositorySoftDelete extends BaseRepository {

    constructor(model) {
        super(model);
    }

    async updateById(id, data) {
        delete data.isDeleted;
        delete data.deletedAt;
        return this.model.findByIdAndUpdate(id, data, {runValidators: true, new: true });
    }

    async deleteById(id) {
        return this.model.findByIdAndUpdate(id, {
            isDeleted: true,
            deletedAt: Date.now(),
            isActive: false
        }, {
            new: true
        });
    }
}
module.exports = BaseRepositorySoftDelete;