const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const app = express();

// const databasePass = process.env.Aiven_Password;
// const hostName = process.env.Aiven_host;

const databasePass = "AVNS_Isq_aK03W5luoxShmoo";
const hostName = "mysql-30f2be74-abdullah-afad.a.aivencloud.com";

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
  // console.log(data);

  const query = `INSERT INTO rents (roomID, amount,currency, Date)
  VALUES (${data["roomid"]}, ${data["amount"]},${data["currency"] ? 0 : 1}, '${
    data["date"]
  }'); `;

  // console.log(query);
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

app.get("/api/getOccupentRate", (req, res) => {
  const year = new Date().getFullYear();
  const Query = `SELECT * FROM Occupancy where Year(DATE) = ${year};`;

  connection.query(Query, (error, results) => {
    if (error) {
      res.status(400).send("ERROR RETREVING OCC RATE");
    } else {
      res.status(200).send(results);
    }
  });
});

app.get("/api/getMonthlyFlow", (req, res) => {
  const [month, year] = [new Date().getMonth(), new Date().getFullYear()];

  const Query = `select roomID, Day(Date) as day, amount from rents where year(Date) = ${year} and month(Date) = ${
    month + 1
  };`;
  connection.query(Query, (error, results) => {
    if (error) {
      res.status(400).send("Error at (getMonthlyFlow)API" + error);
    } else {
      res.status(200).send(results);
    }
  });
});
app.post("/api/addExpense", (req, res) => {
  const data = req.body;
  console.log(data);

  // Query to get ExpensesID based on the provided date
  const expenseIdQuery = `SELECT ExpensesID FROM expenses WHERE MONTH(Date) = ${
    data["date"].split("-")[1]
  } AND YEAR(Date) = ${data["date"].split("-")[0]}`;

  connection.query(expenseIdQuery, (error, results) => {
    if (error) {
      res.status(400).send("INTERNAL SERVER ERROR");
      return;
    }

    if (results.length > 0) {
      const ExpensesID = results[0]["ExpensesID"];

      const query = `INSERT INTO expenseitems (ExpensesID, ExpenseItem, ExpenseAmount) VALUES (${ExpensesID}, '${data["discrip"]}', ${data["amount"]})`;

      connection.query(query, (error, results) => {
        if (error) {
          res.status(400).send("INTERNAL SERVER ERROR");
        } else {
          res.status(200).send("OK");
        }
      });
    } else {
      res.status(404).send("Expense for the provided date not found");
    }
  });
});

app.post("/api/deleteRent", (req, res) => {
  const data = req.body;
  // console.log(data);
  const query = `Delete from rents where rentID = ${data["rentID"]}`;
  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).send("Cannot Delete Entry");
    }
  });
  res.status(200).send("Deleted Successfully");
});

app.listen(PORT, () => {
  console.log("Server Running on Port : ", PORT);
});
