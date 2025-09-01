<<<<<<< HEAD
// Configuration file for Google Maps API
// Replace YOUR_API_KEY with your actual Google Maps API key
// IMPORTANT: Never commit this file with your actual API key to version control

const config = {
    // Google Maps API Key
    // Get your API key from: https://console.cloud.google.com/
    GOOGLE_MAPS_API_KEY: 'YOUR_API_KEY_HERE',

    // Default map center (New York City)
    DEFAULT_MAP_CENTER: {
        lat: 40.7128,
        lng: -74.0060
    },

    // Default map zoom level
    DEFAULT_MAP_ZOOM: 10,

    // Route display options
    ROUTE_OPTIONS: {
        strokeColor: '#667eea',
        strokeWeight: 5,
        strokeOpacity: 0.8
    },

    // Marker colors
    MARKER_COLORS: {
        start: '#4CAF50',      // Green for starting point
        waypoint: '#FF9800',   // Orange for waypoints
        end: '#F44336'         // Red for final destination
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
} else {
    window.config = config;
}
=======
// Configuration file for Google Maps API
// Replace YOUR_API_KEY with your actual Google Maps API key
// IMPORTANT: Never commit this file with your actual API key to version control

const config = {
    // Google Maps API Key
    // Get your API key from: https://console.cloud.google.com/
    GOOGLE_MAPS_API_KEY: 'YOUR_API_KEY_HERE',

    // Default map center (New York City)
    DEFAULT_MAP_CENTER: {
        lat: 40.7128,
        lng: -74.0060
    },

    // Default map zoom level
    DEFAULT_MAP_ZOOM: 10,

    // Route display options
    ROUTE_OPTIONS: {
        strokeColor: '#667eea',
        strokeWeight: 5,
        strokeOpacity: 0.8
    },

    // Marker colors
    MARKER_COLORS: {
        start: '#4CAF50',      // Green for starting point
        waypoint: '#FF9800',   // Orange for waypoints
        end: '#F44336'         // Red for final destination
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
} else {
    window.config = config;
}
>>>>>>> 68f11ff263427724676ffc19f1138b72d40016c2
