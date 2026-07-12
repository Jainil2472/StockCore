# StockCore

StockCore is a full-stack inventory management platform built to help businesses organise products, stock, suppliers, warehouses, and day-to-day inventory activity from one place.

It provides a modern web dashboard alongside a secure REST API for managing inventory across companies, with reporting, low-stock visibility, role-aware access, subscriptions, and workflow automation.

## Highlights

- **Inventory control** — track products, current stock, movements, attributes, units, brands, categories, and warehouses.
- **Business operations** — manage suppliers and customers, purchase-related email workflows, and transaction records.
- **Dashboard and reporting** — view summary metrics, recent activity, storage information, inventory overviews, and transaction reports.
- **Secure multi-company access** — authentication is JWT-based and associates users with their company and role.
- **Forecasting** — provides demand and inventory forecasting features for eligible subscription plans.
- **Subscriptions and payments** — supports plans, Razorpay payment handling, and webhook processing.
- **AI-assisted chat** — includes a chat service that can use a Gemini API key supplied through the environment.

## Tech stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS, React Router, Axios, Chart.js |
| Backend | Java, Spring Boot, Spring Security, JPA/Hibernate |
| Database | PostgreSQL |
| Authentication | JSON Web Tokens (JWT) |
| Integrations | Razorpay, Gmail SMTP, Gemini API |

## Repository structure

```text
StockCore/
├── frontend/                 # React and Vite user interface
│   ├── src/
│   └── package.json
└── backend/                  # Spring Boot application source
    └── src/
        ├── main/java/com/inventorymanagement/StockCore/
        │   ├── controller/   # REST endpoints
        │   ├── service/      # Business logic
        │   ├── repository/   # Data access
        │   ├── entity/       # Domain models
        │   └── security/     # JWT security
        ├── main/resources/
        └── test/
```

## Getting started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The development server is started by Vite. Use `npm run build` to create a production build.

### Backend configuration

The Spring Boot application configuration is in `backend/src/main/resources/application.properties`. Create a local environment configuration with the values needed for your environment:

```text
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
MAIL_USERNAME=your_email_address
MAIL_PASSWORD=your_email_app_password
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
GEMINI_API_KEY=your_gemini_key
```

Never commit real credentials. The repository uses environment-variable placeholders so each developer can configure their own local setup safely.

## Main API areas

The backend exposes REST endpoints under `/api`, including areas for authentication, products, inventory, stock, categories, brands, warehouses, parties, staff, dashboard statistics, reports, subscriptions, payment webhooks, email, forecasting, and chat.

## License

No license has been specified yet. Add a license file before distributing or reusing the project publicly.
