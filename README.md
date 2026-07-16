# Rain or Shine LLM Poetry

This application provides users with an AI-generated, kid-friendly poem based on the current weather in their location.

## Getting Started

### Prerequisites

* **Node.js** and npm (or yarn) installed.
* **LM Studio** (Optional, only required if you want to run the AI completely offline and locally).

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/ndsu-patmcmullen/csci-717-project-weather-llm-poetry.git

```

2. **Install dependencies:**
```bash
cd rain-or-shine-llm-poetry
npm install

```

## Configuration

The backend supports both cloud-hosted generation via Google Gemini and fully local generation via LM Studio.

1. Create a `.env` file inside the `backend` directory.
2. Define your desired LLM configuration using the environment variables below:

| Variable | Default Value | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | *None* | Required to run cloud-hosted AI. Get an API key at [Google AI Studio](https://aistudio.google.com/apikey). |
| `LOCAL_LLM_URL` | `http://localhost:1234` | The endpoint of your running LM Studio instance. Fallback port is `1234`. |

## Running Offline with LM Studio (Local LLM)

To run the application's AI offline without sending data to external APIs, follow these steps to spin up a local server:

1. **Download and Install:**
Download the desktop application from [lmstudio.ai](https://lmstudio.ai).
2. **Download a Model:**
* Open LM Studio.
* Click on the **Search (Magnifying Glass)** icon in the left sidebar.
* Search for a lightweight model (e.g., `google/gemma-2b` or `qwen2.5-1.5b`).
* Download a quantized version (like `Q4_K_M` or `Q6_K`) that fits comfortably within your machine's RAM.

3. **Start the Server:**
* Go to the **Local Server (Double-headed Arrow/Server Rack)** tab on the left.
* Select your downloaded model from the dropdown list at the top to load it into memory.
* Click the green **Start Server** button.
* The server will now listen on `http://localhost:1234` by default.

## Running the Application

1. **Start the backend server:**
```bash
cd backend
npm run start

```


2. **Start the frontend development server:**
```bash
cd frontend
npm run start

```

## Testing

To run the test suites (including coverage tests for the service clients), execute the following commands in their respective directories:

### Frontend Tests

```bash
cd frontend
npm run test

```

### Backend Tests

```bash
cd backend
npm run test

```

## Formatting and Linting

* **To format the code using Prettier:**
```bash
npm run format

```


* **To lint the code using ESLint:**
```bash
npm run lint

```

## API Documentation

* **Geocoding API:** [Open-Meteo Geocoding Documentation](https://open-meteo.com/en/docs/geocoding-api)
* **Weather API:** [Open-Meteo Weather Forecast Documentation](https://open-meteo.com/en/docs)

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.