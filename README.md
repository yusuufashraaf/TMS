# TMS: Task Management System

## 🌟 Overview

**TMS** is a full-stack **Task Management System** designed for teams to efficiently manage tasks, track progress, and collaborate. The frontend is built with Angular, while the backend uses Node.js + Express with a MongoDB or MySQL database. It features secure authentication, real-time notifications, and comprehensive task/project management tools.

## 🚀 Core Features

| Module                         | Description                                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| 👤 **User Authentication**     | Secure registration and login with JWT-based authentication. Role-based access: Admin/User.                               |
| 📋 **Task Management**         | Create, read, update, delete tasks. Each task includes title, description, priority, status, deadline, and assigned user. |
| 🏗️ **Project View**            | Group tasks under projects for efficient tracking and organization.                                                       |
| 🔄 **Filtering & Sorting**     | Filter tasks by status, priority, or deadline; sort tasks for better management.                                          |
| 🔔 **Real-Time Notifications** | Users are notified immediately when assigned a new task using Socket.IO or Firebase.                                      |
| 📊 **Dashboard & Reports**     | Visualize total tasks, completed vs pending tasks, tasks by priority, and generate CSV/PDF reports.                       |

## 🧱 Technology Stack

| Category                | Technology       |
| ----------------------- | ---------------- |
| Frontend Development    | Angular          |
| Backend Development     | Node.js, Express |
| Database                | MongoDB          |
| Real-time Communication | Socket.IO        |
| Programming Language    | TypeScript       |

### 🧰 Key Libraries

| Library                      | Purpose                             |
| ---------------------------- | ----------------------------------- |
| Angular Material / Bootstrap | UI components and responsive design |
| RxJS                         | Reactive programming                |
| JWT                          | Authentication and token management |
| Socket.IO / Firebase         | Real-time notifications             |
| CSV / PDF Export Libraries   | Task report generation              |

## 📁 Project Structure

\`\`\`bash
app/
│ app.config.ts
│ app.css
│ app.html
│ app.routes.ts
│ app.spec.ts
│ app.ts
│
├── Components/
│ ├── auth/
│ │ ├── login/
│ │ │ login.css
│ │ │ login.html
│ │ │ login.ts
│ │ └── register/
│ │ register.css
│ │ register.html
│ │ register.ts
│ │
│ ├── dashboard/
│ │ └── dashboard/
│ │ dashboard.css
│ │ dashboard.html
│ │ dashboard.ts
│ │
│ ├── projects/
│ │ └── projects/
│ │ projects.css
│ │ projects.html
│ │ projects.ts
│ │
│ ├── tasks/
│ │ └── tasks/
│ │ tasks.css
│ │ tasks.html
│ │ tasks.ts
│ │
│ └── shared/
│ └── navbar/
│ └── navbar/
│ navbar.css
│ navbar.html
│ navbar.ts
│
├── Guards/
│ auth-guard-guard.ts
│ login-guard-guard.ts
│
├── interceptors/
│ auth-interceptor.ts
│
└── Services/
auth.service.ts
notification.service.ts
pdf.service.ts
project.service.ts
task.service.ts
\`\`\`

## 🛠️ Setup & Installation

### System Requirements

| Tool        | Version |
| ----------- | ------- |
| Node.js     | 18+     |
| Angular CLI | Latest  |
| Database    | MongoDB |

### Installation Steps

\`\`\`bash
git clone https://github.com/your-username/TMS.git
cd TMS
npm install
\`\`\`

### Environment Configuration

Update \`src/environments/environment.ts\`:

\`\`\`ts
export const environment = {
production: false,
apiBase: 'http://localhost:8000/api/v1/(route)',
};
\`\`\`

## 🔐 Security Features

| Feature            | Description                             |
| ------------------ | --------------------------------------- |
| JWT Authentication | Token-based secure user sessions        |
| Role-Based Access  | Admin/User permissions                  |
| Input Validation   | Prevents XSS and ensures data integrity |
| Secure Socket.IO   | Token-validated real-time notifications |

## 📊 Dashboard Capabilities

| Feature           | Description                                                     |
| ----------------- | --------------------------------------------------------------- |
| Analytics         | View total tasks, completed vs pending tasks, tasks by priority |
| Project Overview  | Group tasks under projects for clear organization               |
| Reports           | Export task lists as CSV or PDF                                 |
| Real-time Updates | Instant notifications for task assignments                      |

## 🛠️ Developer Commands

| Command                           | Description                    |
| --------------------------------- | ------------------------------ |
| \`ng serve\`                      | Start local Angular dev server |
| \`npm run dev\`                   | Start backend Node.js server   |
| \`ng build --configuration prod\` | Build frontend for production  |
| \`ng test\`                       | Run frontend tests             |
| \`ng lint\`                       | Run code linter                |

## 🌍 Deployment

### Production Environment

Update \`environment.prod.ts\`:

\`\`\`ts
export const environment = {
production: true,
apiBase: 'https://your-api.com/api',
};
\`\`\`

### Build

\`\`\`bash

# Frontend

ng build --configuration production

# Backend

npm run start
\`\`\`

## 🤝 Contributing

| Step                  | Example Command                           |
| --------------------- | ----------------------------------------- |
| Create Feature Branch | \`git checkout -b feature/your-feature\`  |
| Commit Changes        | \`git commit -m "feat: add new feature"\` |
| Push to GitHub        | \`git push origin feature/your-feature\`  |
| Open Pull Request     | On GitHub                                 |

### Best Practices

- Follow Angular & Node.js style guides
- Add unit/integration tests
- Use conventional commit messages

## 🗺️ Roadmap

| Feature                | Status       | Description                                 |
| ---------------------- | ------------ | ------------------------------------------- |
| Mobile PWA Support     | Planned      | Offline capabilities, mobile-first UX       |
| Multi-language Support | Planned      | i18n support for global audiences           |
| Dockerized Deployment  | Under Review | Containerized setup for scalable deployment |

## 📩 Support & Contact

| Method        | Link                                                         |
| ------------- | ------------------------------------------------------------ |
| Email         | [yusuufashraaf@icloud.com](mailto:yusuufashraaf@icloud.com)  |
| GitHub Issues | [GitHub Issues](https://github.com/yusuufashraaf/TMS/issues) |

## 📄 License

Licensed under the **MIT License**.

© 2025 **Youssef Ashraf**.
