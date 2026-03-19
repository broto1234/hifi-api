import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const app = express();
app.use(express.json());

/* =========================
   Swagger config
========================= */
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HiFi API",
      version: "1.0.0",
      description: "API documentation",
    },
    servers: [
      {
        url: "https://hifi-api-f4du.onrender.com",
      },
    ],
  },
  apis: ["./server.js"], // since you're not using routes folder yet
});

/* =========================
   OpenAPI JSON
========================= */
app.get("/openapi.json", (req, res) => {
  res.json(swaggerSpec);
});

/* =========================
   MAIN PAGE (Din Mægler style)
========================= */
app.get("/", (req, res) => {
  const openApiUrl = "https://hifi-api-f4du.onrender.com/openapi.json";

  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>HiFi API</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
    <style>
      body { margin: 0; font-family: Arial; }
      .topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 20px;
        background: #6c5ce7;
        color: white;
      }
      .btn {
        background: white;
        color: #6c5ce7;
        padding: 8px 16px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: bold;
      }
    </style>
  </head>
  <body>

    <div class="topbar">
      <h2>HiFi API</h2>
      <a class="btn" href="https://insomnia.rest/run/?label=HiFi%20API&uri=${encodeURIComponent(openApiUrl)}" target="_blank">
        Run in Insomnia
      </a>
    </div>

    <div id="swagger-ui"></div>

    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
    <script>
      SwaggerUIBundle({
        url: "/openapi.json",
        dom_id: "#swagger-ui"
      });
    </script>

  </body>
  </html>
  `);
});

/* =========================
   Example endpoint
========================= */

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Success
 */
app.get("/api/v1/products", (req, res) => {
  res.json([{ name: "Speaker" }]);
});

/* ========================= */
app.listen(3000, () => {
  console.log("Server running");
});