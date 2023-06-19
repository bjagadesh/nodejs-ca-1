const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    /*await db.exec(`
      CREATE TABLE IF NOT EXISTS todo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo TEXT,
        priority TEXT,
        status TEXT
      );
    `);

    console.log("Table created successfully");

    // Insert sample data into the 'todo' table
    await db.run(`
      INSERT INTO todo (todo, priority, status)
      VALUES
        ('Watch Movie', 'LOW', 'TO DO'),
        ('Learn Node JS', 'HIGH', 'IN PROGRESS'),
        ('Buy groceries', 'HIGH', 'IN PROGRESS'),
        ('Play volleyball', 'MEDIUM', 'DONE');
    `);

    console.log("Data inserted successfully");*/
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

module.exports = app.get("/todos/", async (request, response) => {
  const { status, priority, search_q, category } = request.query;

  // Construct the SQL query
  let sql =
    "SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE 1=1";

  // Add conditions based on query parameters
  if (status) {
    sql += ` AND status = '${status}'`;
  }
  if (priority) {
    sql += ` AND priority = '${priority}'`;
  }
  if (search_q) {
    sql += ` AND todo LIKE '%${search_q}%'`;
  }
  if (category) {
    sql += ` AND category='${category}'`;
  }
  console.log(sql, "sql");
  const result = await db.all(sql);
  console.log(result, "result");
  if (result.length === 0) {
    if (status) {
      response.status(400);
      response.send("Invalid Todo Status");
    } else if (priority) {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else if (category) {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else {
    response.send(result);
  }
});

module.exports = app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE id=${todoId}`;
  const result = await db.get(query);
  response.send(result);
});

module.exports = app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  console.log(date);
  const formattedDate = new Date(date).toISOString().split("T")[0];
  const query = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE dueDate=${formattedDate}`;
  console.log(query);
  const result = await db.all(query);
  response.send(result);
});

module.exports = app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  console.log(dueDate);
  const formattedDueDate = new Date(dueDate).toISOString().split("T")[0];
  const query = `INSERT INTO todo (id, todo, priority, status, category, due_date) VALUES (${id},'${todo}', '${priority}', '${status}', '${category}', ${
    2021 - 02 - 22
  });`;
  console.log(query);
  const result = await db.run(query);
  console.log(result);
  const query_1 = `SELECT * FROM todo WHERE id=${6}`;
  const result_1 = await db.get(query_1);
  console.log(result_1);
  response.send("Todo Successfully Added");
});
