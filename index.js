var express = require('express')
var mysql = require('mysql');
var bodyParser = require('body-parser')
const cors = require('cors')
var Json2csvParser = require('json2csv').Parser;
const fs = require('fs')


const app = express()


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

app.use(cors());
// app.use(express.json())
const corsOptions = {
  origin: "http://localhost:3000"
};
app.use(bodyParser.urlencoded({
  extended: true
}));
// Route to get one post
app.post("/api/getFromId&Password", cors(corsOptions), (req, res) => {

  const id = req.body.id;
  const password = req.body.password
  con.query("SELECT * FROM User WHERE id = ? AND password = ?", [id, password], (err, result) => {
    if (err) {
      console.log(err)
    }
    // console.log(result)
    res.send(result)
  }
  );
});

// Route for creating the post
app.post('/api/create', cors(corsOptions), (req, res) => {
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

app.post('/api/getPhone', cors(corsOptions), (req, res) => {
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

app.post('/api/update', cors(corsOptions), (req, res) => {
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

app.post('/export-csv',cors(corsOptions),function(req,res){

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