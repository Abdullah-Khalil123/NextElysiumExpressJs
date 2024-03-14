const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const app = express();

// Allow requests from a specific origin
const allowedOrigins = ['https://abdullah-khalil123.github.io'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } 
    // else {
    //   callback(new Error('Not allowed by CORS'));
    // }
  }
};

// app.use(cors(corsOptions));
app.use(express.json());
const PORT = process.env.PORT || 3001;

const connection = mysql.createConnection({
  host: "sql11.freemysqlhosting.net",
  user: "sql11690822",
  password: "Yvt7g8fuim",
  database: "sql11690822",
});

connection.connect((err) => {
  if (err) {
    console.log("Error Connecting to Database: ", err);
  } 
  // else {
  //   console.log("Connected To Database!!");
  // }
});

app.get("/api/", (req, res) => {
  res.status(200).send("API CONNECTION TO ELYSIUM");
});

app.get("/api/Expenses", (req, res) => {
  const [roomID, month, year] = [
    req.query.room,
    req.query.month,
    req.query.year,
  ];
  const query = `SELECT expenses.Date, expenses.RoomID, expenseitems.ExpenseItem, expenseitems.ExpenseAmount FROM expenses INNER JOIN expenseitems ON expenses.ExpensesID = expenseitems.ExpensesID WHERE RoomID = ${roomID} AND MONTH(Date) = ${month} AND YEAR(Date) = ${year};`;
  connection.query(query, (error, results) => {
    if (error) {
      console.error("ERROR EXECUTING QUERY :", error);
      res.status(500).send("INTERNAL SERVER ERROR");
    } else {
      res.status(200).send(results);
    }
  });
});

app.get("/api/Rents", (req, res) => {
  const [roomID, month, year] = [
    req.query.room,
    req.query.month,
    req.query.year,
  ];

  const query = `SELECT * FROM rents WHERE roomID = ${roomID} AND MONTH(Date) = ${month} AND YEAR(Date) = ${year} ORDER BY Date ASC;`;
  connection.query(query, (error, results) => {
    if (error) {
      console.error("ERROR EXECUTING QUERY :", error);
      res.status(500).send("INTERNAL SERVER ERROR");
    } else {
      res.status(200).send(results);
    }
  });
});

app.listen(PORT, () => {
  console.log("Server Running on Port : ", PORT);
});
