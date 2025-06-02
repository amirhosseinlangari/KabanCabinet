const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const { protect, isAdmin } = require('../middleware/authMiddleware');

/**
 * دریافت همه محصولات
 * GET /api/products
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'newest', 
      category, 
      search,
      featured,
      minPrice,
      maxPrice
    } = req.query;
    
    // محاسبه مقدار skip برای pagination
    const skip = (page - 1) * parseInt(limit);
    
    // ایجاد شرط‌های جستجو
    const query = {};
    
    // فیلتر بر اساس دسته‌بندی
    if (category) {
      query.category = category;
    }
    
    // فیلتر برای محصولات ویژه
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    // فیلتر قیمت
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }
    
    // جستجو در عنوان و توضیحات
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // تعیین نوع مرتب‌سازی
    let sortOptions = {};
    switch (sort) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'price-low-high':
        sortOptions = { price: 1 };
        break;
      case 'price-high-low':
        sortOptions = { price: -1 };
        break;
      case 'most-popular':
        sortOptions = { viewCount: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }
    
    // دریافت محصولات با اعمال فیلترها و pagination
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('name price images category discount slug isFeatured rating countInStock');
    
    // شمارش کل محصولات برای pagination
    const totalProducts = await Product.countDocuments(query);
    
    res.json({
      success: true,
      data: products,
      pagination: {
        total: totalProducts,
        page: parseInt(page),
        pages: Math.ceil(totalProducts / limit)
      }
    });
  } catch (error) {
    console.error('خطا در دریافت محصولات:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت لیست محصولات',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * دریافت اطلاعات یک محصول با slug
 * GET /api/products/:slug
 * @access Public
 */
router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'محصول یافت نشد'
      });
    }
    
    // افزایش تعداد بازدید
    product.viewCount += 1;
    await product.save();
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('خطا در دریافت جزئیات محصول:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت اطلاعات محصول',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * ایجاد محصول جدید
 * POST /api/products
 * @access Private (Admin only)
 */
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      images,
      category,
      discount,
      countInStock,
      attributes,
      specifications
    } = req.body;
    
    // ایجاد محصول جدید
    const product = new Product({
      name,
      description,
      price,
      images,
      category,
      discount,
      countInStock,
      attributes,
      specifications
    });
    
    // ذخیره محصول
    const createdProduct = await product.save();
    
    res.status(201).json({
      success: true,
      message: 'محصول با موفقیت ایجاد شد',
      data: createdProduct
    });
  } catch (error) {
    console.error('خطا در ایجاد محصول:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      
      return res.status(400).json({
        success: false,
        message: 'خطا در اطلاعات ورودی',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطا در ایجاد محصول',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * به‌روزرسانی محصول
 * PUT /api/products/:id
 * @access Private (Admin only)
 */
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'محصول یافت نشد'
      });
    }
    
    // به‌روزرسانی فیلدهای محصول
    const fieldsToUpdate = [
      'name', 'description', 'price', 'images', 'category',
      'discount', 'countInStock', 'attributes', 'specifications',
      'isFeatured'
    ];
    
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });
    
    // ذخیره تغییرات
    const updatedProduct = await product.save();
    
    res.json({
      success: true,
      message: 'محصول با موفقیت به‌روزرسانی شد',
      data: updatedProduct
    });
  } catch (error) {
    console.error('خطا در به‌روزرسانی محصول:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      
      return res.status(400).json({
        success: false,
        message: 'خطا در اطلاعات ورودی',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطا در به‌روزرسانی محصول',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * حذف محصول
 * DELETE /api/products/:id
 * @access Private (Admin only)
 */
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'محصول یافت نشد'
      });
    }
    
    await product.remove();
    
    res.json({
      success: true,
      message: 'محصول با موفقیت حذف شد'
    });
  } catch (error) {
    console.error('خطا در حذف محصول:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در حذف محصول',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * ثبت نظر جدید برای محصول
 * POST /api/products/:id/reviews
 * @access Private
 */
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'محصول یافت نشد'
      });
    }
    
    // بررسی اینکه کاربر قبلاً نظر داده یا خیر
    const alreadyReviewed = product.reviews.find(
      review => review.user.toString() === req.user.id
    );
    
    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'شما قبلاً برای این محصول نظر ثبت کرده‌اید'
      });
    }
    
    // ایجاد نظر جدید
    const review = {
      name: req.user.fullName,
      rating: Number(rating),
      comment,
      user: req.user.id
    };
    
    // افزودن نظر به آرایه نظرات
    product.reviews.push(review);
    
    // به‌روزرسانی تعداد نظرات
    product.numReviews = product.reviews.length;
    
    // محاسبه میانگین امتیازات
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
    
    // ذخیره تغییرات
    await product.save();
    
    res.status(201).json({
      success: true,
      message: 'نظر شما با موفقیت ثبت شد',
      review
    });
  } catch (error) {
    console.error('خطا در ثبت نظر:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      
      return res.status(400).json({
        success: false,
        message: 'خطا در اطلاعات ورودی',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطا در ثبت نظر',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * دریافت محصولات مرتبط
 * GET /api/products/:id/related
 * @access Public
 */
router.get('/:id/related', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'محصول یافت نشد'
      });
    }
    
    // جستجوی محصولات با همان دسته‌بندی
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category
    })
      .limit(4)
      .select('name price images slug category discount rating');
    
    res.json({
      success: true,
      data: relatedProducts
    });
  } catch (error) {
    console.error('خطا در دریافت محصولات مرتبط:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت محصولات مرتبط',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * دریافت محصولات ویژه
 * GET /api/products/featured
 * @access Public
 */
router.get('/featured', async (req, res) => {
  try {
    const featuredProducts = await Product.find({ isFeatured: true })
      .limit(6)
      .select('name price images slug category discount rating');
    
    res.json({
      success: true,
      data: featuredProducts
    });
  } catch (error) {
    console.error('خطا در دریافت محصولات ویژه:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت محصولات ویژه',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 