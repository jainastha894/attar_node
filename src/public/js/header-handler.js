// Hamburger menu toggle functionality
// Note: Sidebar is maximized by default. State persists only during navigation, not across reloads.

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    // Remove any preload inline style (shouldn't exist, but just in case)
    const preloadStyle = document.getElementById('sidebar-preload-state');
    if (preloadStyle) {
        preloadStyle.remove();
    }
    
    // Check sessionStorage for state (only persists during navigation, not across reloads)
    // Default state is maximized (expanded)
    let isMinimized = false;
    try {
        const savedState = sessionStorage.getItem('sidebarMinimized');
        if (savedState === 'true') {
            isMinimized = true;
        }
    } catch (e) {
        // sessionStorage not available, use default (maximized)
    }
    
    if (sidebar) {
        // Apply state immediately without transitions
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
            
            // Toggle sidebar minimized class
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
        });
    }
});

