<<<<<<< HEAD
// Global variables for FREE version using OpenStreetMap
let map;
let markers = [];
let currentRoute = null;
let routingControl = null;

// Initialize the map when the page loads
function initMap() {
    // Create map centered on a default location (New York City)
    map = L.map('map').setView([40.7128, -74.0060], 10);
    
    // Add OpenStreetMap tiles (FREE)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    console.log('OpenStreetMap initialized successfully - FREE version!');
}

// Add a new destination input field
function addDestination() {
    const destinationsList = document.getElementById('destinations-list');
    const destinationCount = destinationsList.children.length + 1;
    
    const newDestination = document.createElement('div');
    newDestination.className = 'destination-item';
    newDestination.innerHTML = `
        <label>Destination ${destinationCount}</label>
        <input type="text" class="destination-input" placeholder="Enter destination">
        <button class="remove-dest" onclick="removeDestination(this)"><i class="fas fa-times"></i></button>
    `;
    
    destinationsList.appendChild(newDestination);
    updateDestinationLabels();
}

// Remove a destination input field
function removeDestination(button) {
    const destinationItem = button.parentElement;
    destinationItem.remove();
    updateDestinationLabels();
}

// Update destination labels after adding/removing destinations
function updateDestinationLabels() {
    const destinationItems = document.querySelectorAll('.destination-item');
    destinationItems.forEach((item, index) => {
        const label = item.querySelector('label');
        label.textContent = `Destination ${index + 1}`;
    });
}

// Calculate route between destinations using free services
async function calculateRoute() {
    try {
        showLoading();
        
        // Get input values
        const startPoint = document.getElementById('start-point').value.trim();
        const destinationInputs = document.querySelectorAll('.destination-input');
        const destinations = Array.from(destinationInputs)
            .map(input => input.value.trim())
            .filter(value => value !== '');
        
        const travelMode = document.getElementById('travel-mode').value;
        const optimization = document.getElementById('route-optimization').value;
        
        // Validate inputs
        if (!startPoint) {
            throw new Error('Please enter a starting point');
        }
        
        if (destinations.length === 0) {
            throw new Error('Please add at least one destination');
        }
        
        // Clear previous route
        clearRoute();
        
        // Geocode addresses to coordinates (using free Nominatim service)
        const startCoords = await geocodeAddress(startPoint);
        const destCoords = await geocodeAddress(destinations[0]);
        
        if (!startCoords || !destCoords) {
            throw new Error('Could not find coordinates for one or more locations');
        }
        
        // Calculate route using free OSRM service
        const route = await calculateRouteOSRM(startCoords, destCoords, travelMode);
        
        // Display the route
        displayRoute(route, startCoords, destCoords);
        
        // Show route information
        showRouteInfo(route);
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        showError(`Route calculation failed: ${error.message}`);
        console.error('Route calculation error:', error);
    }
}

// Geocode address using free Nominatim service
async function geocodeAddress(address) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        }
        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

// Calculate route using free OSRM service
async function calculateRouteOSRM(start, end, mode) {
    try {
        const profile = mode === 'driving' ? 'driving' : mode === 'walking' ? 'walking' : 'cycling';
        const response = await fetch(`https://router.project-osrm.org/route/v1/${profile}/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`);
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
            return data.routes[0];
        }
        throw new Error('No route found');
    } catch (error) {
        console.error('OSRM routing error:', error);
        throw new Error('Failed to calculate route');
    }
}

// Display the calculated route on the map
function displayRoute(route, start, end) {
    // Store current route
    currentRoute = { route, start, end };
    
    // Add start marker
    const startMarker = L.marker(start, {
        icon: L.divIcon({
            className: 'custom-marker start-marker',
            html: '<div style="background: #4CAF50; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">A</div>',
            iconSize: [24, 24]
        })
    }).addTo(map);
    
    // Add end marker
    const endMarker = L.marker(end, {
        icon: L.divIcon({
            className: 'custom-marker end-marker',
            html: '<div style="background: #F44336; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">B</div>',
            iconSize: [24, 24]
        })
    }).addTo(map);
    
    // Add route line
    const routeLine = L.geoJSON(route.geometry, {
        style: {
            color: '#667eea',
            weight: 5,
            opacity: 0.8
        }
    }).addTo(map);
    
    // Store markers and route
    markers = [startMarker, endMarker];
    currentRoute.routeLine = routeLine;
    
    // Fit map to show entire route
    const bounds = L.latLngBounds([start, end]);
    map.fitBounds(bounds, { padding: [20, 20] });
    
    console.log('Route displayed successfully using OpenStreetMap!');
}

