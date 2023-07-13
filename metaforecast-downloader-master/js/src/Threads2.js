import axios from 'axios';
import { Parser } from 'json2csv';
import fs from 'fs';
import retry from 'async-retry';

// Define the ids for which we want to fetch data.
const ids = ["polymarket-0xea5562d9", "metaculus-14258", "metaculus-14257", "manifold-SttdxBP4Edxqzq0ScDCH", "goodjudgmentopen-2631"];

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
    retries: 60,
    minTimeout: 2000, // wait for 3 seconds before retrying
    onRetry: (error) => {
      console.log(error.message); // log the error message for debugging
    },
  });

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
      else if (id !== "goodjudgmentopen-2617" && id !== "infer-1263" && option.name === 'Yes') {
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
  fs.writeFileSync('Threads2.csv', csv);
}).catch((error) => {
  console.error(error);
});
