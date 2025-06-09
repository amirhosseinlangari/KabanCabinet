// Profile Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Get theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');
    const themeText = themeToggle.querySelector('span');

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeButton(true);
    }

    // Theme toggle click handler
    themeToggle.addEventListener('click', function() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            updateThemeButton(false);
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            updateThemeButton(true);
        }
    });

    // Update theme button appearance
    function updateThemeButton(isDark) {
        if (isDark) {
            themeIcon.className = 'fas fa-sun';
            themeText.textContent = 'حالت روشن';
        } else {
            themeIcon.className = 'fas fa-moon';
            themeText.textContent = 'حالت تاریک';
        }
    }

    // Handle navigation
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.profile-section');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Show corresponding section
            const targetId = this.getAttribute('href').substring(1);
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Form Submission
    const profileForm = document.getElementById('profileForm');
    
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value
        };
        
        // Here you would typically send the data to your server
        console.log('Profile data:', formData);
        
        // Show success message
        showNotification('اطلاعات با موفقیت ذخیره شد', 'success');
    });

    // Notification System
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Load User Data
    function loadUserData() {
        // Get user data from localStorage
        const userData = JSON.parse(localStorage.getItem('kabanUser'));
        
        if (!userData) {
            // Redirect to login page if no user data found
            window.location.href = '/account/login.html';
            return;
        }
        
        // Populate form fields
        document.getElementById('fullName').value = `${userData.firstName} ${userData.lastName}`;
        document.getElementById('email').value = userData.email || '';
        document.getElementById('phone').value = userData.mobile || '';
        document.getElementById('address').value = userData.address || '';
        
        // Update header
        document.getElementById('userName').textContent = `${userData.firstName} ${userData.lastName}`;
        document.getElementById('userEmail').textContent = userData.email || '';
        
        // Show the info section by default
        document.getElementById('info').classList.add('active');
    }

    // Initialize
    loadUserData();
});

 
 