const Alexa = require("ask-sdk-core");
const axios = require("axios");

/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  handle(handlerInput) {
    const speakOutput = "Welcome to Weather Informer!";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(
        "You can ask if it’s going to rain today or ask for the weather forecast for a specific city."
      )
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput = "You can say hello to me! How can I help?";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.CancelIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speakOutput = "Goodbye!";

    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet
 * */
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs
 * */
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      "SessionEndedRequest"
    );
  },
  handle(handlerInput) {
    console.log(
      `~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`
    );
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
  },
};
/* *

/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below
 * */
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const speakOutput =
      "Sorry, I had trouble doing what you asked. Please try again.";
    console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

// Function to get coordinates for a given city name or postal code
const getCoordinatesForSearchTerm = async (searchTerm) => {
  const apiUrl = "https://geocoding-api.open-meteo.com/v1/search";
  const params = {
    name: searchTerm, // The city name or postal code provided by the user
  };

  try {
    const response = await axios.get(apiUrl, { params });
    const locations = response.data.results;
    if (locations.length > 0) {
      // Assuming you want to use the first matching location
      const location = locations[0];
      const latitude = location.latitude;
      const longitude = location.longitude;
      return { latitude, longitude };
    } else {
      // Handle the case where no matching locations are found
      throw new Error("No matching locations found.");
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

async function fetchWeatherFromApi(latitude, longitude) {
  // Constructing the query with all the required parameters
  const queryParams = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: "temperature_2m,precipitation,rain",
      hourly: "temperature_2m,precipitation_probability,precipitation,rain",
      daily: "temperature_2m_min,temperature_2m_max,weathercode", // Example, add others as needed
      temperature_unit: "fahrenheit", // or 'celsius'
      wind_speed_unit: "mph", // Example, you can use 'ms', 'mph', 'kn'
      precipitation_unit: "inch", // or 'mm' based on your preference
      timeformat: "iso8601", // or 'unixtime'
      timezone: "auto", // Automatically determine the timezone or you can set it
      past_days: 0, // If you need past weather data
      forecast_days: 7, // Up to 16 days of forecast
      // Add any additional parameters you need here
  });

  const apiUrl = `https://api.open-meteo.com/v1/forecast?${queryParams.toString()}`;
  
  try {
      const response = await axios.get(apiUrl);
      const weatherData = response.data;

      // You can adjust this based on how the data is structured and what you need
      const currentWeather = weatherData.current_weather;
      const temperature = currentWeather.temperature_2m;
      const precipitation = currentWeather.precipitation;

      // Return the weather data in a format that can be used by your Alexa skill
      return {
          temperature: temperature,
          precipitation: precipitation,
          description: `The current temperature is ${temperature}°F with ${precipitation} inches of precipitation.` // This is an example description
      };
  } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error; // Re-throw the error to handle it in the calling function
  }
}


// list of supported US cities
const SUPPORTED_US_CITIES = ['Atlanta', 'Charleston', 'Asheville', 'Spartanburg', 'Greenville', 'Gatlinburg'];

const GetWeatherIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetWeatherIntent'
    );
  },
  async handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const city = slots.City && slots.City.value ? slots.City.value : null;

    let speakOutput = '';

    if (!city) {
      speakOutput = 'Please tell me the city you would like to check the weather for.';
    } else if (!SUPPORTED_US_CITIES.includes(city)) {
      speakOutput = `I'm sorry, but I can only provide weather information for certain cities within the United States. Please ask about another city.`;
    } else {
      try {
        const coordinates = await getCoordinatesForSearchTerm(city);
        const weatherData = await fetchWeatherFromApi(coordinates.latitude, coordinates.longitude);
        speakOutput = `The current weather in ${city} is ${weatherData.temperature}°F with ${weatherData.precipitation}mm of precipitation.`;
      } catch (error) {
        speakOutput = 'I am unable to access the weather at the moment. Please try again later.';
        console.error(`Error: ${error}`);
      }
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};

const CustomFallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = "I'm sorry, I didn't understand that. You can ask for the weather in U.S. cities like Atlanta or Charleston.";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('Try asking about the weather for a city.')
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom
 * */
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    CustomFallbackIntentHandler,
    SessionEndedRequestHandler,
    GetWeatherIntentHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
