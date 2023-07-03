import axios from 'axios';
import { Parser } from 'json2csv';
import fs from 'fs';

// Define the ids for which we want to fetch data.
const ids = ["metaculus-13985", "goodjudgmentopen-2657", "manifold-IY4cZAXStA3cvcqCDJqR", "insight-224920"];

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

  // Define the option we're interested in. This could be 'Yes' or 'Not before 19 August 2023' depending on the id.
  const targetOption = id === 'goodjudgmentopen-2657' ? 'Not before 19 August 2023' : 'Yes';

  // Extract the time series data for this id.
  let timeSeriesData = [];
  for (let historyItem of response.data.data.question.history) {
    for (let option of historyItem.options) {
      if (option.name === targetOption) {
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
  fs.writeFileSync('Peace.csv', csv);
}).catch((error) => {
  console.error(error);
});
