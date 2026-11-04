# Smart Tech Reviews (STR)

> **Smart Choices. Better Tech.**
> An independent technology review platform benchmarking laptops, audio gear, desk hardware, and cloud hosting providers.

![Smart Tech Reviews Logo](assets/logo.png)

## Overview

Smart Tech Reviews is an editorial hardware and cloud review website built with modern HTML5, CSS3, and JavaScript. Designed with an **Obsidian & Warm Stone Bento aesthetic**, Space Grotesk + JetBrains Mono typography, and cyber indigo accents.

### Features

- **Cloud & Web Hosting Comparison**: Head-to-head performance matrix comparing SiteGround, Cloudways, Kinsta, and Bluehost (`hosting.html`).
- **Tech & Gadget Reviews**: In-depth reviews and buyer guides for laptops, noise-cancelling headphones, power banks, and desk accessories (`gadgets.html`).
- **Interactive Decision Tools**:
  - *Cloud Plan Finder Quiz*: Recommends the right plan based on site type and traffic.
  - *Cloud Savings Calculator*: Dynamic slider estimating multi-year hosting savings.
  - *Instant Search Filter*: Real-time modal search across reviews and categories.
- **FTC & Legal Compliance**: Dedicated affiliate disclosure and privacy policy (`disclosure.html`) compliant with FTC endorsement standards.

## Project Structure

```
├── index.html               # Main homepage & comparison hub
├── hosting.html             # Cloud & web hosting comparisons & buyer guides
├── gadgets.html             # Gadgets, laptops, audio & hardware reviews
├── about.html               # Lab testing methodology & mission
├── disclosure.html          # FTC affiliate disclosure & privacy policy
├── styles.css               # Core CSS design system
├── app.js                   # Interactive client-side features
├── serve.js                 # Zero-dependency local preview server
└── assets/
    ├── logo.png             # Official Smart Tech Reviews logo
    ├── hosting-cloud.jpg    # Cloud infrastructure visual
    └── tech-gear.jpg        # Tech gear & gadgets visual
```

## Local Development & Preview

Run the built-in zero-dependency preview server:

```bash
node serve.js
```

Open your browser to:
```
http://127.0.0.1:3000/
```

---

&copy; 2026 Smart Tech Reviews. All rights reserved.
