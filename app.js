import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;


// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seo = JSON.parse(
  fs.readFileSync(path.join(__dirname, "seo.json"), "utf8")
);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index',{homeseo:seo.home});
});
app.get('/about', (req, res) => {
  res.render('about',{aboutseo:seo.about});
});
app.get('/contact', (req, res) => {
  res.render('contact' ,{contactseo:seo.contact});
});
app.get('/shop', (req, res) => {
    res.render('shop' );
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});