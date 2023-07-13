import axios from 'axios';
import { Parser } from 'json2csv';
import fs from 'fs';
import retry from 'async-retry';

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
  const response = await retry(async () => {
    const res = await axios({
      url: 'https://metaforecast.org/api/graphql',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        query: query
      }
    });

    if (res.status !== 200) {
      throw new Error('GraphQL query failed');
    }

    return res;
  }, {
    retries: 60, // maximum number of attempts to make
    minTimeout: 2000, // the number of milliseconds before starting the first retry
    onRetry: (error) => {
      console.log(error.message); // log the error message for debugging
    },
  });

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
