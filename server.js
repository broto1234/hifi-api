import express from "express";
import Database from "better-sqlite3";
import bcrypt from "bcrypt";
import fs from "fs-extra";
import path from "path";
import cors from "cors";

const app = express();
app.use(cors()); // allow all origins/routes

// Middleware
app.use(express.json());
app.use(express.static("public")); // ✅ Serve all images & static assets

// Ensure data folder exists
if (!fs.existsSync("data")) fs.mkdirSync("data");

// Initialize database
const db = new Database("data/newsletter.db");

// Create table if it doesn’t exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS newsletter (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// === Helper Functions ===
async function readJSON(file) {
  await fs.ensureFile(file);
  const content = await fs.readFile(file, "utf-8");
  return content.trim()
    ? JSON.parse(content)
    : file.includes("users")
    ? { users: [] }
    : [];
}

async function writeJSON(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

// app.get("/products", async (req, res) => {
//   const products = await readJSON("data/products.json"); // uses readJSON
//   res.json(products);
// });

// app.post("*", (req, res, next) => {
//   console.log("📬 POST hit:", req.originalUrl);
//   next();
// });

// === PRODUCTS ===
app.get("/products", async (req, res) => {
  const products = await readJSON("data/products.json"); // uses readJSON

  // 👇 Auto-generate full image URLs
  const baseUrl = `${req.protocol}://${req.get("host")}/`;
  const updatedProducts = products.map((p) => ({
    ...p,
    image: p.image.startsWith("http")
      ? p.image
      : `${baseUrl}${p.image}`, // Only prepend if not already full URL
  }));

  res.json(updatedProducts);
});

// app.get("/products/:param", async (req, res) => {
//   const products = await readJSON("data/products.json");
//   const param = req.params.param.toLowerCase();

//   const product = products.find(
//     (p) => p.id == param || (p.name && p.name.toLowerCase() === param)
//   );

//   if (!product)
//     return res.status(404).json({ message: "Product not found" });

//   // Add full image URL for this one product
//   const baseUrl = `${req.protocol}://${req.get("host")}/`;
//   const productWithImage = {
//     ...product,
//     image: product.image.startsWith("http")
//       ? product.image
//       : `${baseUrl}${product.image}`,
//   };

//   res.json(productWithImage);
// });


// === USERS & AUTH ===
// app.get("/users", async (req, res) => {
//   const data = await readJSON("data/users.json");
//   res.json(data);
// });

// app.post("/register", async (req, res) => {
//   const { id, email, username, password } = req.body;

//   if (!id || !email || !username || !password) {
//     return res
//       .status(400)
//       .json({ message: "id, email, username & password required" });
//   }

//   const data = await readJSON("data/users.json");

//   const exists = data.users.find(
//     (u) =>
//       u.id === id ||
//       u.email === email ||
//       (u.username &&
//         username &&
//         u.username.toLowerCase() === username.toLowerCase())
//   );

//   if (exists)
//     return res
//       .status(400)
//       .json({ message: "User with same id/email/username exists" });

//   const hash = await bcrypt.hash(password, 12);
//   data.users.push({ id, email, username, password: hash });
//   await writeJSON("data/users.json", data);

//   res.status(201).json({ message: "User registered successfully" });
// });

// app.post("/login", async (req, res) => {
//   const { identifier, password } = req.body;
//   if (!identifier || !password)
//     return res
//       .status(400)
//       .json({ message: "identifier & password required" });

//   const data = await readJSON("data/users.json");

//   const user = data.users.find(
//     (u) =>
//       u.id == identifier ||
//       u.email === identifier ||
//       (u.username &&
//         identifier &&
//         u.username.toLowerCase() === identifier.toLowerCase())
//   );

//   if (!user) return res.status(401).json({ message: "Invalid credentials" });

//   const match = await bcrypt.compare(password, user.password);
//   if (!match) return res.status(401).json({ message: "Invalid credentials" });

//   res.json({
//     message: "Login successful",
//     userId: user.id,
//     username: user.username,
//   });
// });


// === ABOUT ===
// app.get("/about", async (req, res) => {
//   const about = await readJSON("data/about.json");
//   const baseUrl = `${req.protocol}://${req.get("host")}/`;

//   // 👇 Add full image URLs to about sections
//   const updatedSections = about.sections?.map((s) => ({
//     ...s,
//     image: s.image.startsWith("http") ? s.image : `${baseUrl}${s.image}`,
//   }));

//   res.json({ ...about, sections: updatedSections });
// });

// === NEWSLETTER ===
// GET /newsletter — get all emails
app.get("/newsletter", (req, res) => {
  const rows = db.prepare("SELECT * FROM newsletter").all();
  res.json(rows);
});


// POST /newsletter — add new email
app.post("/newsletter", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return res.status(400).json({ error: "Invalid email" });

  try {
    const file = "data/newsletter.json";

    // ✅ Ensure file exists
    await fs.ensureFile(file);

    // ✅ Read existing newsletter emails
    const content = await fs.readFile(file, "utf-8");
    const newsletter = content.trim() ? JSON.parse(content) : [];

    // ✅ Avoid duplicates
    if (newsletter.some(e => e.email === email)) {
      return res.status(400).json({ error: "Email already subscribed" });
    }

    // ✅ Add new email
    newsletter.push({ email });
    await fs.writeFile(file, JSON.stringify(newsletter, null, 2));
    
    // Send success message
    res.status(201).json({ message: "Subscribed successfully", email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// app.post("/newsletter", (req, res) => {
//   const { email } = req.body;

//   // 1. Check that the email exists
//   if (!email) {
//     return res.status(400).json({ error: "Email is required" });
//   }

//   // 2. Validate email format using regex for backend validation
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(email)) {
//     return res.status(400).json({ error: "Invalid email format" });
//   }
//   try {
//     const file = "data/newsletter.json";

//     // Wrap in async function (inside route)
//     await fs.ensureFile(file);
//     const content = await fs.readFile(file, "utf-8");
//     const newsletter = content.trim() ? JSON.parse(content) : [];

//     if (newsletter.some(e => e.email === email)) {
//       return res.status(400).json({ error: "Email already subscribed" });
//     }

//     newsletter.push({ email });
//     await fs.writeFile(file, JSON.stringify(newsletter, null, 2));

//     res.status(201).json({ message: "Subscribed successfully", email });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }


//   // try {
//   //   // 3. Insert into SQLite
//   //   const stmt = db.prepare("INSERT INTO newsletter (email) VALUES (?)");
//   //   stmt.run(email);
//   //   res.status(201).json({ message: "Subscribed successfully", email });
//   // } catch (err) {
//   //   // 4. Handle duplicates
//   //   if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
//   //     res.status(400).json({ error: "Email already subscribed" });
//   //   } else {
//   //     console.error(err);
//   //     res.status(500).json({ error: "Database error" });
//   //   }
//   // }
// });

// app.get("/newsletter", async (req, res) => {
//   const newsletter = await readJSON("data/newsletter.json");
//   res.json(newsletter);
// });

// New POST route
// app.post("/newsletter", async (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     return res.status(400).json({ error: "Email is required" });
//   }

//   const newsletter = await readJSON("data/newsletter.json");
  
//   // Optional: avoid duplicates
//   if (newsletter.some(item => item.email === email)) {
//     return res.status(400).json({ error: "Email already subscribed" });
//   }

//   newsletter.push({ email });
//   await writeJSON("data/newsletter.json", newsletter);

//   res.status(201).json({ message: "Subscribed successfully", email });
// });



// === SERVER START ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);
