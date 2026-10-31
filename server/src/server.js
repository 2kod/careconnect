import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`🚀 CareConnect API Server is running on http://localhost:${PORT}`);
  console.log(`🩺 Health check accessible at http://localhost:${PORT}/api/health`);
});
