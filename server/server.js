require('dotenv').config();

if (!process.env.JWT_SECRET) {
  throw new Error('Brak JWT_SECRET w zmiennych środowiskowych');
}

const app = require('./app');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
