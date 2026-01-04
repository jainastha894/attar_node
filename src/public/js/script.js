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

