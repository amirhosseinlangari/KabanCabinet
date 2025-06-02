# کابینت کابان - سیستم مدیریت سفارش‌ها

این بخش، سیستم بک‌اند فروشگاه آنلاین کابینت کابان است که امکان مدیریت سفارش‌ها و صدور فایل‌های اکسل را فراهم می‌کند.

## نیازمندی‌ها

- Node.js (نسخه 14 یا بالاتر)
- MongoDB
- npm یا yarn

## نصب و راه‌اندازی

1. ابتدا وابستگی‌های پروژه را نصب کنید:

```bash
cd backend
npm install
```

2. یک فایل `.env` در پوشه اصلی پروژه ایجاد کنید (یا فایل نمونه `.env` را ویرایش کنید):

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/kaban_cabinet
EXCEL_EXPORT_PATH=./exports
NODE_ENV=development
```

3. برای اجرای سرور در حالت توسعه:

```bash
npm run dev
```

یا برای اجرا در حالت تولید:

```bash
npm start
```

## ساختار پروژه

```
backend/
│
├── models/            # مدل‌های دیتابیس
│   └── Order.js       # مدل سفارش
│
├── routes/            # مسیرهای API
│   └── orderRoutes.js # مسیرهای مرتبط با سفارش
│
├── utils/             # توابع کمکی
│   └── excelExport.js # صدور اکسل
│
├── server.js          # فایل اصلی سرور
├── package.json       # وابستگی‌های پروژه
└── .env               # تنظیمات محیطی
```

## API های موجود

### سفارش‌ها

- `POST /api/orders` - ایجاد سفارش جدید
- `GET /api/orders` - دریافت همه سفارش‌ها (با پشتیبانی از صفحه‌بندی)
- `GET /api/orders/:id` - دریافت جزئیات یک سفارش
- `PUT /api/orders/:id` - به‌روزرسانی یک سفارش
- `DELETE /api/orders/:id` - حذف یک سفارش
- `GET /api/orders/export/excel` - صدور سفارش‌ها به فرمت اکسل

## نمونه استفاده

### ایجاد سفارش جدید

```javascript
fetch('http://localhost:3000/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    customer: {
      name: 'علی محمدی',
      phone: '09121773915',
      email: 'ali@example.com',
      address: {
        province: 'تهران',
        city: 'تهران',
        street: 'خیابان ستارخان'
      }
    },
    items: [
      {
        productName: 'کابینت MDF',
        productType: 'MDF',
        quantity: 2,
        unitPrice: 1200000
      }
    ],
    totalPrice: 2400000,
    discount: 200000,
    finalPrice: 2200000,
    paymentMethod: 'cash'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### صدور فایل اکسل

دریافت فایل اکسل سفارش‌ها در تاریخ مشخص:

```javascript
window.open('http://localhost:3000/api/orders/export/excel?startDate=2023-01-01&endDate=2023-12-31', '_blank');
```

## ادغام با فرانت‌اند

فایل `scripts/orderAPI.js` در پروژه فرانت‌اند را برای ارتباط با این API استفاده کنید. این فایل شامل:

1. مدیریت سبد خرید
2. ارسال سفارش به سرور
3. دانلود اطلاعات سفارش به فرمت اکسل

## نکات امنیتی

در محیط تولید، موارد زیر را رعایت کنید:

1. از HTTPS استفاده کنید
2. تنظیمات CORS را محدود کنید
3. از راهکارهای احراز هویت برای API های مدیریتی استفاده کنید
4. مقادیر حساس را در فایل `.env` قرار دهید و این فایل را در گیت منتشر نکنید 