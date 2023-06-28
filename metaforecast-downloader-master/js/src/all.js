/* Imports */
import fs from "fs";
import axios from "axios";

/* Definitions */
let graphQLendpoint = "https://metaforecast.org/api/graphql";
let buildQuery = (endCursor) => `{
  questions(first: 1000 ${!!endCursor ? `after: "${endCursor}"` : ""}) {
    edges {
      node {
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
    pageInfo {
      endCursor
      startCursor
    }
  }
}
`;

/* Support functions */
let getSomeMetaforecastPredictions = async (query) => {
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

let save = (questions) => {
  fs.writeFileSync("./data/forecasts.json", JSON.stringify(questions, null, 4));
  console.log("Saving results to data/forecasts.json");
  let tsvHeaders = "title\tplatform\tdate\tforecast\n";
  let tsvRows = questions
    .map(
      (question) =>
        `${question.title}\t${question.platform}\t${
          question.fetched
        }\t${JSON.stringify(question.options)}`
    )
    .join("\n");
  let tsvFile = tsvHeaders + tsvRows;
  console.log("Saving results to data/forecasts.tsv");
  fs.writeFileSync("./data/forecasts.tsv", tsvFile);
};

let getNodes = (questions) => {
  let edges = questions.edges;
  let nodes = edges.map((edge) => edge.node);
  return nodes;
};
// main
let getAllMetaforecastPredictions = async () => {
  let results = [];
  let firstQuery = await getSomeMetaforecastPredictions(buildQuery());
  results.push(...getNodes(firstQuery.questions));
	console.log("Fetching all metaforecast predictions\n")
  let endCursor = firstQuery.questions.pageInfo.endCursor;  let i = 1
  while (endCursor) {
    console.log(`${i}/~24; cursor at: ${endCursor}`);
		i+=1
    let queryResults = await getSomeMetaforecastPredictions(
      buildQuery(endCursor)
    );
    let nodes = getNodes(queryResults.questions);
    results.push(...nodes);
    endCursor = queryResults.questions.pageInfo.endCursor;
  }
  //results = results.map((result) => result.node);
  save(results);
  return results;
};

getAllMetaforecastPredictions();
