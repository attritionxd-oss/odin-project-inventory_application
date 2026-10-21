# Project: Inventory Application

An inventory management app for an imaginary store built with Node.js, Express, EJS, and PostgreSQL. This project serves as an implementation of [The Odin Project's Inventory Application assignment](https://www.theodinproject.com/lessons/node-path-nodejs-inventory-application). It demonstrates server-side rendering, validation (including sanitation and escaping), and interfacing with PostgreSQL.

## Key build dependencies

### Core, routing, database, and validation

- **Node.js**
- **Express**
- **node-postgres**
- **express-validator**

### Styling

- **EJS** — used in layouts & reusable templates
- **CSS** — vanilla CSS, scoped using [**Block, Element, Modifier** (BEM) naming methodology](https://bem.info/en/methodology/).

## Getting started

### Prerequisites

Make sure you have npm (^11.x) and Node.js (^24.x) installed on your machine.

### Installation

Clone the repository:

```sh
git clone git@github.com:attritionxd-oss/odin-project-inventory_application.git
cd odin-project-inventory_application
```

Install dependencies:

```sh
npm install
```

Create a local PostgreSQL database then configure a local `.env` file. See `.env.example` for the expected environment variables.

Run the schema and database seeding scripts:

```sh
npm run seed-schema
npm run seed-db
```

Start the dev server:

```sh
npm run dev
```

## Acknowledgements

This project was build as part of [The Odin Project FullStack JavaScript Curriculum](https://www.theodinproject.com/paths/full-stack-javascript).