// Clear the current route
function clearRoute() {
    if (currentRoute) {
        // Remove route line
        if (currentRoute.routeLine) {
            map.removeLayer(currentRoute.routeLine);
        }
        
        // Remove markers
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
        
        currentRoute = null;
        
        // Hide route info
        document.getElementById('route-info').style.display = 'none';
        
        // Reset map to default view
        map.setView([40.7128, -74.0060], 10);
    }
}

// Center the map on the current route
function centerMap() {
    if (currentRoute) {
        const bounds = L.latLngBounds([currentRoute.start, currentRoute.end]);
        map.fitBounds(bounds, { padding: [20, 20] });
    } else {
        map.setView([40.7128, -74.0060], 10);
    }
}

// Show route information in the sidebar
function showRouteInfo(route) {
    const routeInfo = document.getElementById('route-info');
    
    // Update summary
    document.getElementById('total-distance').textContent = `${(route.distance / 1000).toFixed(1)} km`;
    document.getElementById('total-duration').textContent = formatDuration(route.duration);
    document.getElementById('waypoint-count').textContent = '1';
    
    // Show route steps
    const routeSteps = document.getElementById('route-steps');
    routeSteps.innerHTML = `
        <div class="route-step">
            <div class="step-header">
                <span class="step-number">1</span>
                <span class="step-title">Route from start to destination</span>
            </div>
            <div class="step-details">
                <span class="step-distance">${(route.distance / 1000).toFixed(1)} km</span>
                <span class="step-duration">${formatDuration(route.duration)}</span>
            </div>
        </div>
    `;
    
    // Show the route info section
    routeInfo.style.display = 'block';
}

// Format duration from seconds to human-readable format
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

// Show loading overlay
function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}

// Show error message
function showError(message) {
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

// Hide error message
function hideError() {
    document.getElementById('error-message').style.display = 'none';
}

// Add CSS for route steps
const style = document.createElement('style');
style.textContent = `
    .route-step {
        padding: 15px;
        margin-bottom: 10px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #667eea;
    }
    
    .step-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
    }
    
    .step-number {
        background: #667eea;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
    }
    
    .step-title {
        font-weight: 500;
        color: #495057;
        font-size: 14px;
    }
    
    .step-details {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #6c757d;
    }
    
    .custom-marker {
        background: transparent;
        border: none;
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initMap();
});

// Handle window resize
window.addEventListener('resize', () => {
    if (map) {
        map.invalidateSize();
    }
});
=======
// Global variables for FREE version using OpenStreetMap
let map;
let markers = [];
let currentRoute = null;
let routingControl = null;

// Initialize the map when the page loads
function initMap() {
    // Create map centered on a default location (New York City)
    map = L.map('map').setView([40.7128, -74.0060], 10);
    
    // Add OpenStreetMap tiles (FREE)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    console.log('OpenStreetMap initialized successfully - FREE version!');
}

// Add a new destination input field
function addDestination() {
    const destinationsList = document.getElementById('destinations-list');
    const destinationCount = destinationsList.children.length + 1;
    
    const newDestination = document.createElement('div');
    newDestination.className = 'destination-item';
    newDestination.innerHTML = `
        <label>Destination ${destinationCount}</label>
        <input type="text" class="destination-input" placeholder="Enter destination">
        <button class="remove-dest" onclick="removeDestination(this)"><i class="fas fa-times"></i></button>
    `;
    
    destinationsList.appendChild(newDestination);
    updateDestinationLabels();
}

// Remove a destination input field
function removeDestination(button) {
    const destinationItem = button.parentElement;
    destinationItem.remove();
    updateDestinationLabels();
}

// Update destination labels after adding/removing destinations
function updateDestinationLabels() {
    const destinationItems = document.querySelectorAll('.destination-item');
    destinationItems.forEach((item, index) => {
        const label = item.querySelector('label');
        label.textContent = `Destination ${index + 1}`;
    });
}

// Calculate route between destinations using free services
async function calculateRoute() {
    try {
        showLoading();
        
        // Get input values
        const startPoint = document.getElementById('start-point').value.trim();
        const destinationInputs = document.querySelectorAll('.destination-input');
        const destinations = Array.from(destinationInputs)
            .map(input => input.value.trim())
            .filter(value => value !== '');
        
        const travelMode = document.getElementById('travel-mode').value;
        const optimization = document.getElementById('route-optimization').value;
        
        // Validate inputs
        if (!startPoint) {
            throw new Error('Please enter a starting point');
        }
        
        if (destinations.length === 0) {
            throw new Error('Please add at least one destination');
        }
        
        // Clear previous route
        clearRoute();
        
        // Geocode addresses to coordinates (using free Nominatim service)
        const startCoords = await geocodeAddress(startPoint);
        const destCoords = await geocodeAddress(destinations[0]);
        
        if (!startCoords || !destCoords) {
            throw new Error('Could not find coordinates for one or more locations');
        }
        
        // Calculate route using free OSRM service
        const route = await calculateRouteOSRM(startCoords, destCoords, travelMode);
        
        // Display the route
        displayRoute(route, startCoords, destCoords);
        
        // Show route information
        showRouteInfo(route);
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        showError(`Route calculation failed: ${error.message}`);
        console.error('Route calculation error:', error);
    }
}

// Geocode address using free Nominatim service
async function geocodeAddress(address) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        }
        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

// Calculate route using free OSRM service
async function calculateRouteOSRM(start, end, mode) {
    try {
        const profile = mode === 'driving' ? 'driving' : mode === 'walking' ? 'walking' : 'cycling';
        const response = await fetch(`https://router.project-osrm.org/route/v1/${profile}/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`);
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
            return data.routes[0];
        }
        throw new Error('No route found');
    } catch (error) {
        console.error('OSRM routing error:', error);
        throw new Error('Failed to calculate route');
    }
}

