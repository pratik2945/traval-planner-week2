# Travel Planner - Route Calculator

A modern, responsive travel planning application that integrates with Google Maps API to calculate optimal routes between multiple destinations.

## Features

- **Multi-destination Route Planning**: Add unlimited destinations to create complex travel itineraries
- **Google Maps Integration**: Interactive map interface with custom markers and route visualization
- **Multiple Travel Modes**: Support for driving, walking, bicycling, and transit routes
- **Route Optimization**: Choose between distance-based or time-based route optimization
- **Real-time Route Calculation**: Get accurate distance, duration, and turn-by-turn directions
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Error Handling**: Comprehensive error handling for API failures and invalid inputs
- **Autocomplete**: Google Places autocomplete for easy location input

## Prerequisites

Before running this application, you need:

1. **Google Maps API Key**: A valid API key with the following APIs enabled:
   - Maps JavaScript API
   - Directions API
   - Places API
   - Geocoding API

2. **Web Server**: A local web server to serve the application (due to CORS restrictions)

## Setup Instructions

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Directions API
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 2. Configure API Key

1. Open `index.html`
2. Replace `YOUR_API_KEY` with your actual Google Maps API key:
   ```html
   <script async defer
       src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=geometry,places&callback=initMap">
   </script>
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

```bash
# Option 1: Using http-server
npm start

# Option 2: Using live-server (for development)
npm run dev
```

The application will open in your browser at `solve whyhttp://localhost:8080`

## Usage Guide

### Adding Destinations

1. **Enter Starting Point**: Type your starting location in the "Starting Point" field
2. **Add Destinations**: Click "Add Destination" to add multiple stops
3. **Enter Locations**: Use the autocomplete feature to easily find locations
4. **Remove Destinations**: Click the red X button to remove unwanted destinations

### Route Options

- **Travel Mode**: Choose between driving, walking, bicycling, or transit
- **Optimization**: Optimize for shortest distance or fastest time
- **Waypoints**: The system automatically handles up to 23 waypoints

### Calculating Routes

1. Fill in your starting point and at least one destination
2. Select your preferred travel mode and optimization
3. Click "Calculate Route"
4. View the route on the map and detailed information in the sidebar

### Route Information

The sidebar displays:
- **Total Distance**: Complete journey distance in kilometers
- **Total Duration**: Estimated travel time
- **Waypoint Count**: Number of intermediate stops
- **Step-by-step Directions**: Detailed route breakdown with distances and times

### Map Controls

- **Clear Route**: Remove the current route and reset the map
- **Center Map**: Automatically fit the map to show the entire route
- **Interactive Markers**: Click on markers to see location information

## API Integration Details

### Google Maps Services Used

1. **DirectionsService**: Calculates routes between multiple points
2. **DirectionsRenderer**: Displays routes on the map
3. **Places Autocomplete**: Provides location suggestions
4. **Geometry Library**: Handles route calculations and bounds

### Route Calculation Process

1. **Input Validation**: Check for required fields and valid locations
2. **API Request**: Send request to Google Directions API
3. **Response Processing**: Handle success and error responses
4. **Route Display**: Render route on map with custom markers
5. **Information Display**: Show route summary and step-by-step details

### Error Handling

The application handles various API error scenarios:
- Location not found
- No route available
- Too many waypoints
- Route too long
- API quota exceeded
- Invalid requests
- Network errors

## File Structure

```
travel-planner/
├── index.html          # Main HTML file with UI structure
├── styles.css          # CSS styling and responsive design
├── script.js           # JavaScript with Google Maps integration
├── package.json        # Project dependencies and scripts
└── README.md           # This documentation file
```

## Customization

### Styling

- Modify `styles.css` to change colors, fonts, and layout
- The application uses CSS Grid and Flexbox for responsive design
- Color scheme can be adjusted in the CSS variables

### Functionality

- Add new travel modes in the HTML and JavaScript
- Implement additional route optimization algorithms
- Add export functionality for routes (PDF, GPX, etc.)
- Integrate with other mapping services

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance Considerations

- Routes with more than 10 waypoints may take longer to calculate
- The application automatically optimizes waypoint order for distance-based routing
- Map rendering is optimized for smooth performance

## Security Notes

- **Never commit your API key to version control**
- Use environment variables or configuration files for production
- Restrict your API key to specific domains and IP addresses
- Monitor API usage to stay within quotas

## Troubleshooting

### Common Issues

1. **Map not loading**: Check your API key and ensure required APIs are enabled
2. **Routes not calculating**: Verify all input fields are filled and locations are valid
3. **Autocomplete not working**: Ensure Places API is enabled and API key is valid
4. **CORS errors**: Use a local web server instead of opening the HTML file directly

### Debug Mode

Open the browser console to see detailed logging and error messages.

## Support

For issues related to:
- **Google Maps API**: Check [Google Maps API Documentation](https://developers.google.com/maps)
- **Application functionality**: Review the console for error messages
- **Setup problems**: Ensure all prerequisites are met

## License

This project is licensed under the MIT License.

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the application.
