import express from 'express';
import cors from 'cors';

import weatherAndPoemRoutes from './routes/weatherAndPoem';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON request bodies

// Route
app.use('/api', weatherAndPoemRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
