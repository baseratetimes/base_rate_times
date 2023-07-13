import axios from 'axios';
import { Parser } from 'json2csv';
import fs from 'fs';
import retry from 'async-retry';

// Define the ids for which we want to fetch data.
const ids = ["insight-146589", "metaculus-10745", "goodjudgmentopen-2859", "metaculus-10738"];

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

  // Extract the time series data for this id.
  let timeSeriesData = [];
  for (let historyItem of response.data.data.question.history) {
    for (let option of historyItem.options) {
      // Choose target option name based on id.
      let targetOptionName = id === "goodjudgmentopen-2859" ? "Between 1 July 2023 and 31 December 2023" : "Yes";
      if (option.name === targetOptionName) {
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
  fs.writeFileSync('Territory.csv', csv);
}).catch((error) => {
  console.error(error);
});
