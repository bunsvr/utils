import { CSP } from "..";

const csp = CSP.parse({
    src: {
        font: ["font.google.com", "'self'"],
        script: ["'self'", "bootstrapcdn.com"],
    },
    sandbox: ["allow-forms", "allow-scripts"],
    navigate: ["example.com", "google.com"],
});

console.log(csp);