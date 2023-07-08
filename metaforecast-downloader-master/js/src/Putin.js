import axios from 'axios';
import { Parser } from 'json2csv';
import fs from 'fs';

// Define the ids for which we want to fetch data.
const ids = ["goodjudgmentopen-2617", "infer-1263", "metaculus-13930", "polymarket-0x9de1bbb5", "manifold-LZuynBJB6zTiKm0HZuDK", "insight-192967"];

// Initialize an array to hold all time series data.
let allTimeSeriesData = [];

// Define a function to fetch data for a given id.
async function fetchDataForId(id) {
  // Define the GraphQL query.
  const query = `
    {
      question(id: "${id}") {
        history {
          options {
            name
            probability
          }
          fetchedStr
        }
      }
    }
  `;

  // Send a POST request to the GraphQL endpoint.
  const response = await axios({
    url: 'https://metaforecast.org/api/graphql',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      query: query
    }
  });

  // Check if the request was successful.
  if (response.status !== 200) {
    throw new Error('GraphQL query failed');
  }

  // Extract the time series data for this id.
  let timeSeriesData = [];
  for (let historyItem of response.data.data.question.history) {
    for (let option of historyItem.options) {
      if ((id === "goodjudgmentopen-2617" || id === "infer-1263") && option.name === 'No') {
        timeSeriesData.push({
          id: id,
          time: historyItem.fetchedStr,
          probability: option.probability
        });
      }
      else if (option.name === 'Yes') {
        timeSeriesData.push({
          id: id,
          time: historyItem.fetchedStr,
          probability: option.probability
        });
      }
    }
  }

  // Add the time series data for this id to the overall data.
  allTimeSeriesData = allTimeSeriesData.concat(timeSeriesData);
}

// Fetch data for all ids.
Promise.all(ids.map(fetchDataForId)).then(() => {
  // Convert the time series data to CSV.
  const json2csvParser = new Parser();
  const csv = json2csvParser.parse(allTimeSeriesData);

  // Write the CSV data to a file.
  fs.writeFileSync('Putin.csv', csv);
}).catch((error) => {
  console.error(error);
});
