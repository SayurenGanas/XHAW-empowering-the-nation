// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Fee calculation functionality
const calculateBtn = document.getElementById('calculate-btn');
if (calculateBtn) {
    calculateBtn.addEventListener('click', calculateFees);
}

function calculateFees() {
    // Validate form first
    if (!validateForm()) {
        alert('Please fix the errors in the form before calculating fees.');
        return;
    }
    
    // Get selected courses
    const selectedCourses = document.querySelectorAll('input[name="course"]:checked');
    
    if (selectedCourses.length === 0) {
        alert('Please select at least one course.');
        return;
    }
    
    // Calculate subtotal
    let subtotal = 0;
    selectedCourses.forEach(course => {
        subtotal += parseInt(course.getAttribute('data-fee'));
    });
    
    // Apply discount based on number of courses
    let discountRate = 0;
    if (selectedCourses.length === 2) {
        discountRate = 0.05; // 5%
    } else if (selectedCourses.length === 3) {
        discountRate = 0.10; // 10%
    } else if (selectedCourses.length > 3) {
        discountRate = 0.15; // 15%
    }
    
    const discountAmount = subtotal * discountRate;
    const afterDiscount = subtotal - discountAmount;
    const vatAmount = afterDiscount * 0.15; // 15% VAT
    const total = afterDiscount + vatAmount;
    
    // Update UI with calculated values
    document.getElementById('subtotal').textContent = `R${subtotal.toFixed(2)}`;
    document.getElementById('discount').textContent = `R${discountAmount.toFixed(2)} (${(discountRate * 100).toFixed(0)}%)`;
    document.getElementById('vat').textContent = `R${vatAmount.toFixed(2)}`;
    document.getElementById('total').textContent = `R${total.toFixed(2)}`;
    
    // Show fee breakdown
    document.getElementById('fee-breakdown').classList.remove('hidden');
    
    // Scroll to results
    document.getElementById('fee-breakdown').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function validateForm() {
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    const nameError = document.getElementById('name-error');
    const phoneError = document.getElementById('phone-error');
    const emailError = document.getElementById('email-error');
    
    let isValid = true;
    
    // Name validation
    if (!nameInput.value.trim()) {
        nameError.textContent = 'Name is required';
        isValid = false;
    } else {
        nameError.textContent = '';
    }
    
    // Phone validation
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneInput.value.trim()) {
        phoneError.textContent = 'Phone number is required';
        isValid = false;
    } else if (!phoneRegex.test(phoneInput.value)) {
        phoneError.textContent = 'Please enter a valid phone number';
        isValid = false;
    } else {
        phoneError.textContent = '';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim()) {
        emailError.textContent = 'Email is required';
        isValid = false;
    } else if (!emailRegex.test(emailInput.value)) {
        emailError.textContent = 'Please enter a valid email address';
        isValid = false;
    } else {
        emailError.textContent = '';
    }
    
    return isValid;
}

// Store course selections in localStorage for persistence across pages
document.addEventListener('DOMContentLoaded', function() {
    const courseCheckboxes = document.querySelectorAll('input[name="course"]');
    
    // Load saved selections
    courseCheckboxes.forEach(checkbox => {
        const savedState = localStorage.getItem(`course-${checkbox.value}`);
        if (savedState === 'true') {
            checkbox.checked = true;
        }
        
        // Save on change
        checkbox.addEventListener('change', function() {
            localStorage.setItem(`course-${this.value}`, this.checked);
        });
    });
});

// Interactive Map Functionality
let map;
let markers = [];
let venueBounds;

// Venue data with coordinates and information
const venues = {
    'johannesburg-central': {
        name: 'Johannesburg Central',
        lat: -26.195246,
        lng: 28.034088,
        address: '123 Education Street, Braamfontein, Johannesburg',
        color: '#1a4b8c'
    },
    'soweto-campus': {
        name: 'Soweto Campus',
        lat: -26.248539,
        lng: 27.854032,
        address: '456 Empowerment Avenue, Orlando West, Soweto',
        color: '#f9c74f'
    },
    'sandton-branch': {
        name: 'Sandton Branch',
        lat: -26.107566,
        lng: 28.056701,
        address: '789 Knowledge Road, Bryanston, Sandton',
        color: '#2c6cb0'
    }
};

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    setupMapControls();
    setupVenueButtons();
});

