// Mobile Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            const isHidden = mobileMenu.classList.contains('hidden');
            
            if (isHidden) {
                mobileMenu.classList.remove('hidden');
                mobileMenu.style.maxHeight = '0';
                mobileMenu.style.opacity = '0';
                
                requestAnimationFrame(() => {
                    mobileMenu.style.transition = 'all 0.3s ease';
                    mobileMenu.style.maxHeight = '300px';
                    mobileMenu.style.opacity = '1';
                });
            } else {
                mobileMenu.style.maxHeight = '0';
                mobileMenu.style.opacity = '0';
                
                setTimeout(() => {
                    mobileMenu.classList.add('hidden');
                }, 300);
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                if (!mobileMenu.classList.contains('hidden')) {
                    mobileMenu.style.maxHeight = '0';
                    mobileMenu.style.opacity = '0';
                    setTimeout(() => {
                        mobileMenu.classList.add('hidden');
                    }, 300);
                }
            }
        });
    }
});