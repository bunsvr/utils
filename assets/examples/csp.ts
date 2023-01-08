import { CSP } from "../..";

const csp = CSP.parse({
    src: {
        font: ["font.example.com", "'self'"],
        sandbox: ["allow-forms", "allow-scripts"]
    }
});

console.log(csp);