function initMap() {
    // Initialize the map centered on Johannesburg
    map = L.map('map').setView([-26.2041, 28.0473], 11);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Create bounds to fit all venues
    venueBounds = L.latLngBounds();

    // Add markers for all venues
    Object.keys(venues).forEach(venueId => {
        const venue = venues[venueId];
        addVenueMarker(venue);
        venueBounds.extend([venue.lat, venue.lng]);
    });

    // Fit map to show all venues
    map.fitBounds(venueBounds, { padding: [20, 20] });
}

function addVenueMarker(venue) {
    // Create custom icon
    const customIcon = L.divIcon({
        html: `<div style="background-color: ${venue.color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        className: 'custom-marker',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
    });

    // Create marker
    const marker = L.marker([venue.lat, venue.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
            <div class="map-popup">
                <h4>${venue.name}</h4>
                <p>${venue.address}</p>
                <button class="btn-popup-select" data-venue="${Object.keys(venues).find(key => venues[key].name === venue.name)}">
                    Select This Location
                </button>
            </div>
        `);

    markers.push(marker);

    // Add click event to popup button
    marker.on('popupopen', function() {
        const popupBtn = document.querySelector('.btn-popup-select');
        if (popupBtn) {
            popupBtn.addEventListener('click', function() {
                const venueId = this.getAttribute('data-venue');
                highlightVenue(venueId);
                map.closePopup();
            });
        }
    });
}

function setupMapControls() {
    const controlButtons = document.querySelectorAll('.map-control-btn');
    
    controlButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            controlButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');

            const venueId = this.getAttribute('data-venue');
            
            if (venueId === 'all') {
                // Show all venues
                markers.forEach(marker => marker.addTo(map));
                map.fitBounds(venueBounds, { padding: [20, 20] });
                removeVenueHighlights();
            } else {
                // Show specific venue
                const venue = venues[venueId];
                if (venue) {
                    // Remove all markers
                    markers.forEach(marker => map.removeLayer(marker));
                    // Add only the selected venue marker
                    const selectedMarker = markers.find(marker => 
                        marker.getLatLng().lat === venue.lat && 
                        marker.getLatLng().lng === venue.lng
                    );
                    if (selectedMarker) {
                        selectedMarker.addTo(map);
                        map.setView([venue.lat, venue.lng], 14);
                        highlightVenue(venueId);
                    }
                }
            }
        });
    });
}

function setupVenueButtons() {
    const venueButtons = document.querySelectorAll('.btn-map-view');
    
    venueButtons.forEach(button => {
        button.addEventListener('click', function() {
            const lat = parseFloat(this.getAttribute('data-lat'));
            const lng = parseFloat(this.getAttribute('data-lng'));
            const venueId = Object.keys(venues).find(key => 
                venues[key].lat === lat && venues[key].lng === lng
            );

            if (venueId) {
                // Update map controls
                const controlButtons = document.querySelectorAll('.map-control-btn');
                controlButtons.forEach(btn => btn.classList.remove('active'));
                const correspondingControl = document.querySelector(`[data-venue="${venueId}"]`);
                if (correspondingControl) {
                    correspondingControl.classList.add('active');
                }

                // Center map on venue
                map.setView([lat, lng], 14);
                
                // Remove all markers
                markers.forEach(marker => map.removeLayer(marker));
                
                // Add only the selected venue marker
                const selectedMarker = markers.find(marker => 
                    marker.getLatLng().lat === lat && 
                    marker.getLatLng().lng === lng
                );
                if (selectedMarker) {
                    selectedMarker.addTo(map);
                    highlightVenue(venueId);
                    
                    // Open popup
                    setTimeout(() => {
                        selectedMarker.openPopup();
                    }, 500);
                }
            }
        });
    });
}

function highlightVenue(venueId) {
    // Remove highlights from all venues
    removeVenueHighlights();
    
    // Add highlight to selected venue
    const venueElement = document.querySelector(`[data-venue="${venueId}"]`);
    if (venueElement) {
        venueElement.classList.add('highlighted');
        
        // Scroll to venue if it's not fully visible
        venueElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
    }
}

function removeVenueHighlights() {
    const venueElements = document.querySelectorAll('.venue');
    venueElements.forEach(venue => {
        venue.classList.remove('highlighted');
    });
}

// Handle window resize to maintain map proportions
window.addEventListener('resize', function() {
    if (map) {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }
});