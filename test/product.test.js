// Load environment variables from config/.env file
require('dotenv').config({ path: 'config/.env' });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { productController } = require('../bootstrap');
const redisClient = require("../config/redisConfig");
const logger = require('../logger')(module);


describe('Product Model', () => {
  beforeAll(async () => {
    const url = process.env.MONGO_URI_TESTING; // Use a different database for testing
    logger.debug('Connecting to MongoDB:', url);
    await mongoose.connect(url);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterAll(async () => {
    await redisClient.quit();
  });

  // Test Case for Create Product

  it('should create a new Product with images', async () => {
    const req = {
        body: {
            name: `Sample Product ${new Date().getTime()}`,
            description: 'This is a sample product',
            price: 29.99,
            stock: 200,
            categoryId: "6729e683c4c17f9212db0d46"
        },
        files: [
            {
                fieldname: 'images',
                originalname: 'sample-image1.jpg',
                buffer: Buffer.from('sampledata1'),
                mimetype: 'image/jpeg'
            },
            {
                fieldname: 'images',
                originalname: 'sample-image2.jpg',
                buffer: Buffer.from('sampledata2'),
                mimetype: 'image/jpeg'
            }
        ]
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    // Mock Redis responses to simulate caching
    redisClient.get = jest.fn().mockResolvedValue(null); // Simulate that images are not in the cache
    redisClient.setEx = jest.fn().mockResolvedValue(true);

    // Run the controller method
    await productController.createProduct(req, res);

    // Assert status code 201 for created
    expect(res.status).toHaveBeenCalledWith(201);

    const createdProduct = res.json.mock.calls[0][0].data;
    expect(createdProduct.name).toBe(req.body.name);
    expect(createdProduct.description).toBe(req.body.description);
    expect(createdProduct.price).toBe(req.body.price);
    expect(createdProduct.stock).toEqual(req.body.stock);
    expect(createdProduct.categoryId.toString()).toBe(req.body.categoryId);

    // Check that images URLs are included in the product response
    expect(createdProduct.images).toHaveLength(2);
    expect(createdProduct.images[0]).toContain(`/uploads/${createdProduct._id}/sample-image1.jpg`);
    expect(createdProduct.images[1]).toContain(`/uploads/${createdProduct._id}/sample-image2.jpg`);

    // Verify Redis caching behavior
    expect(redisClient.setEx).toHaveBeenCalledTimes(2); // Called for each image
    expect(redisClient.setEx).toHaveBeenCalledWith(
        `product_image:${createdProduct._id}-sample-image1.jpg`,
        3600,
        expect.any(String) // Base64 encoded buffer
    );
    expect(redisClient.setEx).toHaveBeenCalledWith(
        `product_image:${createdProduct._id}-sample-image2.jpg`,
        3600,
        expect.any(String)
    );
  });

  // Test Case for Get All Products
  it('should get all products', async () => {
    const existingProducts = await Product.find({});
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    res.advancedResults = { data: existingProducts };

    await productController.getAllProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    const foundProducts = res.json.mock.calls[0][0].data;
    expect(foundProducts.length).toBe(existingProducts.length);

    existingProducts.forEach(existingProduct => {
      const foundProduct = foundProducts.find(product => product._id.toString() === existingProduct._id.toString());
      expect(foundProduct).toBeDefined();
      expect(foundProduct.name).toBe(existingProduct.name);
      expect(foundProduct.description).toBe(existingProduct.description);
      expect(foundProduct.price).toBe(existingProduct.price);
      expect(foundProduct.stock).toBe(existingProduct.stock);
      expect(foundProduct.categoryId.toString()).toBe(existingProduct.categoryId.toString());
    });
  });

  // Test Case for Get Product By ID
  it('should get a product by id', async () => {
    const existingProduct = await Product.findOne();

    const req = {
      params: { id: existingProduct._id }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await productController.getProductById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    const foundProduct = res.json.mock.calls[0][0];
    expect(foundProduct).toBeDefined();
    expect(foundProduct.data.name).toBe(existingProduct.name);
    expect(foundProduct.data.description).toBe(existingProduct.description);
    expect(foundProduct.data.price).toBe(existingProduct.price);
    expect(foundProduct.data.stock).toBe(existingProduct.stock);
    expect(foundProduct.data.categoryId.toString()).toBe(existingProduct.categoryId.toString());
  });

  // Test Case for Update Product By ID
  it('should update a product by id', async () => {
    const existingProduct = await Product.findOne();

    const updatedProductData = {
      name: `Updated Product ${new Date().getTime()}`,
      description: 'Updated product description',
      price: 39.99,
      stock: 100,
      categoryId: "6729e683c4c17f9212db0d46"
    };

    const req = {
      params: { id: existingProduct._id },
      body: updatedProductData
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await productController.updateProductById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    const updatedProduct = res.json.mock.calls[0][0];
    expect(updatedProduct.data.name).toBe(updatedProductData.name);
    expect(updatedProduct.data.description).toBe(updatedProductData.description);
    expect(updatedProduct.data.price).toBe(updatedProductData.price);
    expect(updatedProduct.data.stock).toBe(updatedProductData.stock);
    expect(updatedProduct.data.categoryId.toString()).toEqual(updatedProductData.categoryId.toString());

    const productInDb = await Product.findById(existingProduct._id);
    expect(productInDb.name).toBe(updatedProductData.name);
    expect(productInDb.description).toBe(updatedProductData.description);
    expect(productInDb.price).toBe(updatedProductData.price);
    expect(productInDb.stock).toBe(updatedProductData.stock);
    expect(productInDb.categoryId.toString()).toEqual(updatedProductData.categoryId.toString());
  });

  // Test Case for Delete Product By ID
  it('should delete a product by id', async () => {
    const existingProduct = await Product.findOne();

    const req = {
      params: { id: existingProduct._id }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await productController.deleteProductById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    const deletedProduct = res.json.mock.calls[0][0];
    expect(deletedProduct.data.isDeleted).toBe(true);

    const productInDb = await Product.findById(existingProduct._id);
    expect(productInDb).toBeNull();
  });
});
