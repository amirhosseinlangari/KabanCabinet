 # راهنمای کامل ساختار و کدهای سایت کابینت کابان

این فایل به صورت جامع ساختار صفحات، فایل‌های CSS و JavaScript و نحوه عملکرد هر بخش از سایت را توضیح می‌دهد. هدف این راهنما، آشنایی کامل شما با کدها و کاربرد هر قسمت است.

---

## ۱. ساختار کلی سایت

سایت کابینت کابان از چندین صفحه اصلی تشکیل شده است:
- صفحه اصلی (index.html)
- صفحات محصولات (mahsool)
- صفحه سفارش طراحی سه‌بعدی (3d-designs/order-3d.html)
- صفحه نمونه کارها (portfolio/index.html)
- صفحات حساب کاربری و سبد خرید

هر صفحه معمولاً شامل بخش‌های زیر است:
- نوبار (ناوبری بالای سایت)
- محتوای اصلی (فرم، کارت محصول، گالری و ...)
- فوتر (در برخی صفحات)

---

## ۲. ساختار HTML

### مثال ساختار یک صفحه
```html
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../styles/main.css">
    <title>سفارش طراحی سه‌بعدی</title>
</head>
<body>
    <nav id="nav"> ... </nav>
    <section class="order-3d-section"> ... </section>
    <script src="scripts/order-3d.js"></script>
</body>
</html>
```

### توضیح بخش‌ها:
- `<nav id="nav">` : نوبار سایت شامل منوها و دکمه دارک/لایت مود.
- `<section class="order-3d-section">` : محتوای اصلی صفحه سفارش سه‌بعدی.
- `<script src="..."></script>` : اسکریپت‌های مربوط به عملکرد صفحه.

---

## ۳. استایل‌دهی (CSS)

### فایل‌های اصلی:
- `styles/main.css` : استایل کلی سایت و متغیرهای رنگی.
- `3d-designs/css/order-3d.css` : استایل اختصاصی صفحه سفارش سه‌بعدی.

### مثال و توضیح:
```css
:root {
    --bg-color: #fff;
    --text-color: #000;
    --nav-bg-color: rgb(241, 198, 142);
    ...
}
body.dark-mode {
    --bg-color: #121212;
    --text-color: #f1f1f1;
    ...
}
```
**توضیح:** این کد متغیرهای رنگی را برای حالت روشن و تاریک تعریف می‌کند. با تغییر کلاس `dark-mode` روی body، رنگ کل سایت تغییر می‌کند.

### نمونه استایل فرم:
```css
.order-form-container {
    background: var(--card-bg-color);
    border-radius: 20px;
    box-shadow: 0 10px 30px var(--shadow-color);
    padding: 2rem;
    border: 1px solid var(--card-border-color);
}
```
**توضیح:** این کد ظاهر فرم سفارش را با رنگ و سایه مناسب تنظیم می‌کند.

---

## ۴. اسکریپت‌ها (JavaScript)

### مثال: سوییچ دارک/لایت مود
```js
const darkModeToggle = document.getElementById('darkModeToggle');
if (darkModeToggle) {
    function setDarkMode(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
            darkModeToggle.querySelector('.moon').style.display = 'none';
            darkModeToggle.querySelector('.sun').style.display = 'inline-block';
        } else {
            document.body.classList.remove('dark-mode');
            darkModeToggle.querySelector('.moon').style.display = 'inline-block';
            darkModeToggle.querySelector('.sun').style.display = 'none';
        }
    }
    // Load from localStorage
    const darkPref = localStorage.getItem('darkMode') === 'true';
    setDarkMode(darkPref);
    darkModeToggle.addEventListener('click', function() {
        const isDark = !document.body.classList.contains('dark-mode');
        setDarkMode(isDark);
        localStorage.setItem('darkMode', isDark);
    });
}
```
**توضیح:** این کد دکمه دارک/لایت مود را فعال می‌کند و با کلیک، تم سایت را تغییر می‌دهد و وضعیت را در localStorage ذخیره می‌کند.

### مثال: اعتبارسنجی فرم سفارش سه‌بعدی
```js
function validateForm() {
    const requiredFields = [ ... ];
    let isValid = true;
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (!field || !field.value.trim()) {
            showFieldError(field, 'این فیلد الزامی است');
            isValid = false;
        } else {
            clearFieldError(field);
        }
    });
    ...
    return isValid;
}
```
**توضیح:** این تابع بررسی می‌کند که همه فیلدهای ضروری فرم پر شده باشند و در غیر این صورت پیام خطا نمایش می‌دهد.

### مثال: آپلود و پیش‌نمایش فایل
```js
function handleFileUpload(file, previewContainer, type) {
    if (!file) return;
    if (!validateFileType(file, type)) {
        showNotification('نوع فایل انتخاب شده مجاز نیست', 'error');
        return;
    }
    if (file.size > 10 * 1024 * 1024) {
        showNotification('حجم فایل نباید بیشتر از 10 مگابایت باشد', 'error');
        return;
    }
    createFilePreview(file, previewContainer, type);
    showNotification('فایل با موفقیت آپلود شد', 'success');
}
```
**توضیح:** این تابع فایل انتخاب‌شده را بررسی و اعتبارسنجی می‌کند و در صورت صحیح بودن، پیش‌نمایش آن را نمایش می‌دهد.

---

## ۵. ساختار کارت‌ها و گالری نمونه کار

### مثال کارت نمونه کار:
```html
<div class="portfolio-item mdf">
    <div class="portfolio-image">
        <img src="img/MDF/portfolio_MDF.jpg" alt="نمونه کار کابینت MDF">
        <div class="portfolio-overlay">
            <h3>کابینت MDF آشپزخانه مدرن</h3>
            <p>طراحی و اجرا: تیم کابان</p>
        </div>
    </div>
</div>
```
**توضیح:** هر کارت نمونه کار شامل تصویر، عنوان و توضیح پروژه است. (دکمه مشاهده جزئیات در صورت نیاز حذف می‌شود.)

---

## ۶. نکات مهم و جمع‌بندی
- تمام رنگ‌ها و استایل‌ها با متغیرهای CSS کنترل می‌شوند تا تغییر تم آسان باشد.
- اسکریپت‌ها برای اعتبارسنجی فرم، مدیریت سبد خرید و تغییر تم استفاده می‌شوند.
- ساختار صفحات به صورت ماژولار و قابل توسعه طراحی شده است.

---

**در صورت نیاز به توضیح بیشتر درباره هر بخش یا کد خاص، کافیست نام آن را بپرسید!**
