const express = require("express");

const users = require("./MOCK_DATA.json");
const fs = require("fs");

const app = express();
const port = 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Get request for web

app.get("/users", (req, res) => {
  const html = `
    <ul>
        ${users.map((user) => `<li>${user.first_name}</li>`).join("")}
    </ul>    
        `;
  return res.send(html);
});

//Get request for app

app.get("/api/users", (req, res) => {
  return res.json(users);
});

//Get one user
app.get("/api/users/:id", (req, res) => {
  let id = Number(req.params.id);
  let user = users.find((user) => user.id === id);
  return res.json(user);
});

//Create a user

app.post("/api/users", (req, res) => {
  const body = req.body;
  users.push({ ...body, id: users.length + 1 });
  fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err, data) => {
    return res.json({ status: "Succesfull", id: users.length });
  });
});

//Edit a user

app.patch("/api/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const updates = req.body;

  // Debug: Log incoming request
  console.log("Incoming request:", {
    headers: req.headers,
    body: req.body,
    params: req.params,
  });

  // Validate request
  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({
      error: "Request body cannot be empty",
      example: {
        json_format: { email: "new@example.com" },
        form_format: "email=new@example.com",
      },
    });
  }

  // Find user
  const user = users.find((user) => user.id === id);
  if (!user) return res.status(404).json({ error: "User not found" });

  // Update valid fields
  const updatedFields = {};
  Object.keys(updates).forEach((key) => {
    if (key in user) {
      user[key] = updates[key];
      updatedFields[key] = updates[key];
    }
  });

  // Check if any valid fields were updated
  if (Object.keys(updatedFields).length === 0) {
    return res.status(400).json({
      error: "No valid fields provided for update",
      valid_fields: Object.keys(users[0]), // Show available fields
    });
  }

  // Save changes
  fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err) => {
    if (err) {
      console.error("File save error:", err);
      return res.status(500).json({ error: "Failed to save changes" });
    }
    res.json({
      status: "Success",
      updatedFields,
      user,
    });
  });
});

//Delete a user

app.delete("/api/users/:id", (req, res) => {
  let id = Number(req.params.id);
  let user = users.filter((user) => user.id !== id);
  fs.writeFile("./MOCK_DATA.json", JSON.stringify(user), () => {
    return res.json({ status: "success", id: id });
  });
});

app.listen(port, () => {
  console.log(`The server started Running in the port:${port}`);
});
