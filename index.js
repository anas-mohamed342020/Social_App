import express from 'express'
import dotenv from 'dotenv'
import { bootstrap } from './src/app.controller.js'
import chalk from 'chalk'
const app = express()
const port = process.env.PORT
dotenv.config()
bootstrap(app, express)


// new commit
app.listen(port, () => console.log(chalk.bgWhite.yellow(`Example app listening on port ${port}!`)))