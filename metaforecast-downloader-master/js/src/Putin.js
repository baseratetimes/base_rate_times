//import fs from "fs";

// let forecasts_json = JSON.parse(fs.readFileSync("./data/forecasts.json"))
// let filtered_forecasts_by_title = forecasts_json.filter(forecast => forecast.title == "Will Sweden join NATO before 2024?")
// let filtered_forecasts_by_id = forecasts_json.filter(forecast => forecast.id == "metaculus-10084")
// let filtered_forecasts_by_keyword =  forecasts_json.filter(forecast => (forecast.title.includes("NATO") || forecast.description.includes("NATO") ) && (forecast.title.includes("Sweden") || forecast.description.includes("Sweden")))

// console.log("Forecasts filtered by title")
// console.log(filtered_forecasts_by_title)
// console.dir(filtered_forecasts_by_title, {depth: 3})
// console.log(JSON.stringify(filtered_forecasts_by_title, null, 2)) // also print the options

// console.log("Forecasts filtered by id")
// console.log(filtered_forecasts_by_id)

// console.log("Forecasts filtered by keyword")
// console.log(filtered_forecasts_by_keyword)

// ---

//import fs from "fs";

//let forecasts_json = JSON.parse(fs.readFileSync("./data/forecasts.json"))

//let ids = ["goodjudgmentopen-2617", "infer-1263", "metaculus-13930", "polymarket-0x9de1bbb5", "manifold-LZuynBJB6zTiKm0HZuDK", "insight-192967"];
//let filtered_forecasts_by_id = forecasts_json.filter(forecast => ids.includes(forecast.id));

//console.log(filtered_forecasts_by_id);

// ---

import axios from 'axios';
import { Parser } from 'json2csv';
import fs from 'fs';

// Define the GraphQL query.
const query = `
  {
    question(id: "metaculus-10084") {
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
axios({
  url: 'https://metaforecast.org/api/graphql',
  method: 'post',
  headers: {
    'Content-Type': 'application/json',
  },
  data: {
    query: query
  }
}).then((response) => {
  // Check if the request was successful.
  if (response.status !== 200) {
    throw new Error('GraphQL query failed');
  }

  // Extract the time series data.
  let timeSeriesData = [];
  for (let historyItem of response.data.data.question.history) {
    for (let option of historyItem.options) {
      if (option.name === 'Yes') {
        timeSeriesData.push({
          time: historyItem.fetchedStr,
          probability: option.probability
        });
      }
    }
  }

  // Convert the time series data to CSV.
  const json2csvParser = new Parser();
  const csv = json2csvParser.parse(timeSeriesData);

  // Write the CSV data to a file.
  fs.writeFileSync('metaculus-10084.csv', csv);
}).catch((error) => {
  console.error(error);
});
