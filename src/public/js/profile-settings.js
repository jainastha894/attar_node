// Profile Settings JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.getElementById('profileSettingsForm');
    const avatarUploadBtn = document.getElementById('avatarUploadBtn');
    const avatarFileInput = document.getElementById('avatarFileInput');
    const profileAvatarImg = document.getElementById('profileAvatarImg');
    const profileAvatarText = document.getElementById('profileAvatarText');
    const profileAvatarContainer = document.getElementById('profileAvatarContainer');
    const removePicBtn = document.getElementById('removePicBtn');
    
    // Admin data from server
    const adminData = window.ADMIN_DATA || null;
    
    // Initialize form with admin data
    if (adminData) {
        // Prefill form fields
        if (document.getElementById('userId')) {
            document.getElementById('userId').value = adminData.username || '';
        }
        if (document.getElementById('fullName')) {
            document.getElementById('fullName').value = adminData.fullName || '';
        }
        if (document.getElementById('email')) {
            document.getElementById('email').value = adminData.email || '';
        }
        if (document.getElementById('phone')) {
            document.getElementById('phone').value = adminData.phone || '';
        }
        if (document.getElementById('bio')) {
            document.getElementById('bio').value = adminData.bio || '';
        }
        
        // Set profile picture
        if (adminData.profilePic) {
            profileAvatarImg.src = adminData.profilePic;
            profileAvatarImg.style.display = 'block';
            profileAvatarText.style.display = 'none';
            // Show remove button
            if (removePicBtn) {
                removePicBtn.style.display = 'flex';
            }
        } else {
            // Show initial letter
            const initial = (adminData.fullName || 'A').charAt(0).toUpperCase();
            profileAvatarText.textContent = initial;
            profileAvatarText.style.display = 'flex';
            profileAvatarImg.style.display = 'none';
            // Hide remove button
            if (removePicBtn) {
                removePicBtn.style.display = 'none';
            }
        }
        
        // Update display name
        if (document.getElementById('profileDisplayName')) {
            document.getElementById('profileDisplayName').textContent = adminData.fullName || 'Admin User';
        }
        if (document.getElementById('profileDisplayRole')) {
            document.getElementById('profileDisplayRole').textContent = adminData.role || 'Administrator';
        }
    }
    
    // Avatar upload button click
    if (avatarUploadBtn && avatarFileInput) {
        avatarUploadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            avatarFileInput.click();
        });
    }
    
    // Handle file selection
    if (avatarFileInput) {
        avatarFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    alert('Please select an image file');
                    return;
                }
                
                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('Image size should be less than 5MB');
                    return;
                }
                
                // Preview image
                const reader = new FileReader();
                reader.onload = function(e) {
                    profileAvatarImg.src = e.target.result;
                    profileAvatarImg.style.display = 'block';
                    profileAvatarText.style.display = 'none';
                    // Show remove button when image is selected
                    if (removePicBtn) {
                        removePicBtn.style.display = 'flex';
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Remove profile picture
    if (removePicBtn) {
        removePicBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            if (!confirm('Are you sure you want to remove your profile picture?')) {
                return;
            }
            
            try {
                const response = await fetch('/admin/profile/remove-pic', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();
                
                if (response.ok && data.success) {
                    // Show initial letter
                    const fullName = document.getElementById('fullName').value || 'A';
                    const initial = fullName.charAt(0).toUpperCase();
                    profileAvatarText.textContent = initial;
                    profileAvatarText.style.display = 'flex';
                    profileAvatarImg.style.display = 'none';
                    profileAvatarImg.src = '';
                    
                    // Clear file input
                    if (avatarFileInput) {
                        avatarFileInput.value = '';
                    }
                    
                    // Hide remove button
                    if (removePicBtn) {
                        removePicBtn.style.display = 'none';
                    }
                    
                    showSuccessMessage('Profile picture removed successfully');
                } else {
                    alert(data.message || 'Failed to remove profile picture');
                }
            } catch (error) {
                console.error('Error removing profile picture:', error);
                alert('Error removing profile picture');
            }
        });
    }
    
    // Form submission
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData();
            formData.append('fullName', document.getElementById('fullName').value);
            formData.append('email', document.getElementById('email').value);
            formData.append('phone', document.getElementById('phone').value);
            formData.append('bio', document.getElementById('bio').value);
            
            // Add profile picture if selected
            if (avatarFileInput && avatarFileInput.files[0]) {
                formData.append('profilePic', avatarFileInput.files[0]);
            }
            
            // Update profile
            try {
                const response = await fetch('/admin/profile/update', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (response.ok && data.success) {
                    showSuccessMessage('Profile updated successfully');
                    
                    // Update display name
                    if (document.getElementById('profileDisplayName')) {
                        document.getElementById('profileDisplayName').textContent = data.admin.fullName || 'Admin User';
                    }
                    
                    // Update avatar text if no picture
                    if (!data.admin.profilePic) {
                        const initial = (data.admin.fullName || 'A').charAt(0).toUpperCase();
                        profileAvatarText.textContent = initial;
                    }
                    
                    // Reload page after 1.5 seconds to show updated data
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    alert(data.message || 'Failed to update profile');
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                alert('Error updating profile');
            }
        });
    }
    
    // Cancel button
    const cancelBtn = document.getElementById('cancelProfileBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            window.location.href = '/admin/profile';
        });
    }
    
    function showSuccessMessage(message) {
        const successDiv = document.getElementById('profileSaveSuccess');
        if (successDiv) {
            successDiv.textContent = message;
            successDiv.style.display = 'block';
            successDiv.classList.add('show');
            
            setTimeout(() => {
                successDiv.style.display = 'none';
                successDiv.classList.remove('show');
            }, 3000);
        }
    }
});

