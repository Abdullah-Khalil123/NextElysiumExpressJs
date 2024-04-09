const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const app = express();

const databasePass = process.env.Aiven_Password;
const hostName = process.env.Aiven_host;
// Allow requests from a specific origin
// const allowedOrigins = ["http://localhost:3000"];

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
// };

app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3001;

const connection = mysql.createConnection({
  host: hostName,
  user: "avnadmin",
  password: databasePass,
  database: "Elysium",
  port: "24145",
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
app.post("/api/addBooking", (req, res) => {
  const data = req.body;
  console.log(data);

  const query = `INSERT INTO rents (roomID, amount,currency, Date)
  VALUES (${data["roomid"]}, ${data["amount"]},${data["currency"] ? 0 : 1}, '${
    data["date"]
  }'); `;

  console.log(query);
  connection.query(query, (error, results) => {
    if (error) {
      console.error("ERROR EXECUTING QUERY :", error);
      res.status(400).send("ERROR INSERT DATA\n" + query, error);
    } else {
      res.status(200).send(results); // Change Later
    }
  });
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
app.post("/api/addExpense", (req, res) => {
  const data = req.body;
  console.log(data);
  const ExpenseidQuery = `Select ExpenseID from expenses where
                          MONTH(Date) = ${
                            data["Date"].split("-")[1]
                          } and YEAR(Date) = ${data["Date"].split("-")[0]}`;
  // date['Date'] is in YYYY-MM formate
  const query = `Insert into expenseitems (ExpensesID , ExpenseItem , ExpenseAmount)
                 Values ( ${"123"} , ${data["discrip"]} , ${data["amount"]})`;
  console.log(ExpenseidQuery);
});
app.listen(PORT, () => {
  console.log("Server Running on Port : ", PORT);
});
