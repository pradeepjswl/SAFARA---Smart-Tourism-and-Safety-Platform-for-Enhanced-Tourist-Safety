# **📘 Installation Guide – Safara 4.0 (Backend + Web) & Safara-RN (React Native App)**

This guide explains how to configure and run the entire Safara system, which consists of two main folders:

1. **Safara-4.0** → Monorepo containing

   * Backend (Node.js + Express)
   * Frontend (Web)
   * Authority App

2. **Safara-RN** → React Native App (Expo)

The React Native app **depends on the backend** running inside **Safara-4.0**.

---

# ✅ **1. Prerequisites**

Before installation, ensure you have these tools installed:

* **Node.js (LTS version)**
* **npm** or **yarn**
* **Git**
* A smartphone or emulator
  (Expo Go app for Android/iOS)

---

# ✅ **2. Project Structure**

```
/
|-- Safara-4.0        # Monorepo (Backend + Web + Authority App)
|     |-- frontend
|     |-- backend
|     |-- authority-app
|
|-- Safara-RN         # React Native App (Expo)
```

---

# 🚀 **3. Setup – Safara-4.0 (Backend + Web + Authority App)**

### **Step 1: Navigate to the Safara-4.0 directory**

```sh
cd Safara-4.0
```

### **Step 2: Install all dependencies**

```sh
npm install
```

### **Step 3: Configure environment variables**

A file named `env.example` exists in the root.
Copy its content into a new `.env` file.

#### **On Windows (PowerShell):**

```sh
Copy-Item env.example .env
```

Or manually copy-paste the contents.

### **Step 4: Start the backend**

```sh
npm run dev --workspace=@safetrail/backend
```

This boots the entire monorepo (backend + services required for mobile).
> To run `frontend` and `authority` app, check the cmd inside package.json

---

# 📱 **4. Setup – Safara-RN (React Native App)**

### **Step 1: Navigate to the React Native folder**

```sh
cd Safara-RN
```

### **Step 2: Install dependencies**

```sh
npm install
```

### **Step 3: Configure environment variables**

Inside Safara-RN there is also an `env.example`.

Copy it to `.env`:

```sh
Copy-Item env.example .env
```

### **Step 4: Update API URL inside `.env` for Safara-RN**

You **must set your local machine IP address** so the mobile app can connect to the backend running on your PC.

#### **Find your IP address (Windows):**

```sh
ipconfig
```

Look for:

```
IPv4 Address. . . . . : 192.168.x.x
```

Use that in your React Native **.env**:

```
API_URL=http://192.168.x.x:PORT/api/v1
```

> Replace `PORT` with your backend port (example: `8000`, `5000`, etc.)
> Replace `192.168.x.x` with your ip address

---

# 🚀 **Step 5: Start the React Native App**

Clear the cache and start Expo:

```sh
npx expo start -c
```

Open the Expo Go app on your phone and scan the QR code.

---

# 🎯 **5. Running the Entire System Together**

| Service                       | Location   | Command             |
| ----------------------------- | ---------- | ------------------- |
| **Backend (required for RN)** | Safara-4.0 | `npm run dev --workspace=@safetrail/backend`       |
| **React Native App**          | Safara-RN  | `npx expo start -c` |

Ensure the backend stays running in one terminal while you run the mobile app in another.

