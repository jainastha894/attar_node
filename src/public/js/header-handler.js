// Hamburger menu toggle functionality
// Note: Sidebar is maximized by default. State persists only during navigation, not across reloads.

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    const body = document.body;
    
    // Remove any preload inline style (shouldn't exist, but just in case)
    const preloadStyle = document.getElementById('sidebar-preload-state');
    if (preloadStyle) {
        preloadStyle.remove();
    }
    
    // Check if we're on mobile/tablet (below 770px)
    function isMobile() {
        return window.innerWidth <= 770;
    }
    
    // Create overlay element for mobile
    function createOverlay() {
        let overlay = document.getElementById('sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'sidebar-overlay';
            overlay.className = 'sidebar-overlay';
            overlay.style.display = 'none';
            body.appendChild(overlay);
            
            // Close sidebar when overlay is clicked
            overlay.addEventListener('click', function() {
                closeSidebar();
            });
        }
        return overlay;
    }
    
    const overlay = createOverlay();
    
    // Function to open sidebar (mobile)
    function openSidebar() {
        if (sidebar) {
            sidebar.classList.add('mobile-open');
            sidebar.classList.remove('minimized');
            if (mainContent) {
                mainContent.classList.remove('sidebar-minimized');
            }
            if (overlay) {
                overlay.style.display = 'block';
            }
            body.style.overflow = 'hidden'; // Prevent body scroll when sidebar is open
        }
    }
    
    // Function to close sidebar (mobile)
    function closeSidebar() {
        if (sidebar) {
            sidebar.classList.remove('mobile-open');
            if (overlay) {
                overlay.style.display = 'none';
            }
            body.style.overflow = ''; // Restore body scroll
        }
    }
    
    // Check sessionStorage for state (only persists during navigation, not across reloads)
    // Default state is maximized (expanded) on desktop, closed on mobile
    let isMinimized = false;
    if (!isMobile()) {
        try {
            const savedState = sessionStorage.getItem('sidebarMinimized');
            if (savedState === 'true') {
                isMinimized = true;
            }
        } catch (e) {
            // sessionStorage not available, use default (maximized)
        }
    }
    
    if (sidebar) {
        // Apply state immediately without transitions
        if (isMobile()) {
            // On mobile, sidebar should be closed by default
            sidebar.classList.remove('mobile-open');
            sidebar.classList.remove('minimized');
            if (mainContent) {
                mainContent.classList.remove('sidebar-minimized');
            }
        } else {
            // On desktop, apply saved minimized state
            if (isMinimized) {
                sidebar.classList.add('minimized');
                if (mainContent) {
                    mainContent.classList.add('sidebar-minimized');
                }
            } else {
                sidebar.classList.remove('minimized');
                if (mainContent) {
                    mainContent.classList.remove('sidebar-minimized');
                }
            }
        }
        
        // Enable transitions after a short delay to prevent flickering on load
        setTimeout(function() {
            sidebar.classList.add('transitions-enabled');
            if (mainContent) {
                mainContent.classList.add('transitions-enabled');
            }
        }, 50);
    }
    
    if (hamburgerBtn && sidebar) {
        hamburgerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Ensure transitions are enabled before toggling
            if (!sidebar.classList.contains('transitions-enabled')) {
                sidebar.classList.add('transitions-enabled');
                if (mainContent) {
                    mainContent.classList.add('transitions-enabled');
                }
            }
            
            if (isMobile()) {
                // Mobile behavior: toggle mobile-open class
                const isOpen = sidebar.classList.contains('mobile-open');
                if (isOpen) {
                    closeSidebar();
                } else {
                    openSidebar();
                }
            } else {
                // Desktop behavior: toggle minimized class
                const isCurrentlyMinimized = sidebar.classList.contains('minimized');
                const willBeMinimized = !isCurrentlyMinimized;
                
                // Update classes
                if (willBeMinimized) {
                    sidebar.classList.add('minimized');
                    if (mainContent) {
                        mainContent.classList.add('sidebar-minimized');
                    }
                } else {
                    sidebar.classList.remove('minimized');
                    if (mainContent) {
                        mainContent.classList.remove('sidebar-minimized');
                    }
                }
                
                // Save state to sessionStorage (persists during navigation, but resets on reload)
                try {
                    sessionStorage.setItem('sidebarMinimized', willBeMinimized.toString());
                } catch (e) {
                    // sessionStorage not available, ignore
                }
            }
        });
    }
    
    // Close sidebar when clicking on a nav item (mobile only)
    if (sidebar) {
        const navItems = sidebar.querySelectorAll('.nav-item');
        navItems.forEach(function(item) {
            item.addEventListener('click', function() {
                if (isMobile()) {
                    setTimeout(function() {
                        closeSidebar();
                    }, 100); // Small delay for navigation
                }
            });
        });
    }
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (isMobile()) {
                // On mobile, ensure sidebar is closed
                closeSidebar();
            } else {
                // On desktop, restore minimized state if it was saved
                if (overlay) {
                    overlay.style.display = 'none';
                }
                body.style.overflow = '';
                const savedState = sessionStorage.getItem('sidebarMinimized');
                if (savedState === 'true') {
                    sidebar.classList.add('minimized');
                    if (mainContent) {
                        mainContent.classList.add('sidebar-minimized');
                    }
                } else {
                    sidebar.classList.remove('minimized');
                    if (mainContent) {
                        mainContent.classList.remove('sidebar-minimized');
                    }
                }
            }
        }, 250);
    });
});

