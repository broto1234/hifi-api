# HiFi API — RESTful API with Users, Products, and Newsletter

I followed the **RESTful API development process** (Building API with endpoints, users, login, products, etc.), then completed the **RESTful API deployment process** on Render (Pushing it to Render and accessing it online).

This is a **Node.js + Express** RESTful API that handles:

- User authentication (register & login) with **bcrypt** password hashing
- Products retrieval (all products or by `id`/`name`)
- About information
- Newsletter subscriptions
- JSON file storage (`data/*.json`) as a lightweight database

Test endpoints with **Insomnia**. Deployable to **Render.com**.

---

### 🚀 Features
- User registration with password hashing (`bcrypt`)
- User login and password verification
- JSON file–based local storage (no database required)
- RESTful endpoints (`/register`, `/login`, `/users`)
- Easy to test with **Insomnia**
- Deployable to **Render.com**

---

## RESTful API development process

### 📁 Folder Structure
```bash
  hifi-api/
  ├── data/
  │ ├── users.json
  │ ├── products.json
  │ ├── about.json
  │ └── newsletter.json
  └── public/
      ├── Aboutbilleder/
      │   ├── about.png
      │   ├── history.png
      │   └── service.png
      └── Produktbilleder/
          ├── cd_images/
          │   ├── creek.jpg
          │   └── creek_Destiny.jpg
          └── dvd/
              ├── parasound.jpg
              └── parasound_d.jpg
  ├── server.js
  ├── package.json
  └── README.md
```
---

## **RESTful API deployment process**

# ⚙️ Installation

1. Clone or download the project:
```bash
   git clone https://github.com/broto1234/hifi-api.git
   cd hifi-api
```
2. Install dependencies:
  ```bash
  npm install
```
3. Start the server:
  ```bash
  npm start
```

4. Local API base URL:

http://localhost:3000

## Test locally

Open Insomnia and test your endpoints:

Method:GET URL:http://localhost:3000/products  Send

Method:GET URL:http://localhost:3000/products/101  Send

Method:GET URL:http://localhost:3000/about  Send

Method:GET URL:http://localhost:3000/newsletter  Send

Method:POST URL:http://localhost:3000/register
  Go to Body -> JSON 
  past: {
  "id": 1,
  "email": "user@example.com",
  "username": "JohnDoe",
  "password": "secret123"
  }
  Send

Method:POST URL:http://localhost:3000/login
  Go to Body -> JSON 
  past: {
  "identifier": "JohnDoe",
  "password": "secret123"
  }
  Send

## Push to GitHub

1. Initialize Git:
```bash
  git add .
  git init
  git commit -m "Initial commit of Hifi API"
```
2. Create a repo on GitHub and push:
```bash
  git remote add origin https://github.com/yourusername/hifi-api.git
  git branch -M main
  git push -u origin main
```
## Deploy to Render

1. Go to Render.com → New → Web Service
2. Connect your GitHub repo.
3. Start Command: npm start
4. Environment: Node
5. Click Create Web Service.

After a few minutes, Render gives you a live URL, e.g.:
  https://hifi-api-howz.onrender.com

NB: Use this URL in Insomnia instead of localhost:3000 to test all endpoints online.


# Test these URLs in your browser:
http://localhost:3000/products

http://localhost:3000/users

http://localhost:3000/about

http://localhost:3000/newsletter

# Render will automatically redeploy your app with the new data.

👉 After deployment, check again:

https://hifi-api-f4du.onrender.com/products

https://hifi-api-f4du.onrender.com/users

and soon ...
