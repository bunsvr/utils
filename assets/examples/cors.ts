import { cors, CORS } from "../..";

// Parse CORS headers
const headers: CORS.Headers = cors({
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowOrigins: ["example.com", "localhost:3000", "localhost:8080"],
}, "localhost:8080");

console.log(headers);