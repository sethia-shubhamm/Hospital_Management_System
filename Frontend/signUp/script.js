const sliderButtons = document.querySelectorAll('.slider button');

if (sliderButtons.length > 0) {
    sliderButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            sliderButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
        });
    });
}

const signUpForm = document.getElementById('signUpForm');
const signUpStatus = document.getElementById('signUpStatus');

signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const age = document.getElementById('age').value;
    
    // Get selected gender
    const maleRadio = document.getElementById('male');
    const femaleRadio = document.getElementById('female');
    const gender = maleRadio.checked ? 'male' : (femaleRadio.checked ? 'female' : '');
    
    const contact = document.getElementById('contact').value;
    const address = document.getElementById('address').value;
    const bloodGroup = document.getElementById('bloodGroup').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Basic form validation
    if (!email || !password || !name || !age || !gender || !contact || !address || !bloodGroup || !confirmPassword) {
        signUpStatus.innerHTML = '<div class="alert alert-danger">Please fill in all fields</div>';
        return;
    }
    
    // Password validation
    if (password !== confirmPassword) {
        signUpStatus.innerHTML = '<div class="alert alert-danger">Passwords do not match</div>';
        return;
    }
    
    try {
        const response = await fetch('/api/signUp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, age, gender, contact, address, bloodGroup, confirmPassword })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            signUpStatus.innerHTML = '<div class="alert alert-success">SignUp successful! Redirecting...</div>';
            setTimeout(() => {
                window.location.href = '/patientPage/dashboard/index.html';
            }, 1500);
        } else {
            signUpStatus.innerHTML = `<div class="alert alert-danger">${data.message || 'SignUp failed'}</div>`;
        }
    } catch (error) {
        signUpStatus.innerHTML = '<div class="alert alert-danger">Server error. Please try again later.</div>';
        console.error('SignUp error:', error);
    }
});