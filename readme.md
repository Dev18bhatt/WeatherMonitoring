# Weather Monitoring System

## Project Overview
The Weather Monitoring System is a web application designed to provide real-time weather data and historical trends for multiple cities in India. The application fetches data from the OpenWeatherMap API, displays current weather summaries, and provides visual insights into historical weather trends using charts.

## Features
- Fetches real-time weather data for multiple cities.
- Displays current weather summaries including temperature, feels-like temperature, and weather conditions.
- Visualizes historical weather trends in a line chart format.
- Displays alerts for weather conditions if implemented.

## Technologies Used
- **Frontend**: HTML, CSS, JavaScript, Chart.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (for storing weather data)
- **API**: OpenWeatherMap API

## Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/weather-monitoring-system.git
    ```
2. Navigate to the project directory:
    ```bash
    cd weather-monitoring-system
    ```
3. Install the necessary dependencies:
    ```bash
    npm install
    ```
4. Create a `.env` file in the root directory and add your OpenWeatherMap API key:
    ```plaintext
    OPENWEATHER_API_KEY=your_api_key_here
    ```
5. Start the server:
    ```bash
    npm start
    ```

## Usage
1. Open your browser and navigate to `http://localhost:3000` (or the port your server is running on).
2. The application will display current weather summaries and historical weather trends for the specified cities.

## Missing Features
- **Alerts**: The fetchAlerts function is defined but not fully implemented. An alert model and corresponding functionality need to be developed to retrieve and display weather alerts.
- **Dynamic Date Selection**: Currently, the date range for fetching historical trends is hard-coded. Implementing a date picker for dynamic date selection would enhance user experience.
- **User Interface Improvements**: Additional styling and UI enhancements can be applied for better user experience.

## Contribution
If you'd like to contribute to this project, feel free to fork the repository and submit a pull request. Please ensure to follow the code style guidelines and include tests for any new features.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- [OpenWeatherMap API](https://openweathermap.org/api) for providing weather data.
- [Chart.js](https://www.chartjs.org/) for the charting library.

