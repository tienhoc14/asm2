const express = require('express')
const session = require('express-session')
const app = express()

const { ObjectId, MongoClient } = require('mongodb')
const url = 'mongodb+srv://atn_store:Engrisk1234@cluster0.6pxwq.mongodb.net/test'

app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))

app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: "tienhoc14",
    cookie: { maxAge: 600000 }
}))

app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/doLogin', (req, res) => {
    const user = req.body.txtUser;
    const pass = req.body.txtPass;
    console.log(user);

    if (user == 'admin' && pass == '123') {
        console.log('Login successful')
        req.session['User'] = {
            user: 'admin'
        }
    }
    res.redirect('manage_products');
})

app.get('/delete', checkLogin, async(req, res) => {
    const id = req.query.id;
    const dbo = await getDB();
    await dbo.collection('products').deleteOne({ "_id": ObjectId(id) })
    res.redirect("/manage_products")
})

app.post('/insert', checkLogin, async(req, res) => {
    const nameInput = req.body.txtName;
    const priceInput = req.body.txtPrice;
    const pictureInput = req.body.txtPicture;
    const newProduct = { name: nameInput, price: priceInput, picture: pictureInput };

    const dbo = await getDB();
    await dbo.collection('products').insertOne(newProduct);
    res.redirect('manage_products');
})

app.post('/search', async(req, res) => {
    const search = req.body.txtSearch;
    const dbo = await getDB();
    const allProducts = await dbo.collection('products').find({ name: search }).toArray();

    res.render("index", { data: allProducts });
})

app.get('/update', checkLogin, async(req, res) => {
    const id = req.query.id;

    const dbo = await getDB();

    const p = await dbo.collection("products").findOne({ "_id": ObjectId(id) })
    res.render("update", { product: p });
})

app.post('/edit', checkLogin, async(req, res) => {
    const name = req.body.txtName;
    const price = req.body.txtPrice;
    const picture = req.body.txtPicture;
    const id = req.body.txtId;

    const filter = { _id: ObjectId(id) };
    const newValue = { $set: { name: name, price: price, picture: picture } };

    const dbo = await getDB();
    await dbo.collection('products').updateOne(filter, newValue);
    res.redirect('manage_products')
})

app.get('/add', checkLogin, (req, res) => {
    res.render('add')
})

app.get('/manage_products', checkLogin, async(req, res) => {
    const dbo = await getDB()
    const allProducts = await dbo.collection('products').find({}).toArray();

    res.render("manage_products", { data: allProducts });
})

app.get('/', async(req, res) => {
    const dbo = await getDB()
    const allProducts = await dbo.collection('products').find({}).toArray();

    res.render("index", { data: allProducts, auth: req.session['User'] });
})

const PORT = process.env.PORT || 5000;
app.listen(PORT);
console.log('app is running at ' + PORT)

async function getDB() {
    const client = await MongoClient.connect(url)
    const dbo = client.db('GCH0805DB')
    return dbo
}

function checkLogin(req, res, next) {
    if (req.session['User'] == null) {
        res.redirect('/login')
    } else {
        next()
    }
}