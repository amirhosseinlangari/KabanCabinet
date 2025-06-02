// Profile page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get user data from localStorage
    const user = JSON.parse(localStorage.getItem('kabanUser'));
    const token = localStorage.getItem('kabanToken') || sessionStorage.getItem('kabanToken');
    
    // Redirect to login page if user is not logged in
    if (!user || !token) {
        window.location.href = '/account/login.html';
        return;
    }
    
    // DOM elements
    const userNameElements = document.querySelectorAll('.user-name');
    const userEmailElement = document.getElementById('userEmail');
    const profileForm = document.getElementById('profileForm');
    const passwordForm = document.getElementById('passwordForm');
    const addressForm = document.getElementById('addressForm');
    const addAddressBtn = document.getElementById('addAddressBtn');
    const cancelAddressBtn = document.getElementById('cancelAddressBtn');
    const newAddressForm = document.getElementById('newAddressForm');
    const addressItems = document.getElementById('addressItems');
    const noAddress = document.getElementById('noAddress');
    
    // Tab navigation
    setupTabNavigation();
    
    // Update user info in sidebar
    updateUserInfo();
    
    // Fill profile form with user data
    fillProfileForm();
    
    // Load user addresses
    loadAddresses();
    
    // Address form toggle
    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', function() {
            addressForm.style.display = 'block';
        });
    }
    
    if (cancelAddressBtn) {
        cancelAddressBtn.addEventListener('click', function() {
            addressForm.style.display = 'none';
            newAddressForm.reset();
        });
    }
    
    // Profile form submit event
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const address = document.getElementById('address').value;
            
            // Split full name into first and last name
            const nameParts = fullName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            // Validate data
            if (!fullName) {
                showNotification('لطفا نام و نام خانوادگی خود را وارد کنید', 'error');
                return;
            }
            
            if (phone && !isValidMobile(phone)) {
                showNotification('لطفا یک شماره موبایل معتبر وارد کنید', 'error');
                return;
            }
            
            // Show loading
            const submitButton = this.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="loading-spinner"></span> در حال پردازش...';
            
            try {
                // Get current user data
                const userData = JSON.parse(localStorage.getItem('kabanUser')) || {};
                
                // Update user data
                const updatedUserData = {
                    ...userData,
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    mobile: phone,
                    address: address
                };
                
                // Save updated user data
                localStorage.setItem('kabanUser', JSON.stringify(updatedUserData));
                
                // Update sidebar info
                const userNameElement = document.getElementById('userName');
                const userEmailElement = document.getElementById('userEmail');
                
                if (userNameElement) {
                    userNameElement.textContent = `${firstName} ${lastName}`;
                }
                
                if (userEmailElement) {
                    userEmailElement.textContent = email;
                }
                
                // Show success message
                showNotification('اطلاعات شما با موفقیت به‌روزرسانی شد', 'success');
                
                // Reset button state
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-save"></i> ذخیره تغییرات';
                
                // Redirect to homepage after successful update
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 1500);
            } catch (error) {
                console.error('Error updating user data:', error);
                showNotification('خطا در ذخیره اطلاعات', 'error');
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-save"></i> ذخیره تغییرات';
            }
        });
    }
    
    // Password form submit event
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            changePassword();
        });
    }
    
    // New address form submit event
    if (newAddressForm) {
        newAddressForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addNewAddress();
        });
    }
    
    // Function to update user info in sidebar
    function updateUserInfo() {
        const userData = JSON.parse(localStorage.getItem('kabanUser'));
        if (!userData) return;
        
        // Update user name and email in sidebar
        const userNameElements = document.querySelectorAll('.user-name');
        const userEmailElement = document.getElementById('userEmail');
        
        if (userNameElements) {
            userNameElements.forEach(element => {
                element.textContent = `${userData.firstName} ${userData.lastName}`;
            });
        }
        
        if (userEmailElement) {
            userEmailElement.textContent = userData.email || '';
        }
    }
    
    // Function to fill profile form with user data
    function fillProfileForm() {
        if (!profileForm) return;
        
        const userData = JSON.parse(localStorage.getItem('kabanUser'));
        if (!userData) return;
        
        document.getElementById('fullName').value = `${userData.firstName} ${userData.lastName}`.trim();
        document.getElementById('email').value = userData.email || '';
        document.getElementById('phone').value = userData.mobile || '';
        document.getElementById('address').value = userData.address || '';
    }
    
    // Function to change password
    function changePassword() {
        // Get form data
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;
        
        // Validate data
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            showNotification('لطفا تمام فیلدها را پر کنید', 'error');
            return;
        }
        
        if (newPassword.length < 8) {
            showNotification('رمز عبور جدید باید حداقل 8 کاراکتر باشد', 'error');
            return;
        }
        
        if (newPassword !== confirmNewPassword) {
            showNotification('تکرار رمز عبور جدید مطابقت ندارد', 'error');
            return;
        }
        
        // For demo purposes, we'll just check if the current password is 'password'
        if (currentPassword !== 'password') {
            showNotification('رمز عبور فعلی اشتباه است', 'error');
            return;
        }
        
        // Show loading
        showLoading('changePasswordBtn');
        
        // Simulate API call delay
        setTimeout(() => {
            // In a real application, this would call an API to change the password
            
            // Reset form
            passwordForm.reset();
            
            // Show success message
            showNotification('رمز عبور شما با موفقیت تغییر کرد', 'success');
            
            // Hide loading
            hideLoading('changePasswordBtn');
        }, 1000);
    }
    
    // Function to load user addresses
    function loadAddresses() {
        // Get addresses from localStorage
        const addresses = JSON.parse(localStorage.getItem('kabanAddresses')) || [];
        
        // Update UI
        if (addresses.length > 0) {
            if (noAddress) noAddress.style.display = 'none';
            renderAddresses(addresses);
        } else {
            if (noAddress) noAddress.style.display = 'block';
            if (addressItems) addressItems.innerHTML = '';
        }
    }
    
    // Function to render addresses
    function renderAddresses(addresses) {
        if (!addressItems) return;
        
        addressItems.innerHTML = '';
        
        addresses.forEach((address, index) => {
            const addressElement = document.createElement('div');
            addressElement.className = 'address-item';
            addressElement.dataset.id = index;
            
            addressElement.innerHTML = `
                <div class="address-header">
                    <h3>${address.title}</h3>
                    <div class="address-actions">
                        <button class="btn btn-sm btn-edit-address">ویرایش</button>
                        <button class="btn btn-sm btn-delete-address">حذف</button>
                    </div>
                </div>
                <div class="address-details">
                    <p>${address.city} - ${address.fullAddress}</p>
                    <p>کد پستی: ${address.postalCode}</p>
                    <p>تلفن: ${address.phone}</p>
                </div>
            `;
            
            addressItems.appendChild(addressElement);
            
            // Add event listeners
            const deleteBtn = addressElement.querySelector('.btn-delete-address');
            const editBtn = addressElement.querySelector('.btn-edit-address');
            
            deleteBtn.addEventListener('click', () => {
                deleteAddress(index);
            });
            
            editBtn.addEventListener('click', () => {
                editAddress(index);
            });
        });
    }
    
    // Function to add new address
    function addNewAddress() {
        // Get form data
        const title = document.getElementById('addressTitle').value;
        const city = document.getElementById('addressCity').value;
        const fullAddress = document.getElementById('addressFull').value;
        const postalCode = document.getElementById('addressPostalCode').value;
        const phone = document.getElementById('addressPhone').value;
        
        // Validate data
        if (!title || !city || !fullAddress || !postalCode || !phone) {
            showNotification('لطفا تمام فیلدها را پر کنید', 'error');
            return;
        }
        
        // Get addresses from localStorage
        const addresses = JSON.parse(localStorage.getItem('kabanAddresses')) || [];
        
        // Add new address
        addresses.push({
            title,
            city,
            fullAddress,
            postalCode,
            phone
        });
        
        // Save addresses to localStorage
        localStorage.setItem('kabanAddresses', JSON.stringify(addresses));
        
        // Reset form and hide it
        newAddressForm.reset();
        addressForm.style.display = 'none';
        
        // Update UI
        loadAddresses();
        
        // Show success message
        showNotification('آدرس جدید با موفقیت اضافه شد', 'success');
    }
    
    // Function to delete address
    function deleteAddress(index) {
        // Get addresses from localStorage
        const addresses = JSON.parse(localStorage.getItem('kabanAddresses')) || [];
        
        // Remove address
        addresses.splice(index, 1);
        
        // Save addresses to localStorage
        localStorage.setItem('kabanAddresses', JSON.stringify(addresses));
        
        // Update UI
        loadAddresses();
        
        // Show success message
        showNotification('آدرس با موفقیت حذف شد', 'success');
    }
    
    // Function to edit address
    function editAddress(index) {
        // Get addresses from localStorage
        const addresses = JSON.parse(localStorage.getItem('kabanAddresses')) || [];
        
        // Get address to edit
        const address = addresses[index];
        
        // Show address form
        addressForm.style.display = 'block';
        
        // Fill form with address data
        document.getElementById('addressTitle').value = address.title;
        document.getElementById('addressCity').value = address.city;
        document.getElementById('addressFull').value = address.fullAddress;
        document.getElementById('addressPostalCode').value = address.postalCode;
        document.getElementById('addressPhone').value = address.phone;
        
        // Update form submit event to update address instead of adding new one
        newAddressForm.onsubmit = function(e) {
            e.preventDefault();
            
            // Get form data
            const title = document.getElementById('addressTitle').value;
            const city = document.getElementById('addressCity').value;
            const fullAddress = document.getElementById('addressFull').value;
            const postalCode = document.getElementById('addressPostalCode').value;
            const phone = document.getElementById('addressPhone').value;
            
            // Validate data
            if (!title || !city || !fullAddress || !postalCode || !phone) {
                showNotification('لطفا تمام فیلدها را پر کنید', 'error');
                return;
            }
            
            // Update address
            addresses[index] = {
                title,
                city,
                fullAddress,
                postalCode,
                phone
            };
            
            // Save addresses to localStorage
            localStorage.setItem('kabanAddresses', JSON.stringify(addresses));
            
            // Reset form and hide it
            newAddressForm.reset();
            addressForm.style.display = 'none';
            
            // Reset form submit event
            newAddressForm.onsubmit = function(e) {
                e.preventDefault();
                addNewAddress();
            };
            
            // Update UI
            loadAddresses();
            
            // Show success message
            showNotification('آدرس با موفقیت ویرایش شد', 'success');
        };
    }
    
    // Function to setup tab navigation
    function setupTabNavigation() {
        const tabLinks = document.querySelectorAll('.account-menu a');
        const tabContents = document.querySelectorAll('.account-tab');
        
        tabLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Skip for logout button
                if (this.id === 'logoutBtn') return;
                
                e.preventDefault();
                
                // Get tab ID from href
                const tabId = this.getAttribute('href').substring(1);
                
                // Remove active class from all tabs and links
                tabLinks.forEach(link => {
                    link.parentElement.classList.remove('active');
                });
                
                tabContents.forEach(tab => {
                    tab.classList.remove('active');
                });
                
                // Add active class to current tab and link
                this.parentElement.classList.add('active');
                document.getElementById(tabId).classList.add('active');
                
                // Update URL hash
                window.location.hash = tabId;
            });
        });
        
        // Check if URL has hash and activate corresponding tab
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            tabLinks.forEach(link => {
                link.parentElement.classList.remove('active');
            });
            
            tabContents.forEach(tab => {
                tab.classList.remove('active');
            });
            
            const activeLink = document.querySelector(`.account-menu a[href="#${hash}"]`);
            if (activeLink) {
                activeLink.parentElement.classList.add('active');
                document.getElementById(hash).classList.add('active');
            }
        }
    }
    
    // Helper functions
    function isValidMobile(mobile) {
        // Simple mobile validation for Iranian numbers
        const mobileRegex = /^09[0-9]{9}$/;
        return mobileRegex.test(mobile);
    }
    
    function showNotification(message, type = 'success') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('profile-notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'profile-notification';
            notification.className = `profile-notification ${type}`;
            document.body.appendChild(notification);
            
            // Add style for notification
            const style = document.createElement('style');
            style.textContent = `
                .profile-notification {
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    padding: 15px 25px;
                    border-radius: 30px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
                    z-index: 1000;
                    transform: translateY(-100px);
                    opacity: 0;
                    transition: all 0.5s ease;
                }
                .profile-notification.success {
                    background-color: #f1c68e;
                    color: #fff;
                }
                .profile-notification.error {
                    background-color: #e74c3c;
                    color: #fff;
                }
                .profile-notification.show {
                    transform: translateY(0);
                    opacity: 1;
                }
                body.dark-mode .profile-notification.success {
                    background-color: #e6a95f;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
                }
                body.dark-mode .profile-notification.error {
                    background-color: #c0392b;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
                }
            `;
            document.head.appendChild(style);
        }
        
        // Set message and show notification
        notification.textContent = message;
        notification.className = `profile-notification ${type}`;
        notification.classList.add('show');
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    function showLoading(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = true;
            button.innerHTML = '<span class="loading-spinner"></span> در حال پردازش...';
        }
    }
    
    function hideLoading(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = false;
            if (buttonId === 'updateProfileBtn') {
                button.textContent = 'به‌روزرسانی اطلاعات';
            } else if (buttonId === 'changePasswordBtn') {
                button.textContent = 'تغییر رمز عبور';
            }
        }
    }
}); 