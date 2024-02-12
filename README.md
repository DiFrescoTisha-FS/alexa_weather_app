[![Alexa-Powered](./assets/alexa_cover.png)](https://youtu.be/Tz7fY6tI_EY)

<h5 align="center">*Please click on the image above for a brief demonstration video.</h5>

<h2 align="center">An Alexa-Powered Voice Assistant Application</h2>

 <hr>

## Introduction:
The Alexa Weather Informer is an Alexa Skill designed to provide users with real-time weather updates and forecasts. Developed as part of my web development and design program at Full Sail University, this project showcases my ability to integrate multiple technologies to create responsive voice-activated applications. This skill utilizes the Alexa Skills Kit and real-time weather APIs, offering users a seamless and interactive way to stay informed about the weather in their location.

## Technologies:
* Node.js
* Alexa Skills Kit (ASK)
* AWS Lambda
* Axios for API requests

## Features:
**Voice-Activated Weather Updates**: Users can ask for current weather information with simple voice commands.

**Location-Based Forecasts**: Provides weather forecasts for user-specified locations.

**Session Management**: Skill maintains context for follow-up questions, enhancing user interaction.

**Error Handling**: Gracefully manages and responds to user queries that may not be understood.

## Quick Start

### Prerequisites:
* NodeJS >= v14.x.x
* npm >= v6.x.x
* An Amazon Developer Account
* AWS Account
* Amazon Echo Device or Alexa Simulator for testing

## Cloning the Repository:

```
git clone https://github.com/Tish-FS/Alexa_Weather_Informer.git
cd Alexa_Weather_Informer/lambda
```

## Installlation:

Install the project dependencies using npm:
```
npm install
```

## Setting Up AWS Lambda:
* Set up an AWS Lambda function with the provided code.
* Ensure that you have configured the Alexa Skills Kit trigger for your Lambda function.

## Running the Project:
Deploy your code to AWS Lambda, and test the skill using an Echo device or the Alexa Skills Kit simulator.
