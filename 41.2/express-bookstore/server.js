const app = require('./app');

const port = process.env.port || 3000;

app.listen(port, () => {
  console.log('http://127.0.0.1:3000/');
});