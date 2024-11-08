// Load environment variables from config/.env file
require('dotenv').config({ path: 'config/.env' });

const mongoose = require('mongoose');
const Category = require('../models/Category');
const { categoryController } = require('../bootstrap');
const redisClient = require("../config/redisConfig")

describe('Category Controller Test', () => {
  beforeAll(async () => {
    const url = process.env.MONGO_URI_TESTING; // Use a different database for testing
    await mongoose.connect(url);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterAll(async () => {
    await redisClient.quit();
  });

  // Test Case for Create Category
  it('should create a new category', async () => {
    const req = {
      body: {
        name: `Test Category ${new Date().getTime()}`,
        description: 'This is a test Category'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  
    await categoryController.createCategory(req, res);
  
    expect(res.status).toHaveBeenCalledWith(201);
  
    const createdCategory = res.json.mock.calls[0][0].data;
    expect(createdCategory.name).toBe(req.body.name);
    expect(createdCategory.description).toBe(req.body.description);

    const categoryInDb = await Category.findById(createdCategory._id);
    expect(categoryInDb).toBeDefined();
    expect(categoryInDb.name).toBe(req.body.name);
    expect(categoryInDb.description).toBe(req.body.description);
    
  });

  // Test Case for Get All Categories
  it('should get all Categories', async () => {
    
    // Assuming you already have Categories in your test database
    const existingCategories = await Category.find({});

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  
    // Simulate advancedResults middleware populating res.advancedResults
    res.advancedResults = {data : existingCategories};
  
    await categoryController.getAllCategories(req, res);
  
    expect(res.status).toHaveBeenCalledWith(200);
  
    const foundCategories = res.json.mock.calls[0][0].data;
    expect(foundCategories.length).toBe(existingCategories.length);
    // Validate each category found in the response
    existingCategories.forEach(existingCategory => {
      const foundCategory = foundCategories.find(foundCategory => foundCategory._id.toString() === existingCategory._id.toString());
      expect(foundCategory).toBeDefined();
      expect(foundCategory.name).toBe(existingCategory.name);
      expect(foundCategory.description).toBe(existingCategory.description);
    });
    
  });

  // Test Case for Get Category By ID
  it('should get a category by id', async () => {
    // Assuming you already have Category in your test database
    const existingCategory = await Category.findOne(); // Fetch any existing category from the database
  
    const req = {
      params: { id: existingCategory._id } // Use the _id of the fetched category
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  
    await categoryController.getCategoryById(req, res);
  
    expect(res.status).toHaveBeenCalledWith(200);
  
    const foundCategory = res.json.mock.calls[0][0];
  
    expect(foundCategory).toBeDefined();
    expect(foundCategory.data.name).toBe(existingCategory.name);
    expect(foundCategory.data.description).toBe(existingCategory.description);
  });

  // Test Case for Update category By ID 
  it('should update a category by id', async () => {
    // Assuming you already have category in your test database
    const existingCategory = await Category.findOne(); // Fetch any existing category from the database
    const updatedCategoryData = {
      name: `Updated Category ${new Date().getTime()}`,
      description: 'Updated category description'
    };
  
    const req = {
      params: { id: existingCategory._id },
      body: updatedCategoryData
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  
    await categoryController.updateCategoryById(req, res);
  
    expect(res.status).toHaveBeenCalledWith(200);
  
    const updatedCategory = res.json.mock.calls[0][0];
    expect(updatedCategory.data.name).toBe(updatedCategoryData.name);
    expect(updatedCategory.data.description).toBe(updatedCategoryData.description);
  
    // Fetch the category from the database after update
    const fetchedCategory = await Category.findById(existingCategory._id);
    expect(fetchedCategory.name).toBe(updatedCategoryData.name);
    expect(fetchedCategory.description).toBe(updatedCategoryData.description);
  });
  

  // Test Case for Delete Category By ID
  it('should delete a category by id', async () => {
    // Assuming you already have category in your test database
    const existingCategory = await Category.findOne(); // Fetch any existing category from the database
  
    const req = {
      params: { id: existingCategory._id }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  
    await categoryController.deleteCategoryById(req, res);
  
    expect(res.status).toHaveBeenCalledWith(200);
  
    const deletedCategory = res.json.mock.calls[0][0];
    
    // Verify that isDeleted is true
    expect(deletedCategory.data.isDeleted).toBe(true);

    // Verify that the category is deleted from the database
    const categoryInDb = await Category.findById(existingCategory._id);
    expect(categoryInDb).toBeNull(); // Check that the category no longer exists in the database
  });
  
});
