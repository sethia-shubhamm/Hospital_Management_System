// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Menu toggle functionality for responsive design
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        if (window.innerWidth < 992) {
            const isClickInsideSidebar = sidebar.contains(event.target);
            const isClickOnMenuToggle = menuToggle.contains(event.target);
            
            if (sidebar.classList.contains('active') && !isClickInsideSidebar && !isClickOnMenuToggle) {
                sidebar.classList.remove('active');
            }
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 992 && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });
    
    // Simulate loading data for the chart
    simulateChartData();
});

// Function to simulate chart data
function simulateChartData() {
    const chartPlaceholder = document.querySelector('.chart-placeholder');
    
    if (chartPlaceholder) {
        // This is just a placeholder for where you would initialize a real chart
        // Here we would use a library like Chart.js or ApexCharts
        
        // Example: Display loading message
        const loadingText = document.createElement('div');
        loadingText.textContent = 'Loading chart data...';
        loadingText.className = 'loading-text';
        
        chartPlaceholder.innerHTML = '';
        chartPlaceholder.appendChild(loadingText);
        
        // Simulate loading delay
        setTimeout(() => {
            loadingText.textContent = 'Chart visualization would appear here';
            loadingText.className = 'placeholder-text';
        }, 1500);
    }
}

// Simulate active navigation highlighting
const currentPath = window.location.pathname;
const navLinks = document.querySelectorAll('.sidebar-nav a');

navLinks.forEach(link => {
    if (currentPath.includes(link.getAttribute('href'))) {
        link.parentElement.classList.add('active');
    } else {
        link.parentElement.classList.remove('active');
    }
});

// Add event listeners to view all buttons
const viewAllButtons = document.querySelectorAll('.view-all');
viewAllButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const section = this.closest('.card-header').querySelector('h3').textContent.trim().toLowerCase();
        alert(`View all ${section} would redirect to the complete listing page`);
    });
});

// Add event listener to the search bar
const searchBar = document.querySelector('.search-bar input');
if (searchBar) {
    searchBar.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            alert(`Search query: ${this.value}`);
            this.value = '';
        }
    });
}

// Admin profile dropdown handling
const adminProfile = document.querySelector('.admin-profile');
if (adminProfile) {
    adminProfile.addEventListener('click', function() {
        // This would normally toggle a dropdown menu
        alert('Admin profile clicked - would show profile options');
    });
}

// Status update simulation
const statusElements = document.querySelectorAll('.status');
statusElements.forEach(status => {
    status.addEventListener('click', function() {
        // In a real application, this would open a modal to change status
        const currentStatus = this.textContent.trim();
        alert(`Current status: ${currentStatus}. Click would open status change dialog.`);
    });
}); 