# 🚀 AssetIQ – Smart Asset Manager

AssetIQ is a **cloud-based full-stack financial management system** that helps users track their **assets, liabilities, and net worth** in real-time.

Unlike traditional expense trackers, AssetIQ focuses on **wealth management**, giving users a complete financial overview.

---

## 🌐 Live Backend (AWS EC2)

```bash
http://13.233.106.44:8000
```

---

## 📌 Features

* 💰 Asset Management (Savings, Stocks, Crypto, Gold, etc.)
* 📉 Liability Tracking (Loans, Debts)
* 📊 Net Worth Calculation
* 📈 Interactive Dashboard & Charts
* 🧠 Smart Insights (financial trends & alerts)
* ☁️ Cloud Deployment (AWS EC2 + MongoDB Atlas)

---

## 🧠 Tech Stack

### 🔹 Frontend

* Next.js (React)
* TypeScript
* Tailwind CSS

### 🔹 Backend

* PHP (REST API)

### 🔹 Database

* MongoDB Atlas (Cloud NoSQL DB)

### 🔹 Cloud

* AWS EC2 (Ubuntu Server)

---

## 🏗️ Architecture

```
User (Browser)
      ↓
Frontend (Next.js)
      ↓
REST API (PHP on EC2)
      ↓
MongoDB Atlas (Cloud Database)
```

---

## ⚙️ Setup Instructions

### 🔹 1. Clone Repository

```bash
git clone https://github.com/your-username/AssetIQ-smart-asset-manager.git
cd AssetIQ-smart-asset-manager
```

---

### 🔹 2. Frontend Setup

```bash
npm install
npm run dev
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://13.233.106.44:8000
```

---

### 🔹 3. Backend Setup (Local / EC2)

```bash
cd php-backend
composer install
php -S 0.0.0.0:8000 -t public
```

---

### 🔹 4. MongoDB Configuration

Update `.env` in backend:

```env
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=transaction_dashboard
```

---

## 🔐 API Endpoints

| Method | Endpoint          | Description    |
| ------ | ----------------- | -------------- |
| GET    | /api/transactions | Fetch all data |
| POST   | /api/transactions | Add new entry  |
| DELETE | /api/transaction  | Delete entry   |

---

## ☁️ Cloud Deployment

* Backend deployed on **AWS EC2 (IaaS)**
* Database hosted on **MongoDB Atlas**
* Frontend can be deployed on **Vercel / Netlify**

---

## 📊 Net Worth Formula

```
Net Worth = Total Assets – Total Liabilities
```

---

## ⚠️ Notes

* Backend runs on port `8000`
* Ensure CORS headers are enabled in PHP
* EC2 public IP may change after restart

---

## 🚀 Future Scope

* 🔐 JWT Authentication
* 📱 Mobile App Integration
* 🤖 AI Financial Insights
* 🔒 HTTPS Security
* 📊 Advanced Analytics

---

## 👩‍💻 Author

**Ishita Ghosh**
B.E. Information Technology
Zeal College of Engineering

---

## 📚 References

* AWS EC2 Documentation
* MongoDB Atlas Docs
* Next.js Docs
* PHP Official Docs

---

## ⭐ Conclusion

AssetIQ demonstrates how **cloud computing + full stack development** can be combined to build a scalable, real-world financial system.

---

✨ *Built with passion and cloud power* ✨
