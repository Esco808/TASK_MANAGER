const app = require('./app');
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
