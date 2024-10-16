const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const weatherModel = require('./models/weatherModels'); // Assuming models are defined
const DailySummary = require('./models/DailySummaryModel');
require('dotenv').config();
const { sendAlertEmail } = require('./mailer'); // Adjust the path if necessary
const cors = require('cors');
const morgan = require('morgan'); // For logging HTTP requests

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('combined')); // Logging middleware

const userThresholds = {
    temperature: {
        high: 35, // Alert if temperature exceeds 35 degrees Celsius
        low: 5,    // Alert if temperature drops below 5 degrees Celsius
    },
    weatherCondition: {
        rain: true, // Alert for rain conditions
    },
};

const lastSent = {
    high: null,
    low: null,
    rain: null,
};

const checkThresholds = (weatherData) => {
    const alerts = [];
    const now = Date.now();

    weatherData.forEach((data) => {
        const temp = parseFloat(data.temperature); // Convert string to float

        // Check temperature thresholds
        if (temp > userThresholds.temperature.high) {
            if (!lastSent.high || now - lastSent.high > 60 * 60 * 1000) { // 1 hour cooldown
                const alertMessage = `Alert! Temperature in ${data.city} exceeds ${userThresholds.temperature.high}°C: ${temp}°C`;
                alerts.push(alertMessage);
                sendAlertEmail('High Temperature Alert', alertMessage);
                lastSent.high = now; // Update the last sent time
            }
        }
        if (temp < userThresholds.temperature.low) {
            if (!lastSent.low || now - lastSent.low > 60 * 60 * 1000) {
                const alertMessage = `Alert! Temperature in ${data.city} drops below ${userThresholds.temperature.low}°C: ${temp}°C`;
                alerts.push(alertMessage);
                sendAlertEmail('Low Temperature Alert', alertMessage);
                lastSent.low = now;
            }
        }

        // Check weather condition
        if (userThresholds.weatherCondition.rain && data.main.toLowerCase().includes('rain')) {
            if (!lastSent.rain || now - lastSent.rain > 60 * 60 * 1000) {
                const alertMessage = `Alert! Rain detected in ${data.city}.`;
                alerts.push(alertMessage);
                sendAlertEmail('Rain Alert', alertMessage);
                lastSent.rain = now;
            }
        }
    });

    // Log alerts to console
    alerts.forEach(alert => {
        console.log(alert);
    });
};

// Root route
app.get('/', (req, res) => {
    res.send('Weather Monitoring System');
});

// Helper function to fetch weather data for a city
const fetchWeatherData = async (city, apiKey) => {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
        const response = await axios.get(url);
        const data = response.data;

        // Convert Kelvin to Celsius
        const tempInCelsius = data.main.temp - 273.15;
        const feelsLikeCelsius = data.main.feels_like - 273.15;

        // Format the result
        return {
            city,
            temperature: tempInCelsius.toFixed(2),
            feels_like: feelsLikeCelsius.toFixed(2),
            main: data.weather[0].main,
            timestamp: new Date(data.dt * 1000),  // Convert UNIX to JS date
        };
    } catch (error) {
        console.error(`Error fetching weather data for ${city}:`, error.message);
        return null;  // Return null to indicate failure for this city
    }
};

// Route to fetch weather data
app.get('/fetchWeather', async (req, res) => {
    try {
        const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];
        const apiKey = process.env.OPENWEATHER_API_KEY;

        // Use Promise.all to fetch weather data for all cities
        const weatherDataArray = await Promise.all(cities.map(city => fetchWeatherData(city, apiKey)));

        // Filter out null values (in case of failed fetch)
        const validWeatherData = weatherDataArray.filter(data => data !== null);

        if (validWeatherData.length > 0) {
            await weatherModel.insertMany(validWeatherData);
            checkThresholds(validWeatherData);
            res.json(validWeatherData); // Send the weather data array as the response
        } else {
            res.status(204).send('No valid weather data available.'); // No content
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).send('Error fetching weather data');
    }
});

// Scheduled task to fetch weather data every 5 minutes
cron.schedule('*/5 * * * *', async () => {
    console.log('Cron job: Fetching weather data...');
    const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];
    const apiKey = process.env.OPENWEATHER_API_KEY;

    try {
        const weatherDataArray = await Promise.all(cities.map(city => fetchWeatherData(city, apiKey)));
        const validWeatherData = weatherDataArray.filter(data => data !== null);

        if (validWeatherData.length > 0) {
            await weatherModel.create(validWeatherData);
            console.log('Weather data stored:', validWeatherData);
        } else {
            console.log('No valid weather data to store.');
        }
    } catch (error) {
        console.error('Error in weather fetching cron job:', error.message);
    }
});

// Route to fetch historical weather trends
app.get('/historicalWeather', async (req, res) => {
    try {
        const { startDate, endDate, city } = req.query;

        // Set a default date range (last 7 days) if not provided
        const today = new Date();
        const defaultEndDate = new Date(today.setHours(23, 59, 59, 999));
        const defaultStartDate = new Date(today.setDate(today.getDate() - 7)); // 7 days ago

        // Validate startDate and endDate
        const start = isValidDate(startDate) ? new Date(startDate) : defaultStartDate;
        const end = isValidDate(endDate) ? new Date(endDate) : defaultEndDate;

        const weatherData = await weatherModel.find({
            city: city || 'Delhi', // Default city if not provided
            timestamp: { $gte: start, $lt: end },
        }).sort({ timestamp: 1 }); // Sort by timestamp in ascending order

        res.json(weatherData);
    } catch (error) {
        console.error('Error fetching historical weather data:', error);
        res.status(500).send('Error fetching historical weather data');
    }
});

// Function to check if a date is valid
function isValidDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

// Function to calculate daily summary for a city
const calculateDailySummary = async (city) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const weatherData = await weatherModel.find({
            city,
            timestamp: { $gte: startOfDay, $lt: endOfDay },
        });

        if (weatherData.length === 0) {
            console.log(`No data found for ${city} today.`);
            return;
        }

        const avgTemp = weatherData.reduce((sum, data) => sum + parseFloat(data.temperature), 0) / weatherData.length;
        const maxTemp = Math.max(...weatherData.map(data => parseFloat(data.temperature)));
        const minTemp = Math.min(...weatherData.map(data => parseFloat(data.temperature)));

        const weatherConditions = weatherData.map(data => data.main);
        const dominantWeather = weatherConditions.sort((a, b) =>
            weatherConditions.filter(v => v === a).length - weatherConditions.filter(v => v === b).length
        ).pop();

        const dailySummary = {
            city,
            date: new Date().toISOString().split('T')[0],
            avgTemp: avgTemp.toFixed(2),
            maxTemp,
            minTemp,
            dominantWeather,
        };

        await DailySummary.create(dailySummary);
        console.log('Daily Summary stored:', dailySummary);
    } catch (error) {
        console.error(`Error calculating daily summary for ${city}:`, error.message);
    }
};

// Scheduled task to calculate daily summaries at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('Cron job: Calculating daily summaries...');
    const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];

    for (const city of cities) {
        await calculateDailySummary(city);
    }
    console.log('Daily summaries calculated and stored.');
});

// Start server
app.listen(3000, () => {
    console.log(`Server running on port 3000`);
});
