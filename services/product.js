const BaseService = require('./baseService');
const ErrorResponse = require('../utils/errorResponse');
const uploadProductImages = require("../middleware/uploadImages");
const { categoryPopulate } = require("../utils/populateQueries");
const redisClient = require('../config/redisConfig');
const logger = require('../logger')(module);

class ProductService extends BaseService {
    constructor(repository, categoryService) {
        super(repository);
        this.categoryService = categoryService;
    }

    // Cache data in Redis
    async cacheData(key, data) {
        try {
            await redisClient.set(key, JSON.stringify(data), 'EX', 3600);  // Set cache with expiration
            logger.debug(`Data cached under key: ${key}`);
        } catch (err) {
            logger.error("Error setting data to Redis:", err);
        }
    }
    

    // Retrieve data from cache
    async getFromCache(key) {
        try {
            const data = await redisClient.get(key);
            if (data) {
                //Cached Data
                return data;
            } else {
                return null;
            }
        } catch (err) {
            logger.error("Error fetching data from Redis:", err);
            throw err;
        }
    }
    

    // Invalidate cache when products are created, updated, or deleted
    async invalidateCache() {
        const cacheKey = 'products';
        redisClient.del(cacheKey, (err, response) => {
            if (err) {
                logger.error('Error invalidating cache: ', err);
            } else if (response === 1) {
                logger.debug('Cache invalidated successfully');
            }
        });
    }

    async validateCategory(categoryId) {
        if (!categoryId) return null;
        const category = await this.categoryService.findById(categoryId);
        if (!category) {
            throw new ErrorResponse(`No category found with id of ${categoryId}`, 404);
        }
        return category;
    }

    // async createProduct(data) {
    //     let category, images;
    //     // Check if categoryId is provided before validating the category
    //     if (data.categoryId) {
    //         category = await this.validateCategory(data.categoryId);
    //     }
    //     if(data.images) {
    //         const imageUrls = await uploadProductImages(data.images);
    //         images = imageUrls;
    //     }
    //     const productData = {
    //         ...data,
    //         ...(category && { category }),  // Only include `category` if it was validated
    //         ...(images && { images })
    //     };    
    //     const product = await this.repository.create(productData);
    //     await this.invalidateCache();  // Invalidate cache after creation
    //     return product;
    // }
    
    async createProduct(data) {
        let category, images = [];
        // Check if categoryId is provided before validating the category
        if (data.categoryId) {
            category = await this.validateCategory(data.categoryId);
        }
    
        const initialProductData = {
            ...data,
            ...(category && { category })  // Only include `category` if it was validated
        };
        const product = await this.repository.create(initialProductData);
       
        // Upload images using productId and get an array of image URLs
        if (data.images) {
            const imageUrls = await uploadProductImages(product._id, data.images);
            images = imageUrls; 
        }
        await this.invalidateCache();  // Invalidate cache after creation
        return {
            ...product.toObject(), // Convert Mongoose document to plain object
            images // Append image URLs from Redis cache
        };
    }
    

    async getAllProducts(products, query) {    

        const { sort } = query;
        const cacheKey = 'products';
        // Check if products are cached
        const cachedProducts = await this.getFromCache(cacheKey);
        if (cachedProducts) {
            return JSON.parse(cachedProducts);
        }

        const allProducts = await Promise.all(
            products.map(async (product) => {
                return await product.populate(categoryPopulate);
            })
        );
         // Cache the resultant products
         await this.cacheData(cacheKey, allProducts);

        return allProducts;
    }


    // async getProductById(productId) {
    //     const product = await this.repository.findById(productId);
    //     const result = product.populate(categoryPopulate)
    //     return result;
    // }

    async getProductById(productId) {
        // Create a cache key based on productId
        const cacheKey = `product:${productId}`;
    
        // Check if the product is cached
        const cachedProduct = await this.getFromCache(cacheKey);
        if (cachedProduct) {
            // Return the cached product data
            return JSON.parse(cachedProduct); 
        }
    
        // If not cached, fetch product from database
        const product = await this.repository.findById(productId);
        if (!product) {
            throw new ErrorResponse(`No product found with id of ${productId}`, 404);
        }
        const populatedProduct = await product.populate(categoryPopulate);
    
        // Cache the fetched product data for future requests
        await this.cacheData(cacheKey, populatedProduct);
    
        return populatedProduct;
    }
    

    async updateProductById(productId, data) {

        const existingProduct = await this.repository.findById(productId);
        if (!existingProduct) {
            throw new ErrorResponse(`No product found with id of ${productId}`, 404);
        }

        let category;

        // Check if categoryId is provided before validating the category
        if (data.categoryId) {
            category = await this.validateCategory(data.categoryId);
        }

        const productData = {
            ...data,
            ...(category && { category })  // Only include `category` if it was validated
        };

        const updatedProduct = await this.repository.updateById(productId, productData);
        await this.invalidateCache();  // Invalidate cache after update
        return updatedProduct;
        
    }

    async deleteProductById(id) {

        const product = await this.repository.findById(id);
        if (!product) {
            throw new ErrorResponse(`No product found with id of ${id}`, 404);
        }
        const deletedProduct = await this.repository.deleteById(id);
        await this.invalidateCache();  // Invalidate cache after deletion
        return deletedProduct;
    }
    
}

module.exports = ProductService;
