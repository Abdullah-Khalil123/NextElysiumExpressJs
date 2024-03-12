const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3001;

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "elysium",
});
connection.connect((err) => {
  if (err) {
    console.log("Error Connecting to Database: ", err);
  } else {
    console.log("Connected To Database!!");
  }
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
      console.log(results);
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
