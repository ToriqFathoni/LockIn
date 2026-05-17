const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
// const { runMigrations } = require('./database/migrate');
const app = express();

const defaultOrigins = ['http://localhost:3000', 'http://localhost:3001'];
const allowedOrigins = process.env.CORS_ORIGIN
  ? [...new Set(process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean).concat(defaultOrigins))]
  : defaultOrigins;

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
// Routes 
app.use('/user', require('./routes/userRoutes'));
app.use('/freelancer-profile', require('./routes/freelancerProfileRoutes'));
app.use('/freelancer-skill', require('./routes/freelancerSkillRoutes'));
app.use('/projects', require('./routes/projectRoutes'));
app.use('/bids', require('./routes/bidRoutes'));
app.use('/contracts', require('./routes/contractRoutes'));
app.use('/reviews', require('./routes/reviewRoutes'));
app.use('/messages', require('./routes/chatRoutes'));
app.use('/saved-jobs', require('./routes/savedJobRoutes'));

const PORT = process.env.PORT || 5000;

// runMigrations dikomentari agar tidak berjalan setiap startup karena tabel sudah ada
// const { runMigrations } = require('./database/migrate');
// runMigrations().catch((err) => {
//   console.error('Migration bootstrap failed:', err.message);
// });

app.use((err, req, res, next) => {
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Payload terlalu besar. Kecilkan ukuran CV PDF atau hapus CV saat registrasi.',
    });
  }

  return next(err);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
