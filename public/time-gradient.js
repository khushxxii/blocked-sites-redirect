// Dynamic gradient based on time of day
function updateGradientByTime() {
    // Check for URL parameter for testing
    const urlParams = new URLSearchParams(window.location.search);
    const testTime = urlParams.get('time');
    
    const body = document.body;
    
    // Remove all time-based classes
    body.classList.remove('morning', 'midday', 'evening', 'night');
    
    if (testTime && ['morning', 'midday', 'evening', 'night'].includes(testTime)) {
        // Use test time from URL
        body.classList.add(testTime);
    } else {
        // Use actual time
        const hour = new Date().getHours();
        
        if (hour >= 5 && hour < 12) {
            // Morning: 5 AM - 11:59 AM
            body.classList.add('morning');
        } else if (hour >= 12 && hour < 17) {
            // Midday: 12 PM - 4:59 PM
            body.classList.add('midday');
        } else if (hour >= 17 && hour < 21) {
            // Evening/Sunset: 5 PM - 8:59 PM
            body.classList.add('evening');
        } else {
            // Night: 9 PM - 4:59 AM
            body.classList.add('night');
        }
    }
}

// Run on page load
updateGradientByTime();

// Update every minute to catch time changes (unless testing with URL param)
const urlParams = new URLSearchParams(window.location.search);
if (!urlParams.get('time')) {
    setInterval(updateGradientByTime, 60000);
}

