# 🧠 LifeSignals  
**AI-Powered Palliative Care & Federated Learning Platform**

**LifeSignals** is an advanced digital health platform designed for **palliative care management** in patients with **neurocognitive** and **neuropsychiatric disorders**.  
It empowers clinicians, researchers, and caregivers with **real-time health insights**, **agentic AI services**, and **federated learning tools** to improve patient outcomes while ensuring data privacy.

---

## 🚀 Overview

LifeSignals brings together advanced data analytics, patient monitoring, and AI-driven learning systems into one unified tool.  
The platform integrates with a FastAPI backend, Amazon Bedrock/Nova, SageMaker AI, Claude, and Amazon Q to deliver intelligent, adaptive, and secure care solutions.

Key capabilities include:
- **EHR features** for patient data, diagnoses, and clinical summaries  
- **Federated learning experiments** setup and management  
- **AI-driven insights** for diagnosis and care planning  
- **Health worker training** via agentic AI simulations

Built using **React + TypeScript** and **Tailwind CSS**, LifeSignals offers a clean, fast, and modular architecture for real-world healthcare environments.

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend Framework** | React (TypeScript) |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **State Management** | React Hooks & Context API |
| **Data Layer** | Supabase (Auth & Realtime) |
| **Backend API** | FastAPI |
| **AI & Federated Learning** | Amazon SageMaker, Amazon Bedrock / Nova, Claude, Amazon Q |
| **Deployment** | AWS (S3 + CloudFront / Amplify / Lambda) |

---

## ⚙️ Core Features

### 🩺 Patient Health Dashboard
- Displays **latest diagnosis** with:
  - Patient name  
  - Diagnosis count  
  - Risk level  
  - Timestamp  

- Shows **7-day health summary**:
  - Average risk score  
  - Diagnosis count trends  
  - High-risk patient indicators  

### 📅 Planned Visits & Care Schedule
- Manage upcoming care visits with details like:
  - Patient name  
  - Visit date/time  
  - Care location  
  - Visit reason and notes  

### 🧠 Federated Learning & AI Integration
- Launch and monitor **federated learning experiments** securely across multiple facilities  
- Train custom models using **SageMaker AI**  
- Use **Amazon Bedrock/Nova** and **Claude** for agentic reasoning and text understanding  
- Access **Amazon Q** for contextual question-answering and clinical support  

### 👥 Health Worker Training
- AI-powered training simulations for field health workers  
- Personalized feedback and adaptive learning  
- Real-time scoring and performance analytics  

### 📊 Analytics & Visualization
- Patient trend tracking  
- Risk distribution and population-level metrics  
- Recharts/D3 visual integration for data visualization  

---

## 🧠 Integration

To connect your frontend to the backend, configure API endpoints in your fetch calls:

```tsx
// Example: Fetching Patients
const res = await fetch('https://your-aws-backend-domain/patients/');
```

Replace:
```tsx
http://localhost:8000/patients/
```
with your production FastAPI endpoint deployed on AWS.

---


```bash - Note there is a seperate repo for the backend 
git clone https://github.com/BenDev254/Agentic-Backend.git
cd LifeSignals-Backend 
```


## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/BenDev254/Agentic-Frontend.git
cd LifeSignals-Frontend
```




### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment Variables
Add a `.env` file in your project root:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=https://your-fastapi-backend-url
```

### 4. Run Development Server
```bash
npm run dev
```
Visit `http://localhost:5173/` to access the app.

### 5. Build for Production
```bash
npm run build
```

---

## 💡 UI Enhancements

Recent UI improvements include:
- Side-by-side layout for **Diagnosis Cards**
- Consistent **Lucide iconography**
- Improved spacing, shadow, and typography hierarchy
- Modern responsive design with **Tailwind CSS**

---

## 🔐 Security Notes
- **Do not commit secrets or keys** to GitHub. Use `.env.local` and `.gitignore`.
- If credentials are exposed, **revoke and rotate** immediately.
- Use AWS Secrets Manager or Supabase Vault for production secrets.

---

## 🧭 Roadmap

- [ ] Integrate multi-agent AI workflow management  
- [ ] Add health worker training progress tracking  
- [ ] Enable federated data visualization dashboard  
- [ ] Add clinical trial support tools  
- [ ] Improve offline-first capabilities for field agents  

---

## 👩‍⚕️ Author

**BenDev254**  
AI & Health Systems Developer  
📍 Kenya  
🔗 [GitHub: BenDev254](https://github.com/BenDev254)

---

## 📜 License

This project is licensed under the **MIT License** — open for research, innovation, and health AI development.

---
