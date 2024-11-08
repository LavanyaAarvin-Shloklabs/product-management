const redisClient = require('../config/redisConfig');
const fs = require('fs');
const path = require('path');

const uploadProductImages = async (productId, files) => {
    if (!files || files.length === 0) return [];

    const imageUrls = [];

    // Use path.resolve to get the absolute path to the root "public" folder
    const imageDir = path.resolve(__dirname, '..', 'public', 'uploads', productId.toString()); // Absolute path to public/uploads/productId
    const imageUrlPrefix = '/uploads'; // Prefix for image URLs

    // Ensure the directory exists
    if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
    }

    for (const file of files) {
        const imagePath = path.join(imageDir, file.originalname); // Full file path
        const redisKey = `product_image:${productId}-${file.originalname}`; // Redis key

        // Check if image already exists in Redis
        const cachedImage = await redisClient.get(redisKey);
        if (cachedImage) {
            imageUrls.push(`${imageUrlPrefix}/${productId}/${file.originalname}`);
            continue;  // Skip this image if it already exists in Redis
        }

        // Write image file to disk
        fs.writeFileSync(imagePath, file.buffer);

        // Cache image in Redis (store as base64)
        const base64Image = file.buffer.toString('base64');
        await redisClient.setEx(redisKey, 3600, base64Image); // Cache image for 1 hour

        // Add the image URL to the array for response
        imageUrls.push(`${imageUrlPrefix}/${productId}/${file.originalname}`);
    }

    return imageUrls; // Return array of image URLs
};

module.exports = uploadProductImages;