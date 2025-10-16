import express from "express";
import bcrypt from "bcrypt";
import fs from "fs-extra";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// === Helper Functions ===
async function readJSON(file) {
  await fs.ensureFile(file);
  const content = await fs.readFile(file, "utf-8");
  return content.trim() ? JSON.parse(content) : (file.includes("users") ? { users: [] } : []);
}

async function writeJSON(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

// === USERS & AUTH ===
//Route to get all users (for testing purposes)
app.get("/users", async (req, res) => {
  const data = await readJSON("data/users.json");
  res.json(data);
});

//Route for user registration
app.post("/register", async (req, res) => {
  const { id, email, username, password } = req.body;

  if (!id || !email || !username || !password) {
    return res.status(400).json({ message: "id, email, username & password required" });
  }

  const data = await readJSON("data/users.json");

  // Check if id, email, or username already exists
  const exists = data.users.find( u => 
     u.id === id || 
     u.email === email || 
     (u.username && username && u.username.toLowerCase() === username.toLowerCase())
  );
  if (exists) return res.status(400).json({ message: "User with same id/email/username exists" });

  // Hash the password
  const hash = await bcrypt.hash(password, 12);

  data.users.push({ id, email, username, password: hash });
  await writeJSON("data/users.json", data);

  res.status(201).json({ message: "User registered successfully" });
});


//Route for user login
app.post("/login", async (req, res) => {
  const { identifier, password } = req.body; // identifier = id/email/username
  
  if (!identifier || !password) return res.status(400).json({ message: "identifier & password required" });

  const data = await readJSON("data/users.json");

  const user = data.users.find(u =>
    (u.id == identifier) ||
    (u.email === identifier) ||
    (u.username && identifier && u.username.toLowerCase() === identifier.toLowerCase())
  );

  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  res.json({ message: "Login successful", userId: user.id, username: user.username });
});


// === PRODUCTS ===
app.get("/products", async (req, res) => {
  const products = await readJSON("data/products.json");
  res.json(products);
});

app.get("/products/:param", async (req, res) => {
  const products = await readJSON("data/products.json");
  const param = req.params.param.toLowerCase();

  const product = products.find(p => (p.id == param) || (p.name && p.name.toLowerCase() === param));
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

// === ABOUT ===
app.get("/about", async (req, res) => {
  const about = await readJSON("data/about.json");
  res.json(about);
});

// === NEWSLETTER ===
app.get("/newsletter", async (req, res) => {
  const newsletter = await readJSON("data/newsletter.json");
  res.json(newsletter);
});

// Start server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
