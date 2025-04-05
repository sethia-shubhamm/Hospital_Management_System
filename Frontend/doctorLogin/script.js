const sliderButtons = document.querySelectorAll('.slider button');

sliderButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        sliderButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');
    });
});

// Get form elements
const loginForm = document.getElementById('loginForm');
const loginStatus = document.getElementById('loginStatus');
const tryDemoBtn = document.getElementById('tryDemoBtn');

// Try Demo button functionality
tryDemoBtn.addEventListener('click', function() {
    // Fill in the form with demo credentials
    document.getElementById('mail').value = 'doctor@hospital.com';
    document.getElementById('pass').value = 'doctor1234';
    
    // Show loading status
    loginStatus.innerHTML = '<div class="alert alert-info">Logging in with demo doctor account...</div>';
    
    // Simulate login process
    setTimeout(() => {
        loginStatus.innerHTML = '<div class="alert alert-success">Demo login successful! Redirecting...</div>';
        
        // Redirect to doctor dashboard
        setTimeout(() => {
            window.location.href = '../doctorPage/dashboard/index.html';
        }, 1000);
    }, 1500);
});

// Add submit event to form
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('mail').value;
    const password = document.getElementById('pass').value;
    
    // Set user type as doctor for this login page
    const userType = 'doctor';
    
    // Basic validation
    if (!email || !password) {
        loginStatus.innerHTML = '<div class="alert alert-danger">Please fill in all fields</div>';
        return;
    }
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, userType })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            loginStatus.innerHTML = '<div class="alert alert-success">Login successful! Redirecting...</div>';
            // Redirect to dashboard after successful login
            setTimeout(() => {
                window.location.href = '../doctorPage/dashboard/index.html';
            }, 1500);
        } else {
            loginStatus.innerHTML = `<div class="alert alert-danger">${data.message || 'Login failed'}</div>`;
        }
    } catch (error) {
        loginStatus.innerHTML = '<div class="alert alert-danger">Server error. Please try again later.</div>';
        console.error('Login error:', error);
    }
});