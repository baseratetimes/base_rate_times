/* Imports */
import fs from "fs";
import axios from "axios";

/* Definitions */
let graphQLendpoint = "https://metaforecast.org/api/graphql";
let buildQuery = (question_id) => `
{
  question(id: "${question_id}") {
		id
		title
		url
		description
		options {
			name
			probability
		}
		qualityIndicators {
			numForecasts
			stars
		}
		fetched
	}
}
`;

/* Support functions */
let getSomeMetaforecastPrediction = async (id) => {
	let query = buildQuery(id)
  let response = await axios({
    url: graphQLendpoint,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: JSON.stringify({ query: query }),
  })
    .then((res) => res.data)
    .then((res) => res.data); // not a typo
  return response;
};

// console.log(process.argv)
async function main(){
	// javascript doesn't allow for top-level await yet, so we have to do this.
  let id = process.argv[2]
	let forecast = await getSomeMetaforecastPrediction(id)
	console.dir(forecast, {depth: 3})
}
main()
