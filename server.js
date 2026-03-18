import express from "express";
import Database from "better-sqlite3";
import fs from "fs-extra";
import path from "path";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ===== Ensure data folder exists =====
if (!fs.existsSync("data")) fs.mkdirSync("data");

// ===== Initialize SQLite database =====
const db = new Database("data/newsletter.db");
db.prepare(`
  CREATE TABLE IF NOT EXISTS newsletter (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// ===== Helper functions =====
async function readJSON(file) {
  await fs.ensureFile(file);
  const content = await fs.readFile(file, "utf-8");
  return content.trim() ? JSON.parse(content) : [];
}

async function writeJSON(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

// ===== Swagger UI =====
const openapiSpec = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "openapi.json"), "utf-8")
);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

// ===== PRODUCTS =====
app.get("/products", async (req, res) => {
  const products = await readJSON("data/products.json");
  const baseUrl = `${req.protocol}://${req.get("host")}/`;
  const updatedProducts = products.map((p) => ({
    ...p,
    image: p.image
      ? p.image.startsWith("http")
        ? p.image
        : `${baseUrl}${p.image}`
      : null,
  }));
  res.json(updatedProducts);
});

app.get("/products/:param", async (req, res) => {
  const products = await readJSON("data/products.json");
  const param = req.params.param.toLowerCase();
  const product = products.find(
    (p) => p.id == param || (p.name && p.name.toLowerCase() === param)
  );
  if (!product) return res.status(404).json({ message: "Product not found" });

  const baseUrl = `${req.protocol}://${req.get("host")}/`;
  res.json({
    ...product,
    image: product.image
      ? product.image.startsWith("http")
        ? product.image
        : `${baseUrl}${product.image}`
      : null,
  });
});

// ===== NEWSLETTER =====
app.get("/newsletter", (req, res) => {
  const rows = db.prepare("SELECT * FROM newsletter").all();
  res.json(rows);
});

app.post("/newsletter", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ error: "Invalid email" });

  try {
    const file = "data/newsletter.json";
    await fs.ensureFile(file);
    const content = await fs.readFile(file, "utf-8");
    const newsletter = content.trim() ? JSON.parse(content) : [];

    if (newsletter.some((e) => e.email === email))
      return res.status(400).json({ error: "Email already subscribed" });

    newsletter.push({ email });
    await writeJSON(file, newsletter);

    db.prepare("INSERT INTO newsletter (email) VALUES (?)").run(email);

    res.status(201).json({ message: "Subscribed successfully", email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===== HOME PAGE =====
app.get("/", (req, res) => {
  res.send(`
    <h1>HiFi API</h1>
    <p>Use the following endpoints:</p>
    <ul>
      <li><a href="/products">/products</a> - Get all products</li>
      <li>/products/{id or name} - Get product by ID or name</li>
      <li><a href="/newsletter">/newsletter</a> - Get all newsletter emails</li>
      <li><a href="/docs">/docs</a> - API documentation (Swagger UI)</li>
    </ul>
  `);
});

// ===== START SERVER =====
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));