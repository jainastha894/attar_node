// Hamburger menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (hamburgerBtn && sidebar) {
        hamburgerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle sidebar minimized class
            sidebar.classList.toggle('minimized');
            
            // Toggle main content class to adjust width
            if (mainContent) {
                mainContent.classList.toggle('sidebar-minimized');
            }
        });
    }
});

