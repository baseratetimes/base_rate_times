## About

This is a small repository with code to download predictions from the [metaforecast.org api](https://metaforecast.org/api/graphql). It was initially created at the request of Clay Graubard, and then customized for the [Base Rate Times](https://www.baseratetimes.com/)

## Built with

- nodejs
- axios

## Installation

To install:

```
git clone https://github.com/NunoSempere/metaforecast-downloader.git
cd metaforecast-downloader
npm install ## not actually necessary, since I've committed the node_modules folder
```

## Usage

```
node src/all.js # downloads all predictions in metaforecast and saves them to the data/ folder
node src/filter.js # reads the predictions in the data/ folder, and filters them according to some pre-specified criteria.
node src/one.js "betfair-1.166577732" # downloads one forecast according to the provided id. Much faster than downloading all forecasts and then filtering
```

## Stability guarantees

This repository has no stability or mantainability guarantees. The metaforecast graphql API is in early stages of development, and as such may introduce breaking functionality at any time.
