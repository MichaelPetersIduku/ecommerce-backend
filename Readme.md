## Description

Restful API service for reading product data from google spreadsheet into mongodb database. An endpoint to read the data from the sheet is exposed to the frontend which can be triggered on demand. An endpoint which uses an enhanced search algorithm is also exposed to search for data gotten from the spreadsheet and stored in the database.

This api was built using Nodejs, Javascript, Express, MongoDb, Mongoose and code is linted using ESLint

link to google spreadsheet: https://docs.google.com/spreadsheets/d/1StAjRtad7E1KeuEV0-QNUCxt6QeBtj-G7YSQRwSZTmk
link to postman collection: https://documenter.getpostman.com/view/6889344/UUxwCUS6#64bc9f0f-e3e9-4f3a-b061-f775f744b38e


## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run serve

# production mode
$ npm start
```

## `Architectural design pattern`

This project uses clean architectural pattern with separation of concerns containing Route layer, controller layer, service layer and model layer. This makes the code base easy to read and understand.