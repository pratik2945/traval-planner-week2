// Global variables
let map;
let directionsService;
let directionsRenderer;
let markers = [];
let currentRoute = null;

// Initialize the map when the page loads
function initMap() {
    // Initialize services
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true, // We'll add custom markers
        polylineOptions: {
            strokeColor: '#667eea',
            strokeWeight: 5,
            strokeOpacity: 0.8
        }
    });

    // Create map centered on a default location (New York City)
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: { lat: 40.7128, lng: -74.0060 },
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ]
    });

    // Set up directions renderer
    directionsRenderer.setMap(map);

    // Initialize autocomplete for inputs
    initializeAutocomplete();
    
    console.log('Map initialized successfully');
}

// Initialize Google Places Autocomplete for input fields
function initializeAutocomplete() {
    const startPointInput = document.getElementById('start-point');
    const destinationInputs = document.querySelectorAll('.destination-input');

    // Autocomplete for starting point
    if (startPointInput) {
        new google.maps.places.Autocomplete(startPointInput, {
            types: ['geocode', 'establishment']
        });
    }

    // Autocomplete for destination inputs
    destinationInputs.forEach(input => {
        new google.maps.places.Autocomplete(input, {
            types: ['geocode', 'establishment']
        });
    });
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
    
    // Initialize autocomplete for the new input
    const newInput = newDestination.querySelector('.destination-input');
    new google.maps.places.Autocomplete(newInput, {
        types: ['geocode', 'establishment']
    });
    
    // Update labels
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

// Calculate route between destinations
async function calculateRoute() {
    try {
        // Show loading overlay
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
        
        // Create waypoints array
        const waypoints = destinations.map(dest => ({
            location: dest,
            stopover: true
        }));
        
        // Prepare request for DirectionsService
        const request = {
            origin: startPoint,
            destination: destinations[destinations.length - 1],
            waypoints: waypoints.slice(0, -1), // Exclude the last destination as it's the final destination
            optimizeWaypoints: optimization === 'DISTANCE',
            travelMode: google.maps.TravelMode[travelMode],
            unitSystem: google.maps.UnitSystem.METRIC
        };
        
        // Make API call to get directions
        const result = await getDirections(request);
        
        // Display the route
        displayRoute(result);
        
        // Show route information
        showRouteInfo(result);
        
        // Hide loading
        hideLoading();
        
    } catch (error) {
        hideLoading();
        showError(`Route calculation failed: ${error.message}`);
        console.error('Route calculation error:', error);
    }
}

// Make API call to Google Directions Service
function getDirections(request) {
    return new Promise((resolve, reject) => {
        directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                resolve(result);
            } else {
                let errorMessage = 'Failed to calculate route';
                
                switch (status) {
                    case google.maps.DirectionsStatus.NOT_FOUND:
                        errorMessage = 'One or more locations could not be found';
                        break;
                    case google.maps.DirectionsStatus.ZERO_RESULTS:
                        errorMessage = 'No route found between the specified locations';
                        break;
                    case google.maps.DirectionsStatus.MAX_WAYPOINTS_EXCEEDED:
                        errorMessage = 'Too many waypoints (maximum is 23)';
                        break;
                    case google.maps.DirectionsStatus.MAX_ROUTE_LENGTH_EXCEEDED:
                        errorMessage = 'Route is too long to calculate';
                        break;
                    case google.maps.DirectionsStatus.INVALID_REQUEST:
                        errorMessage = 'Invalid request parameters';
                        break;
                    case google.maps.DirectionsStatus.OVER_QUERY_LIMIT:
                        errorMessage = 'API quota exceeded. Please try again later';
                        break;
                    case google.maps.DirectionsStatus.REQUEST_DENIED:
                        errorMessage = 'Request denied. Please check your API key';
                        break;
                    case google.maps.DirectionsStatus.UNKNOWN_ERROR:
                        errorMessage = 'An unknown error occurred';
                        break;
                }
                
                reject(new Error(errorMessage));
            }
        });
    });
}

