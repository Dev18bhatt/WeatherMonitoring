document.addEventListener("DOMContentLoaded", async () => {
    await fetchWeatherData();
    await fetchHistoricalTrends("Delhi");

});

// Chart Initialization
// const ctx = document.getElementById('trendChart').getContext('2d');


const fetchWeatherData = async () => {
    try {
        const response = await fetch('http://localhost:3000/fetchWeather'); // Ensure this URL is correct
        if (!response.ok) {
            // Log error response if not ok
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error('Network response was not ok');
        }
        const weatherData = await response.json();
        displayWeatherSummary(weatherData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
};


const displayWeatherSummary = (weatherData) => {
    const summaryContainer = document.getElementById('summary-container');
    summaryContainer.innerHTML = '';  // Clear previous data

    weatherData.forEach(data => {
        const summaryCard = document.createElement('div');
        summaryCard.classList.add('summary-card');
        summaryCard.innerHTML = `
            <h3>${data.city}</h3>
            <p>Temperature: ${data.temperature}°C</p>
            <p>Feels Like: ${data.feels_like}°C</p>
            <p>Weather: ${data.main}</p>
            <p>Timestamp: ${new Date(data.timestamp).toLocaleString()}</p>
        `;
        summaryContainer.appendChild(summaryCard);
    });
};

// Function to fetch historical weather trends
async function fetchHistoricalTrends(city) {
    try {
        const startDate = '2024-01-01';  // Replace with dynamic dates as needed
        const endDate = '2024-01-07';    // Replace with dynamic dates as needed

        const response = await fetch(`/historicalWeather?city=${city}&startDate=${startDate}&endDate=${endDate}`);
        const data = await response.json();

        console.log(data);  // Check fetched data in console

        // Update the chart with the fetched data
        updateChart(data);  // Pass data to updateChart

    } catch (error) {
        console.error('Error fetching historical weather data:', error);
    }
}




function updateChart(historicalData) {
    // Check if data is coming through
    console.log('Historical Data:', historicalData);

    const labels = historicalData.map(data => new Date(data.timestamp).toLocaleDateString());  // Get date labels from timestamps
    const temperatures = historicalData.map(data => data.temperature);  // Get temperature data

    console.log('Labels:', labels);  // Log labels to debug
    console.log('Temperatures:', temperatures);  // Log temperatures to debug

    // Update chart data
    trendChart.data.labels = labels;  // Set the new labels
    trendChart.data.datasets[0].data = temperatures;  // Set the new temperature data

    trendChart.update();  // Update the chart to reflect the new data
}

