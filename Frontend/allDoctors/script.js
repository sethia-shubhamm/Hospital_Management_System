document.addEventListener('DOMContentLoaded', function() {
    // Get filter elements
    const specialtyFilter = document.getElementById('specialtyFilter');
    const searchInput = document.getElementById('searchDoctor');
    const doctorCards = document.querySelectorAll('.doctor-card');
    
    // Add event listeners
    specialtyFilter.addEventListener('change', filterDoctors);
    searchInput.addEventListener('input', filterDoctors);
    
    // Book appointment buttons
    const bookButtons = document.querySelectorAll('.book-btn');
    bookButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get doctor information
            const doctorCard = this.closest('.doctor-card');
            const doctorName = doctorCard.querySelector('h3').textContent;
            const doctorSpecialty = doctorCard.querySelector('.specialty').textContent;
            const doctorId = doctorCard.closest('[data-specialty]').getAttribute('data-specialty') + '-' + 
                             doctorName.toLowerCase().replace(/[^a-z0-9]/g, '-');
            
            // Set values in the form
            document.getElementById('doctorId').value = doctorId;
            document.getElementById('doctorName').value = doctorName;
            document.getElementById('doctorSpecialty').value = doctorSpecialty;
            
            // Update modal title
            document.getElementById('appointmentModalLabel').textContent = `Book Appointment with ${doctorName}`;
            
            // Set minimum date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('appointmentDate').min = today;
            
            // Open the modal
            const appointmentModal = new bootstrap.Modal(document.getElementById('appointmentModal'));
            appointmentModal.show();
        });
    });
    
    // Handle form submission
    document.getElementById('submitAppointment').addEventListener('click', function() {
        const form = document.getElementById('appointmentForm');
        
        // Basic form validation
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // Get form data
        const formData = {
            doctorId: document.getElementById('doctorId').value,
            doctorName: document.getElementById('doctorName').value,
            doctorSpecialty: document.getElementById('doctorSpecialty').value,
            patientName: document.getElementById('patientName').value,
            patientEmail: document.getElementById('patientEmail').value,
            patientPhone: document.getElementById('patientPhone').value,
            appointmentDate: document.getElementById('appointmentDate').value,
            appointmentTime: document.getElementById('appointmentTime').value,
            reason: document.getElementById('reason').value
        };
        
        // In a real application, you would send this data to a server
        console.log('Appointment data:', formData);
        
        // Create a formatted date
        const appointmentDate = new Date(formData.appointmentDate);
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = appointmentDate.toLocaleDateString('en-US', dateOptions);
        
        // Display appointment summary
        const summaryHTML = `
            <p><strong>Doctor:</strong> ${formData.doctorName} (${formData.doctorSpecialty})</p>
            <p><strong>Patient:</strong> ${formData.patientName}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formData.appointmentTime}</p>
            <p><strong>Reason:</strong> ${formData.reason}</p>
            <p><strong>Reference #:</strong> ${generateAppointmentId()}</p>
        `;
        
        document.getElementById('appointmentSummary').innerHTML = summaryHTML;
        
        // Close appointment modal and show success modal
        bootstrap.Modal.getInstance(document.getElementById('appointmentModal')).hide();
        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
        successModal.show();
        
        // Reset form
        form.reset();
    });
    
    // Generate a random appointment ID
    function generateAppointmentId() {
        return 'APPT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    
    // Filter function
    function filterDoctors() {
        const specialtyValue = specialtyFilter.value.toLowerCase();
        const searchValue = searchInput.value.toLowerCase();
        
        // Loop through all doctor cards
        doctorCards.forEach(card => {
            const cardContainer = card.closest('[data-specialty]');
            const specialty = cardContainer.getAttribute('data-specialty');
            const doctorName = card.querySelector('h3').textContent.toLowerCase();
            const doctorDescription = card.querySelector('.description').textContent.toLowerCase();
            
            // Check if card matches both filters
            const matchesSpecialty = specialtyValue === 'all' || specialty === specialtyValue;
            const matchesSearch = doctorName.includes(searchValue) || doctorDescription.includes(searchValue);
            
            // Show or hide card
            if (matchesSpecialty && matchesSearch) {
                cardContainer.style.display = 'block';
            } else {
                cardContainer.style.display = 'none';
            }
        });
        
        // Check if no results
        checkNoResults();
    }
    
    // Check if no results to display a message
    function checkNoResults() {
        const visibleCards = document.querySelectorAll('[data-specialty]:not([style*="display: none"])');
        const doctorsGrid = document.querySelector('.doctors-grid .row');
        
        // Remove existing no results message if exists
        const existingMessage = document.getElementById('no-results-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Add message if no results
        if (visibleCards.length === 0) {
            const message = document.createElement('div');
            message.id = 'no-results-message';
            message.className = 'col-12 text-center my-5';
            message.innerHTML = `
                <div class="alert alert-info">
                    <h4>No doctors found</h4>
                    <p>Try changing your search criteria or select 'All Specialties'.</p>
                </div>
            `;
            doctorsGrid.appendChild(message);
        }
    }
    
    // Create image folder if not exists and prepare default image handling
    function handleImageError(img) {
        img.onerror = null;
        img.src = '../signUp/images/logo.png'; // Default fallback image
        img.parentElement.classList.add('missing-image');
        img.style.opacity = '0.7';
    }
    
    // Add error handling to doctor images
    document.querySelectorAll('.doctor-image img').forEach(img => {
        img.onerror = function() {
            handleImageError(this);
        };
    });
}); 