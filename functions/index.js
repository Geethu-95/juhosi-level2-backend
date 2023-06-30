var express = require('express')
var mysql = require('mysql');
var bodyParser = require('body-parser')
const cors = require('cors')
var Json2csvParser = require('json2csv').Parser;
const fs = require('fs')
const serverless = require('serverless-http')
const router = express.Router()

const app = express()
app.use('/.netlify/functions/index',router)

var con = mysql.createConnection({
  host: "db4free.net",
  user: "juhosi",
  password: "juhosi123",
  database: "juhosi"
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

// app.use(cors());
// app.options('*', cors())
app.use(cors({origin: '*',
  methods: ['POST']
}));
// app.use(express.json())
// const corsOptions = {
//   // origin: "https://juhosi-level2-frontend.web.app"
//   origin: "https://master--deluxe-daffodil-504ed3.netlify.app"
// };
app.use(bodyParser.urlencoded({
  extended: true
}));


router.get('/', cors(corsOptions), (req, res) => {
  res.json({
      hello: "hi!"
    });
})


// Route to get one post
router.post("/api/getFromId&Password",  (req, res) => {

  const id = req.body.id;
  const password = req.body.password
  con.query("SELECT * FROM User WHERE id = ? AND password = ?", [id, password], (err, result) => {
    if (err) {
      console.log(err)
    }
    if(result)
    
    // res.send("Success!")
    // res.set('Access-Control-Allow-Origin', '*');
    res.send(result)
  }
  );
});

// Route for creating the post
router.post('/api/create',  (req, res) => {
  // const item = req.body;

  const orderDate = req.body.orderDate;
  const item = req.body.item;
  const count = req.body.count;
  const weight = req.body.weight;
  const requests = req.body.requests;
  const id = req.body.id;

  // console.log(item)
  // console.log(orderDate,company,owner,item,count,weight,requests)

  con.query("INSERT INTO Orderitem (order_date,item,count,weight,requests,user_id) VALUES (?,?,?,?,?,?)", [orderDate, item, count, weight, requests,id], (err, result) => {
    if (err) {
      console.log(err)
      // res.status(500).end()
    }
    res.send(result)
    // res.status(200).end()
  }
  );
})

router.post('/api/getPhone', cors(corsOptions), (req, res) => {
  const { phone, npassword, cnpassword } = req.body;
  console.log(phone)
  con.query("SELECT * FROM User WHERE phone_number = ?", phone, (err, result) => {
    if (err) {
      console.log(err)
    }
    // console.log(result)
    res.send(result)
  }
  )
}
)

router.post('/api/update', (req, res) => {
  // const item = req.body;

  const { phone, npassword, cnpassword } = req.body;
  // const id = req.body.id;
  // console.log(item)
  // console.log(orderDate,company,owner,item,count,weight,requests)

  con.query("UPDATE User SET password = ? WHERE phone_number = ?", [npassword, phone], (err, result) => {
    if (err) {
      console.log(err)
   
    }
    res.send(result)

  }
  );
})

router.post('/export-csv',function(req,res){

const {id} = req.body;

  con.query("SELECT * FROM Orderitem WHERE user_id = ?",id, function (err, items, fields) {
    if (err) throw err;
    console.log("users:");
     
    const jsonItems = JSON.parse(JSON.stringify(items));
    // console.log(jsonItems);
 
    // -> Convert JSON to CSV data
    const csvFields = ["order_id","order_date","item","count","weight","requests","user_id"];
    const json2csvParser = new Json2csvParser({ csvFields });
    const csv = json2csvParser.parse(jsonItems);
 
    console.log(csv);
 
     res.setHeader("Content-Type", "text/csv");
     res.setHeader("Content-Disposition", "attachment; filename=orderItems.csv");
 
     fs.writeFileSync('orderItems.csv', csv)

     res.status(200).end(csv);
    // -> Check  file in root project folder
  });
});

app.listen(4000, () => {
  console.log(`Server is running on 4000`)
})

module.exports = app;
exports.module = router;
module.exports.handler = serverless(app)
