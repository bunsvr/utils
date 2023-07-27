import { CORS } from "..";

// Parse CORS headers
const cors = new CORS({
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowOrigins: ["example.com", "localhost"],
    maxAge: 24 * 3600 * 1000,
    exposeHeaders: "Set-Cookie",
    allowCredentials: true
});

// Check origin "example.com"
console.log(cors.check("example.com"));
