const express = require('express');
const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser');

const app = express();

// Handlebars Middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
  }));
  app.set('view engine', 'handlebars');
  
  // Body parser middleware
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  // Public file
  app.use(express.static('public'));

  // Index Route
app.get('/', (req, res) => {
    const title = 'Welcome';
    res.render('index', {
      title: title
    });
  });

  const port = 5000;
  app.listen(port, () =>{
    console.log(`Server started on port ${port}`);
  });