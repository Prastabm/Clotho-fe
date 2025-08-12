# Clotho: E-Commerce clothing platform

This document outlines the architecture and features of the E-commerce Platform, a comprehensive solution for online retail.

### Link to deployment: [﻿clotho-fe-isd9.vercel.app/](https://clotho-fe-isd9.vercel.app/) 
### Link to backend-repository: [﻿github.com/Prastabm/Clotho-Monolithic](https://github.com/Prastabm/Clotho-Monolithic) 
## Features
This platform provides a robust set of features for both administrators and customers.

### Administrator Features
- **User Management:** Admins can view and manage user accounts.
- **Product Management:** Admins can add, update, and remove products from the catalog. This includes managing product images through an image moderation service.
- **Order Management:** Admins have access to all customer orders.
- **Analytics:** The admin portal includes a dashboard to view key analytics and insights into sales and customer behavior.
- **Communication:** Admins are notified of new messages from users and can reply to them.
### Customer Features
- **Product Discovery:** Customers can browse and search for products.
- **Shopping Cart:** Customers can add products to their cart and manage the items before checkout.
- **Checkout:** A streamlined checkout process allows customers to purchase items.
- **Payment Integration:** The platform is integrated with a secure payment gateway (Stripe).
- **Communication:** Customers can send messages to the support team and view replies.
## Architecture Overview
The system is built with a **monolithic backend** and a separate front end. This means all the core business logic for users, products, and orders is handled within a single, unified backend application. This approach simplifies development and deployment. The front end communicates directly with the backend's REST API endpoints.

## System Components
### Frontend
- **Admin Portal:** A web interface for administrators to manage the platform. It interacts with the backend to manage products and view analytics.
- **Product Catalogue:** The customer-facing interface for browsing and purchasing products. It includes features like a shopping cart and a checkout process.
### Backend (Monolith)
The monolithic backend application contains several core modules:

- **User Module:** Manages user data and authentication.
- **Product Module:** Handles all product-related logic, including CRUD operations and managing product information. It also interacts with the image moderation service.
- **Order Module:** Manages customer orders, from creation to fulfillment.
- **Webhook Handler:** A component within the monolith that listens for and handles payment events from the payment gateway.
### External Integrations
- **Firebase Auth:** Used for user authentication.
- **Stripe:** Integrated as the payment gateway for processing transactions.
- **Gmail SMTP:** Used for sending email replies to users.
## Database Schema
The system utilizes a central database with three primary entities to manage its data effectively.

**Cart Entity:**

- **Purpose:** Stores information about the user's shopping cart.
- **Details:** Contains `user` , `cart` , `items` , and `quantities` .
**Inventory Entity:**

- **Purpose:** Tracks stock levels for all products.
- **Details:** Is updated upon purchase to reflect the current inventory.
**Purpose:** Stores all messages exchanged between users and administrators.

**Communications Entity:Details:** Contains `message content`, `status`, `sender`, and `recipient`.

---

> _**Overall Architecture**_

![diagram-export-12-8-2025-12_20_27-am.png](https://eraser.imgix.net/workspaces/K3FMyYb2pAe6tyqDLPI8/7b5Aq6I5FSgyoprGLWNt8lT5n7n1/OlTe-PKqURXNXf952JQEo.png?ixlib=js-3.7.0 "diagram-export-12-8-2025-12_20_27-am.png")

> _**Communication Flow**_

![diagram-export-12-8-2025-12_21_21-am.png](https://eraser.imgix.net/workspaces/K3FMyYb2pAe6tyqDLPI8/7b5Aq6I5FSgyoprGLWNt8lT5n7n1/RzzovVXafccJSdwh8kKma.png?ixlib=js-3.7.0 "diagram-export-12-8-2025-12_21_21-am.png")



 

