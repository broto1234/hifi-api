import express from "express";
import bcrypt from "bcrypt";
import fs from "fs-extra";
import path from "path";
import cors from "cors";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors()); // allow all origins/routes

// Middleware
app.use(express.json());
app.use(express.static("public")); // ✅ Serve all images & static assets

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

app.get("/products", async (req, res) => {
  const products = await readJSON("data/products.json"); // uses readJSON
  res.json(products);
});

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

// === PRODUCTS ===
// app.get("/products", async (req, res) => {
//   const products = await readJSON("data/products.json");

//   // 👇 Auto-generate full image URLs
//   const baseUrl = `${req.protocol}://${req.get("host")}/`;
//   const updatedProducts = products.map((p) => ({
//     ...p,
//     image: p.image.startsWith("http")
//       ? p.image
//       : `${baseUrl}${p.image}`, // Only prepend if not already full URL
//   }));

//   res.json(updatedProducts);
// });

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
// app.get("/newsletter", async (req, res) => {
//   const newsletter = await readJSON("data/newsletter.json");
//   res.json(newsletter);
// });


// === SERVER START ===
app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);
