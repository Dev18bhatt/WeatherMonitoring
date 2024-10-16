const ctx = document.getElementById('trendChart').getContext('2d');

// Example data structure for trends. This will be dynamically populated in real use.
const labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const data = {
    labels: labels,
    datasets: [{
        label: 'Temperature (°C)',
        data: [22, 24, 26, 27, 25, 23, 21], // Sample data, replace with actual historical data
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
    }]
};

const trendChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
