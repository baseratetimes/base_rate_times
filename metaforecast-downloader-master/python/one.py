import requests
import json

response = requests.post(
    "https://metaforecast.org/api/graphql",
    json={
        "query": """{
            question(id: "betfair-1.166577732") {
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
        }"""
    },
)

print(json.dumps(response.json(), indent=2))
