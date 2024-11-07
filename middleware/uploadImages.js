const redisClient = require('../config/redisConfig');

const uploadProductImages = async (productId, files) => {
    if (!files || files.length === 0) return [];

    const imageUrls = [];

    for (const file of files) {
        const imageKey = `${productId}-${file.originalname}`;  // Unique key based on productId and original filename
        const redisKey = `product_image:${imageKey}`;

        // Check if image already exists in Redis
        const cachedImage = await redisClient.get(redisKey);
        if (cachedImage) {
            continue;  // Skip this image if it already exists
        }

        const imageUrl = `/uploads/${productId}/${file.originalname}`;  // Image URL based on productId

        // Cache image in Redis (e.g., for 1 hour)
        await redisClient.setEx(redisKey, 3600, file.buffer.toString('base64'));

        // Add only the new image URL to the list
        imageUrls.push(imageUrl);
    }

    return imageUrls;  // Return only the array of new URLs
};

module.exports = uploadProductImages;
