# StockCore backend

Spring Boot backend for StockCore.

## Render deployment

Create a Render Web Service from this repository with these settings:

- Root directory: `backend`
- Build command: `mvn clean package -DskipTests`
- Start command: `java -jar target/StockCore-0.0.1-SNAPSHOT.jar`

Copy the variables in `.env.example` into Render's Environment page. Do not commit real credentials. Set `APP_CORS_ALLOWED_ORIGINS` to the exact Vercel frontend URL and set the frontend's `VITE_API_BASE_URL` to this service's `onrender.com` URL.
