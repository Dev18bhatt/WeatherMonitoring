const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/WeatherApp');

const weatherSchema = new mongoose.Schema({
  city: String,
  temperature: Number,
  feels_like: Number,
  main: String,
  timestamp: { type: Date, default: Date.now },
});

const Weather = mongoose.model('Weather', weatherSchema);

module.exports = Weather;
