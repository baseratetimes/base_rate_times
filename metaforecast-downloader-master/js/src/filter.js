import fs from "fs";

let forecasts_json = JSON.parse(fs.readFileSync("./data/forecasts.json"))
let filtered_forecasts_by_title = forecasts_json.filter(forecast => forecast.title == "Will Sweden join NATO before 2024?")
// let filtered_forecasts_by_id = forecasts_json.filter(forecast => forecast.id == "metaculus-10084")
// let filtered_forecasts_by_keyword =  forecasts_json.filter(forecast => (forecast.title.includes("NATO") || forecast.description.includes("NATO") ) && (forecast.title.includes("Sweden") || forecast.description.includes("Sweden")))

console.log("Forecasts filtered by title")
console.log(filtered_forecasts_by_title)
// console.dir(filtered_forecasts_by_title, {depth: 3})
// console.log(JSON.stringify(filtered_forecasts_by_title, null, 2)) // also print the options

// console.log("Forecasts filtered by id")
// console.log(filtered_forecasts_by_id)

// console.log("Forecasts filtered by keyword")
// console.log(filtered_forecasts_by_keyword)
