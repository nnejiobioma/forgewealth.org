# Smart Tech Reviews (STR)

> **Smart Choices. Better Tech.**
> An affiliate marketing and technology review platform reviewing gadgets, hardware, web hosting providers, and digital tools.

![Smart Tech Reviews Logo](assets/logo.png)

## Overview

Smart Tech Reviews is an affiliate marketing website built with clean, modern HTML5, CSS3, and JavaScript. Designed with a **clean white primary background**, electric blue branding, and optimized for hosting on **Hostinger**.

### Features

- **High-Converting Landing Pages**: Flagship review landing page for Hostinger (`review-hostinger.html`) with sticky conversion bar, 1-click coupon code copy (`STRDEAL`), and real benchmark metrics.
- **Web Hosting Comparison**: Head-to-head performance matrix comparing Hostinger (#1 Editor's Choice), SiteGround, Bluehost, and Cloudways (`hosting.html`).
- **Tech & Gadget Reviews**: In-depth reviews and buyer guides for laptops, noise-cancelling headphones, power banks, and desk accessories (`gadgets.html`).
- **Interactive Decision Tools**:
  - *Hosting Plan Finder Quiz*: Recommends the right plan based on site type and traffic.
  - *Hosting Savings Calculator*: Dynamic slider estimating multi-year hosting savings.
  - *Instant Search Filter*: Real-time modal search across reviews and categories.
- **FTC & Legal Compliance**: Dedicated affiliate disclosure and privacy policy (`disclosure.html`) compliant with FTC endorsement standards and affiliate network guidelines.

## Project Structure

```
├── index.html               # Main homepage & comparison hub
├── review-hostinger.html     # Dedicated Hostinger affiliate review landing page
├── hosting.html             # Web hosting comparisons & buyer guides
├── gadgets.html             # Gadgets, laptops, audio & hardware reviews
├── about.html               # Lab testing methodology & mission
├── disclosure.html          # FTC affiliate disclosure & privacy policy
├── styles.css               # Core CSS design system
├── app.js                   # Interactive client-side features
├── serve.js                 # Zero-dependency local preview server
└── assets/
    ├── logo.png             # Official Smart Tech Reviews logo
    ├── hosting-cloud.jpg    # Cloud web hosting visual
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

## Deployment to Hostinger

1. Log in to [Hostinger hPanel](https://hpanel.hostinger.com/).
2. Navigate to **Websites** &rarr; your domain &rarr; **File Manager** (or connect via Git repository).
3. Place all repository files in the `public_html/` root directory.
4. Update the affiliate referral links (search for `STRDEAL` in the HTML files) with your custom affiliate parameters.

---

&copy; 2026 Smart Tech Reviews. All rights reserved.
