// Import dependencies
const express = require('express')
const fetch = require('node-fetch')
const { graphqlHTTP } = require('express-graphql')
const { buildSchema } = require('graphql')
const app = express()
const cors = require('cors')
app.use(cors())
const port = 4000

const schema = buildSchema(`
  enum Units {
    standard
    metric
    imperial
  }
  type Weather {
    temperature: Float
    description: String
    feelsLike: Float
    tempMin: Float
    tempMax: Float
    status: Int
    message: String
  }

  type Query {
    getWeather(zip: Int!, units: Units): Weather
  }

  type Test {
    message: String!
  }
`)


// Set up resolver
const root = {
  getWeather: async ({zip, units }) => {
    const units = { standard: '', metric: 'metric', imperial: 'imperial'}
    const apikey = process.env.WEATHER_API_KEY
    const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zip}&appid=${apikey}&units=${units}`
    const result = await fetch(url)
    const json = await result.json()
    const status = parseInt(json.cod)
    if(status != 200){
      return {status: status, message: json.message}
    } else {
      const temperature = json.main.temperature
      const description = json.weather[0].description
      const feelsLike = json.weather[0].feels_like
      const tempMin = json.weather[0].tempMin
      const tempMax = json.weather[0].tempMax
      return {
        temperature: temperature,
        description: description,
        feelsLike: feelsLike,
        tempMin: tempMin,
        tempMax: tempMax,
        status: status
        }
    }
  }
}


app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true
}))

app.listen(port, () => {
  console.log(`Running on port ${port}`)
})