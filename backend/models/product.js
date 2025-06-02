const mongoose = require('mongoose');
const slugify = require('slugify');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'نام محصول الزامی است'],
    trim: true,
    maxlength: [100, 'نام محصول نمی‌تواند بیشتر از 100 کاراکتر باشد']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'توضیحات محصول الزامی است'],
    maxlength: [5000, 'توضیحات محصول نمی‌تواند بیشتر از 5000 کاراکتر باشد']
  },
  price: {
    type: Number,
    required: [true, 'قیمت محصول الزامی است'],
    min: [0, 'قیمت محصول نمی‌تواند منفی باشد']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'تخفیف نمی‌تواند منفی باشد'],
    max: [100, 'تخفیف نمی‌تواند بیشتر از 100% باشد']
  },
  images: [
    {
      url: {
        type: String,
        required: true
      },
      alt: {
        type: String,
        default: ''
      },
      isMain: {
        type: Boolean,
        default: false
      }
    }
  ],
  category: {
    type: String,
    required: [true, 'دسته‌بندی محصول الزامی است'],
    enum: [
      'مدرن', 
      'کلاسیک', 
      'نئوکلاسیک', 
      'ممبران', 
      'های گلاس', 
      'فلزی', 
      'روستیک',
      'مینیمال'
    ]
  },
  countInStock: {
    type: Number,
    required: [true, 'تعداد موجودی محصول الزامی است'],
    min: [0, 'تعداد موجودی نمی‌تواند منفی باشد'],
    default: 0
  },
  attributes: {
    type: Map,
    of: String,
    default: {}
  },
  specifications: [
    {
      title: {
        type: String,
        required: true
      },
      value: {
        type: String,
        required: true
      }
    }
  ],
  isFeatured: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [reviewSchema],
  viewCount: {
    type: Number,
    default: 0
  },
  dimensions: {
    length: {
      type: Number,
      min: [0, 'طول نمی‌تواند منفی باشد']
    },
    width: {
      type: Number,
      min: [0, 'عرض نمی‌تواند منفی باشد']
    },
    height: {
      type: Number,
      min: [0, 'ارتفاع نمی‌تواند منفی باشد']
    }
  },
  metaTitle: {
    type: String,
    maxlength: [70, 'عنوان متا نمی‌تواند بیشتر از 70 کاراکتر باشد']
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'توضیحات متا نمی‌تواند بیشتر از 160 کاراکتر باشد']
  },
  metaKeywords: {
    type: String,
    maxlength: [250, 'کلمات کلیدی متا نمی‌تواند بیشتر از 250 کاراکتر باشد']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// محاسبه قیمت نهایی پس از تخفیف
productSchema.virtual('finalPrice').get(function() {
  if (!this.discount || this.discount === 0) {
    return this.price;
  }
  return this.price - (this.price * this.discount / 100);
});

// ایجاد slug از نام محصول قبل از ذخیره
productSchema.pre('save', function(next) {
  // اگر نام تغییر کرده یا محصول جدید است
  if (this.isModified('name') || this.isNew) {
    this.slug = slugify(this.name, {
      lower: true,
      trim: true,
      strict: true,
      locale: 'fa'
    });
    
    // اضافه کردن بخش تصادفی به slug برای جلوگیری از تکراری بودن
    if (this.isNew) {
      const randomString = Math.random().toString(36).substring(2, 7);
      this.slug = `${this.slug}-${randomString}`;
    }
  }
  
  next();
});

// ایجاد شاخص برای جستجوی سریع‌تر
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 