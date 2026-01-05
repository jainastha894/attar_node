// User profile dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
    const userProfileBtn = document.getElementById('userProfileBtn');
    const userDropdown = document.getElementById('userDropdown');
    const profileSettingsBtn = document.getElementById('profileSettingsBtn');
    const viewProfileBtn = document.getElementById('viewProfileBtn');
    const dropdownLogoutBtn = document.getElementById('dropdownLogoutBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // Toggle dropdown
    if (userProfileBtn && userDropdown) {
        userProfileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
            userProfileBtn.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userProfileBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
                userProfileBtn.classList.remove('active');
            }
        });
    }

    // Profile Settings button
    if (profileSettingsBtn) {
        profileSettingsBtn.addEventListener('click', function() {
            window.location.href = '/admin/profileSetting';
        });
    }

    // View Profile button
    if (viewProfileBtn) {
        viewProfileBtn.addEventListener('click', function() {
            window.location.href = '/admin/profile';
        });
    }

    // Dropdown Logout button
    if (dropdownLogoutBtn) {
        dropdownLogoutBtn.addEventListener('click', function() {
            window.location.href = '/admin/logout';
        });
    }

    // Sidebar Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            window.location.href = '/admin/logout';
        });
    }
});

// Highlight active navigation item in sidebar
(function() {
    function highlightActiveNav() {
        const currentPath = window.location.pathname;
        const navItems = document.querySelectorAll('.sidebar .nav-item');
        
        navItems.forEach(item => {
            item.classList.remove('active');
            const href = item.getAttribute('href');
            if (href) {
                // Exact match first
                if (currentPath === href) {
                    item.classList.add('active');
                }
                // Special cases for detail pages
                else if (currentPath.includes('/products/edit/') && href === '/admin/products') {
                    item.classList.add('active');
                }
                else if (currentPath.includes('/leads/') && href === '/admin/leads') {
                    item.classList.add('active');
                }
                // For /admin/products/add, only highlight Add Product, not All Products
                else if (currentPath === '/admin/products/add' && href === '/admin/products/add') {
                    item.classList.add('active');
                }
                // For /admin/products (list page), only highlight All Products
                else if (currentPath === '/admin/products' && href === '/admin/products' && !currentPath.includes('/add') && !currentPath.includes('/edit')) {
                    item.classList.add('active');
                }
                // For other paths, check if it starts with href (but not for /admin/products to avoid conflicts)
                else if (href !== '/admin/products' && href !== '/admin/products/add' && currentPath.startsWith(href)) {
                    item.classList.add('active');
                }
            }
        });
    }
    
    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', highlightActiveNav);
    } else {
        highlightActiveNav();
    }
})();

