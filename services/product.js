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

    async validateCategory(categoryId) {
        if (!categoryId) return null;
        const category = await this.categoryService.findById(categoryId);
        if (!category) {
            throw new ErrorResponse(`No category found with id of ${categoryId}`, 404);
        }
        return category;
    }
    
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
        const result = {...product.toObject(), images }
        return result;
    }
    

    async getAllProducts(products, query) {    
        const allProducts = await Promise.all(
            products.map(async (product) => {
                return await product.populate(categoryPopulate);
            })
        );

        return allProducts;
    }

    async getProductById(productId) {
        // Fetch the product from the database if not cached
        const product = await this.repository.findById(productId);
        if (!product) {
            throw new ErrorResponse(`No product found with id of ${productId}`, 404);
        }    
        // Check if images are available for this product ID
        const imageUrls = await this.checkIfProductImagesExist(productId);
    
        // Populate the product with related category data
        const populatedProduct = await product.populate(categoryPopulate);

        const productObject = populatedProduct.toObject();

        // Add the images to the populated product object
        productObject.images = imageUrls;
    
        return productObject;
    }
    

    async checkIfProductImagesExist(productId) {
        const pattern = `product_image:${productId}-*`;
        const keys = await redisClient.keys(pattern);
        const imageUrls = [];
    
        for (const key of keys) {
            // Assuming the original filename is after the product ID in the key
            const imageName = key.split(`${productId}-`)[1];
            const imageUrl = `/uploads/${productId}/${imageName}`;  // Construct the image URL
            imageUrls.push(imageUrl);
        }    
        return imageUrls; // Return an array of URLs or an empty array if no images exist
    }
    
    

    async updateProductById(productId, data) {

        const existingProduct = await this.repository.findById(productId);
        if (!existingProduct) {
            throw new ErrorResponse(`No product found with id of ${productId}`, 404);
        }

        let category, images = [];

        // Check if categoryId is provided before validating the category
        if (data.categoryId) {
            category = await this.validateCategory(data.categoryId);
        }

        const productData = { ...data, ...(category && { category }) };
        const updatedProduct = await this.repository.updateById(productId, productData);

        if (data.images) {
            const imageUrls = await uploadProductImages(productId, data.images);
            images = imageUrls; 
        }

        const result = {...updatedProduct.toObject(), ...(category && { category }), images };
        return result
        
    }    
}

module.exports = ProductService;