// Display the calculated route on the map
function displayRoute(result) {
    // Store current route
    currentRoute = result;
    
    // Render the route
    directionsRenderer.setDirections(result);
    
    // Add custom markers for start, waypoints, and end
    addRouteMarkers(result);
    
    // Fit map to show entire route
    const bounds = new google.maps.LatLngBounds();
    result.routes[0].legs.forEach(leg => {
        bounds.extend(leg.start_location);
        bounds.extend(leg.end_location);
    });
    map.fitBounds(bounds);
    
    console.log('Route displayed successfully');
}

// Add custom markers for the route
function addRouteMarkers(result) {
    // Clear existing markers
    clearMarkers();
    
    const route = result.routes[0];
    const legs = route.legs;
    
    // Add start marker
    if (legs.length > 0) {
        addMarker(legs[0].start_location, 'A', '#4CAF50', 'Starting Point');
    }
    
    // Add waypoint markers
    for (let i = 0; i < legs.length - 1; i++) {
        const waypointLocation = legs[i].end_location;
        addMarker(waypointLocation, String.fromCharCode(66 + i), '#FF9800', `Waypoint ${i + 1}`);
    }
    
    // Add end marker
    if (legs.length > 0) {
        const lastLeg = legs[legs.length - 1];
        addMarker(lastLeg.end_location, String.fromCharCode(65 + legs.length), '#F44336', 'Final Destination');
    }
}

// Add a custom marker to the map
function addMarker(position, label, color, title) {
    const marker = new google.maps.Marker({
        position: position,
        map: map,
        label: {
            text: label,
            color: 'white',
            fontWeight: 'bold'
        },
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 2
        },
        title: title
    });
    
    markers.push(marker);
    
    // Add info window
    const infoWindow = new google.maps.InfoWindow({
        content: `<div style="padding: 10px;"><strong>${title}</strong></div>`
    });
    
    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });
}

// Clear all markers from the map
function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

// Clear the current route
function clearRoute() {
    if (currentRoute) {
        directionsRenderer.setDirections({ routes: [] });
        clearMarkers();
        currentRoute = null;
        
        // Hide route info
        document.getElementById('route-info').style.display = 'none';
        
        // Reset map to default view
        map.setCenter({ lat: 40.7128, lng: -74.0060 });
        map.setZoom(10);
    }
}

// Center the map on the current route
function centerMap() {
    if (currentRoute) {
        const bounds = new google.maps.LatLngBounds();
        currentRoute.routes[0].legs.forEach(leg => {
            bounds.extend(leg.start_location);
            bounds.extend(leg.end_location);
        });
        map.fitBounds(bounds);
    } else {
        map.setCenter({ lat: 40.7128, lng: -74.0060 });
        map.setZoom(10);
    }
}

// Show route information in the sidebar
function showRouteInfo(result) {
    const routeInfo = document.getElementById('route-info');
    const route = result.routes[0];
    const legs = route.legs;
    
    // Calculate totals
    let totalDistance = 0;
    let totalDuration = 0;
    
    legs.forEach(leg => {
        totalDistance += leg.distance.value;
        totalDuration += leg.duration.value;
    });
    
    // Update summary
    document.getElementById('total-distance').textContent = `${(totalDistance / 1000).toFixed(1)} km`;
    document.getElementById('total-duration').textContent = formatDuration(totalDuration);
    document.getElementById('waypoint-count').textContent = legs.length - 1;
    
    // Show route steps
    const routeSteps = document.getElementById('route-steps');
    routeSteps.innerHTML = '';
    
    legs.forEach((leg, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'route-step';
        stepDiv.innerHTML = `
            <div class="step-header">
                <span class="step-number">${index + 1}</span>
                <span class="step-title">${leg.start_address} → ${leg.end_address}</span>
            </div>
            <div class="step-details">
                <span class="step-distance">${leg.distance.text}</span>
                <span class="step-duration">${leg.duration.text}</span>
            </div>
        `;
        routeSteps.appendChild(stepDiv);
    });
    
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
`;
document.head.appendChild(style);

// Handle window resize
window.addEventListener('resize', () => {
    if (map) {
        google.maps.event.trigger(map, 'resize');
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if Google Maps API is loaded
    if (typeof google !== 'undefined' && google.maps) {
        initMap();
    } else {
        // Wait for Google Maps API to load
        window.initMap = initMap;
    }
});
