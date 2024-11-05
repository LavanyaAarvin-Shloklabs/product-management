const successResponse = (res) => {
    if (res) {
      return  {
            success: true,
            data: res
        };
    }
};

module.exports = successResponse;