import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes with .js extension
import omnichatRoutes from './routes/omnichat_routes.js';
import regularRoutes from './routes/regular_routes.js';
import cryptoRoutes from './routes/crypto_routes.js';
import lineoaRoutes from './routes/lineoa_routes.js';
import apnsRoutes from './routes/apns_routes.js';
import httpstreamingRoutes from './routes/http_streaming_routes.js';

// Recreate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/omnichat', omnichatRoutes);
app.use('/regular', regularRoutes);
app.use('/crypto', cryptoRoutes);
app.use('/lineoa', lineoaRoutes);
app.use('/apns', apnsRoutes);
app.use('/httpstreaming', httpstreamingRoutes);

app.get('/home', (req, res) => {
  res.status(200).json({
    status: true,
    errCode: '00000',
    message: '🎉 Welcome to Linkforge home.'
  });
});

// App Link & Universal Link
app.get('/.well-known/:fileName', (req, res) => {
  const { fileName } = req.params;
  if (fileName === 'apple-app-site-association' || fileName === 'assetlinks.json') {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(path.join(__dirname, '.well-known', fileName));
  } else {
    res.status(404).json({ error: 'File not found!' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});