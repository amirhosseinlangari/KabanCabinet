// Account management functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
            
            // Simulate login (in a real application, this would be an API call)
            if (email && password) {
                // Store user data
                const userData = {
                    email: email,
                    name: email.split('@')[0], // Simple name generation
                    lastLogin: new Date().toISOString()
                };
                
                // Store in appropriate storage based on remember me
                if (remember) {
                    localStorage.setItem('kabanUser', JSON.stringify(userData));
                    localStorage.setItem('kabanToken', 'dummy-token-' + Date.now());
                } else {
                    sessionStorage.setItem('kabanUser', JSON.stringify(userData));
                    sessionStorage.setItem('kabanToken', 'dummy-token-' + Date.now());
                }
                
                // Show success message
                showNotification('ورود موفقیت‌آمیز بود', 'success');
                
                // Get redirect URL from session storage
                const redirectUrl = sessionStorage.getItem('loginRedirect');
                
                // Clear redirect URL from session storage
                sessionStorage.removeItem('loginRedirect');
                
                // Redirect after a short delay
                setTimeout(() => {
                    if (redirectUrl) {
                        window.location.href = decodeURIComponent(redirectUrl);
                    } else {
                        window.location.href = 'profile.html';
                    }
                }, 1000);
            } else {
                showNotification('لطفا ایمیل و رمز عبور را وارد کنید', 'error');
            }
        });
    }
    
    // Function to show notification
    function showNotification(message, type = 'success') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('account-notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'account-notification';
            notification.className = `account-notification ${type}`;
            document.body.appendChild(notification);
            
            // Add style for notification
            const style = document.createElement('style');
            style.textContent = `
                .account-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 25px;
                    border-radius: 8px;
                    color: #fff;
                    font-size: 0.9rem;
                    z-index: 1000;
                    opacity: 0;
                    transform: translateY(-20px);
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                
                .account-notification.success {
                    background-color: #2ecc71;
                }
                
                .account-notification.error {
                    background-color: #e74c3c;
                }
                
                .account-notification.show {
                    opacity: 1;
                    transform: translateY(0);
                }
            `;
            document.head.appendChild(style);
        }
        
        // Update notification content and type
        notification.textContent = message;
        notification.className = `account-notification ${type}`;
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}); 