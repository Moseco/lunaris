# Lunaris backend challenge

Below will explain the project and how to run it.

## Overview

The backend is built using express.js with typescript and postgresql.

### Features

- `/orders/new`: Finds (or creates) a customer based on the given information and grants them the points based on their order. The base amount is 1% but the system also looks up any modifiers that can change the amount of points given. The change in points is also put in another table that keeps track of changes to points for a customer.
- `/points/get`: Retrieves the total number of points for a customer from a given email or phone number.
- `/points/change`: Changes a customer's points based on the given amount. The change in points is also put in another table that keeps track of changes to points for a customer.
- `/points/set_modifier`: Sets the rate at which points are awarded for new orders. This information is stored in a table. Modifiers can last forever or have an expiration date. Only the most recent active modifier is used. Modifiers are decimal numbers where `0.01` is 1% of an order is awarded as points and `1` will cause the total amount of the order to be awarded as points.

## File structure

The following shows and explains the important files of the project.

```
├── src
│   ├── config
│   │   ├── config.ts - loads environment variables from appropriate .env
│   ├── controller
│   │   ├── orders.controller.ts - function for processing new orders
│   │   ├── points.controller.ts - functions for managing customer's points and setting modifiers
│   ├── db
│   │   ├── index.ts - functions for accessing the postgres database
│   ├── middlewares
│   │   ├── *.validator.middleware.ts - functions for validating incoming json input
│   ├── models.ts
│   │   ├── customer.ts - definition for customer (email and phone)
│   │   ├── order.ts - definition for a new order needing to be processed
│   │   ├── points_change.ts - definition for a request to change a customer's point total
│   │   ├── points_modifier.ts - definition for a request to change the points awarded modifier
│   ├── routes
│   │   ├── index.ts - sets up the routes
│   │   ├── *.route.ts - sets up the specific routes
│   ├── app.ts - sets up express
│   ├── server.ts - starts the app and server
├── .env.example
```

## Getting started

### Prerequisites

- node (tested with v20)
- npm (tested with v10)
- postgresql (tested with v16)

### Setup

1. Install packages with `npm install`.

2. Set up the postgres database.

    - Create a new database (or use an existing one).
    - Create the required tables from the definitions in `database/tables.sql`.
    - Prepare a user that has read and write access to the created tables.

3. Copy `.env.example` to `.env` and set appropriate variables.

4. Run `npm run dev` to simply run the server or `npm run start` to build and run the build.

5. Make requests to the api. See the next section for example input.

## Example requests

The requests follow the same style as the example provided in the problem statement.

Please be aware phone numbers must include the country code with a leading `+`. For example `070-1234-5678` should be written as `+817012345678`.

### Create a new order

With email
``` 
curl -X POST http://localhost:4000/orders/new
   -H "Content-Type: application/json"
   -d '{"order": {"id": "104fd7e0-a188-4ffd-9af7-20d7876f70ab", "paid": 10000, "currency": "jpy"}, "customer": {"email": "example@lunaris.jp", "phone": null}}'
```

With phone (phone number must start with `+` and the country code)
``` 
curl -X POST http://localhost:4000/orders/new
   -H "Content-Type: application/json"
   -d '{"order": {"id": "104fd7e0-a188-4ffd-9af7-20d7876f70ab", "paid": 10000, "currency": "jpy"}, "customer": {"email": null, "phone": "+817012345678"}}'
```

### Get customer's point balance

With email
``` 
curl -X GET http://localhost:4000/points/get
   -H "Content-Type: application/json"
   -d '{"customer": {"email": "example@lunaris.jp", "phone": null}}'
```

With phone
``` 
curl -X GET http://localhost:4000/points/get
   -H "Content-Type: application/json"
   -d '{"customer": {"email": null, "phone": "+817012345678"}}'
```

### Change customer's point balance

With email
``` 
curl -X POST http://localhost:4000/points/change
   -H "Content-Type: application/json"
   -d '{"amount": 1000, "customer": {"email": "example@lunaris.jp", "phone": null}}'
```

With phone
``` 
curl -X POST http://localhost:4000/points/change
   -H "Content-Type: application/json"
   -d '{"amount": 1000, "customer": {"email": null, "phone": "+817012345678"}}'
```

### Change points modifier

Without expiration
``` 
curl -X POST http://localhost:4000/points/set_modifier
   -H "Content-Type: application/json"
   -d '{"modifier": 0.02}'
```

With expiration (valid_until accepts ISO 8601 format)
``` 
curl -X POST http://localhost:4000/points/set_modifier
   -H "Content-Type: application/json"
   -d '{"modifier": 0.03, "valid_until": "2024-03-01"}'
```
