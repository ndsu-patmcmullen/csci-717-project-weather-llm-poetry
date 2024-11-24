# Rain or Shine LLM Poetry

This application provides users with an AI-generated poem based on the current weather in their location.

## Getting Started

### Prerequisites

- Node.js and npm (or yarn) installed.

### Installation

1. Clone the repository:

   ```bash
   git clone [invalid URL removed]
   ```

2. Install dependencies:
   ```bash
   cd rain-or-shine-llm-poetry
   npm install
   ```

### Configuration

1.  **Set up environment variables:**

    - Create a `.env` file in the `backend` directory.

    - Add your Gemini API key to the `.env` file:

      ```
      GEMINI_API_KEY=your_gemini_api_key
      ```

    - You can get a free API key for the `gemini-1.5-flash` model at [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey).

    - Refer to the Gemini API documentation for more information: [https://ai.google.dev/gemini-api/docs\#node.js](https://ai.google.dev/gemini-api/docs#node.js).

### Running the Application

1.  Start the backend server:
    ```bash
    cd backend
    npm run start
    ```
2.  Start the frontend development server:
    ```bash
    cd frontend
    npm run start
    ```

## Testing

- To run the tests, execute the following command in the respective directories:

  ```bash
  cd frontend
  npm run test
  ```

  ```bash
  cd backend
  npm run test
  ```

## Formatting and Linting

- To format the code using Prettier, run:

  ```bash
  npm run format
  ```

- To lint the code using ESLint, run:

  ```bash
  npm run lint
  ```

## API Documentation

- **Geocoding API:** [https://open-meteo.com/en/docs/geocoding-api\#name=12590](https://open-meteo.com/en/docs/geocoding-api#name=12590)
- **Weather API:** [https://open-meteo.com/en/docs](https://open-meteo.com/en/docs)

## License

This project is licensed under the MIT License - see the [LICENSE](https://www.google.com/url?sa=E&source=gmail&q=LICENSE) file for details.
