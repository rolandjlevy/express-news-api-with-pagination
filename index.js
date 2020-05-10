const express = require('express');
const app = express();
const port = 8080;

const fetch = require('node-fetch');
const path = require('path');
const env = require('dotenv').config();
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const totalPages = 20;
const pageSize = 5;

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));

app.use(express.static('public'));

app.use((req, res, next) => {
   res.locals.query = req.query;
   res.locals.params = req.params;
   next();
});

app.get('/', (req, res) => {
  const root = path.join(__dirname, 'public');
  res.sendFile('home.html', {root}, (err) => {
    if (err) res.send(err);
  });
});

app.get('/news', (req, res) => {
  const { page = 1 } = req.query;
  const url = `https://newsapi.org/v2/top-headlines?country=gb&pageSize=${pageSize}&page=${page}&apiKey=${NEWS_API_KEY}`;
  fetch(url)
  .then(res => res.json())
  .then(data => {
    const articles = data.articles.map((item, index) => {
      return (`
        <h3>Article ${(pageSize * (page - 1)) + index + 1}</h3>
        ${getArticle(item)}
      `);
    }).join('');
    res.send(`
      ${nav} (Pages: ${pagination(page)})
      ${articles}
    `);
  });
});

const nav = `
  <a href='/'>Home</a> | 
  <a href='/news?page=1'>News</a>
`;

const getArticle = function(item) {
  const { author, title, description, url, urlToImage } = item;
  return `
    <ul>
      <li><b>Title:</b> ${title || 'N/A'}</li>
      <li><b>Description:</b> ${description || 'N/A'}</li>
      <li><b>Link:</b> <a href='${url}' target='_blank'>Find out more</a></li>
      <li><b>Author:</b> ${author || 'N/A'}</li>
    </ul>
    <img src='${urlToImage}' width='200px' style='margin:0.25rem 2rem;'></li>
    <hr />
  `;
}

const styles = {
  active: `
    font-weight:700;
    text-decoration:none;
    border: 1px solid grey;
    background-color: #dedede;
    padding: 2px 5px;
  `,
  passive: `
    font-weight:400;
    text-decoration:none;
    border: 1px solid transparent;
    background-color: #efefef;
    padding: 2px 5px;
  `
}

const pagination = (page) => {
  return new Array(totalPages / pageSize).fill(0).map((_, index) => {
    const current = (page == index+1) ? 'active' : 'passive';
    return `<a style="${styles[current]}" href='/news?page=${index+1}'>${index+1}</a> `;
  }).join('');
}

app.listen(port, () => {
  console.log('Listening on port', port);
});