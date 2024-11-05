function excludeDeletedDocuments(schema, options) {
    // Pre-find middleware to exclude deleted documents
    schema.pre(/^find/, function(next) {
      // If not explicitly querying for the deletion field, exclude deleted documents
      if (this.getFilter()[options.deletedField] === undefined) {
        const exclusionCondition = {};
        exclusionCondition[options.deletedField] = { $ne: true };
        this.where(exclusionCondition);
      }
      next();
    });
    // Method to include deleted documents in the query
    schema.query.includeDeleted = function() {
      this.where({}); // Remove the condition on the deletion field
      return this; // Return the query for chaining
    };
  }
module.exports = excludeDeletedDocuments;