// Display the calculated route on the map
function displayRoute(route, start, end) {
    // Store current route
    currentRoute = { route, start, end };
    
    // Add start marker
    const startMarker = L.marker(start, {
        icon: L.divIcon({
            className: 'custom-marker start-marker',
            html: '<div style="background: #4CAF50; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">A</div>',
            iconSize: [24, 24]
        })
    }).addTo(map);
    
    // Add end marker
    const endMarker = L.marker(end, {
        icon: L.divIcon({
            className: 'custom-marker end-marker',
            html: '<div style="background: #F44336; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">B</div>',
            iconSize: [24, 24]
        })
    }).addTo(map);
    
    // Add route line
    const routeLine = L.geoJSON(route.geometry, {
        style: {
            color: '#667eea',
            weight: 5,
            opacity: 0.8
        }
    }).addTo(map);
    
    // Store markers and route
    markers = [startMarker, endMarker];
    currentRoute.routeLine = routeLine;
    
    // Fit map to show entire route
    const bounds = L.latLngBounds([start, end]);
    map.fitBounds(bounds, { padding: [20, 20] });
    
    console.log('Route displayed successfully using OpenStreetMap!');
}

// Clear the current route
function clearRoute() {
    if (currentRoute) {
        // Remove route line
        if (currentRoute.routeLine) {
            map.removeLayer(currentRoute.routeLine);
        }
        
        // Remove markers
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
        
        currentRoute = null;
        
        // Hide route info
        document.getElementById('route-info').style.display = 'none';
        
        // Reset map to default view
        map.setView([40.7128, -74.0060], 10);
    }
}

// Center the map on the current route
function centerMap() {
    if (currentRoute) {
        const bounds = L.latLngBounds([currentRoute.start, currentRoute.end]);
        map.fitBounds(bounds, { padding: [20, 20] });
    } else {
        map.setView([40.7128, -74.0060], 10);
    }
}

// Show route information in the sidebar
function showRouteInfo(route) {
    const routeInfo = document.getElementById('route-info');
    
    // Update summary
    document.getElementById('total-distance').textContent = `${(route.distance / 1000).toFixed(1)} km`;
    document.getElementById('total-duration').textContent = formatDuration(route.duration);
    document.getElementById('waypoint-count').textContent = '1';
    
    // Show route steps
    const routeSteps = document.getElementById('route-steps');
    routeSteps.innerHTML = `
        <div class="route-step">
            <div class="step-header">
                <span class="step-number">1</span>
                <span class="step-title">Route from start to destination</span>
            </div>
            <div class="step-details">
                <span class="step-distance">${(route.distance / 1000).toFixed(1)} km</span>
                <span class="step-duration">${formatDuration(route.duration)}</span>
            </div>
        </div>
    `;
    
    // Show the route info section
    routeInfo.style.display = 'block';
}

// Format duration from seconds to human-readable format
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

// Show loading overlay
function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}

// Show error message
function showError(message) {
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

// Hide error message
function hideError() {
    document.getElementById('error-message').style.display = 'none';
}

// Add CSS for route steps
const style = document.createElement('style');
style.textContent = `
    .route-step {
        padding: 15px;
        margin-bottom: 10px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #667eea;
    }
    
    .step-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
    }
    
    .step-number {
        background: #667eea;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
    }
    
    .step-title {
        font-weight: 500;
        color: #495057;
        font-size: 14px;
    }
    
    .step-details {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #6c757d;
    }
    
    .custom-marker {
        background: transparent;
        border: none;
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initMap();
});

// Handle window resize
window.addEventListener('resize', () => {
    if (map) {
        map.invalidateSize();
    }
});
>>>>>>> 68f11ff263427724676ffc19f1138b72d40016c2
