const NodeGeocoder = require('node-geocoder');

const options = {
    // provider: GOOGLE_CLIENT,
  provider: 'google',

    httpAdapter: 'https',   
  // Optional depending on the providers
  
  apiKey: process.env.REACT_APP_GOOGLE_KEY, // for Mapquest, OpenCage, Google Premier
  formatter: null // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
// Using callback
// const res = await geocoder.geocode('29 champs elysée paris');

// // output :
// [
//   {
//     latitude: 48.8698679,
//     longitude: 2.3072976,
//     country: 'France',
//     countryCode: 'FR',
//     city: 'Paris',
//     zipcode: '75008',
//     streetName: 'Champs-Élysées',
//     streetNumber: '29',
//     administrativeLevels: {
//       level1long: 'Île-de-France',
//       level1short: 'IDF',
//       level2long: 'Paris',
//       level2short: '75'
//     },
//     provider: 'google'
//   }
// ];