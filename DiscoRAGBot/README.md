```markdown
# DiscoRAGBot

DiscoRAGBot is a sophisticated Discord bot leveraging Retrieval-Augmented Generation (RAG) to function as an intelligent knowledge base. It features a password-protected web interface for seamless content management and bot configuration, facilitating a comprehensive user experience.

## Overview

DiscoRAGBot architecture consists of a ReactJS frontend managed by Vite and an Express-based backend with MongoDB as the database. The web interface enables users to manage various content types and configure the bot's behavior and responses. Major components and technologies used:

1. **Frontend**:
    - **ReactJS** based frontend located in the `client/` folder.
    - Uses **Vite** devserver, running on port 5173.
    - **shadcn-ui** component library integrated with **Tailwind CSS**.
    - Client-side routing managed by **react-router-dom**.
    - All backend requests are prefixed with `/api/`.

2. **Backend**:
    - **Express** server located in the `server/` folder, running on port 3000.
    - REST API endpoints for various functionalities.
    - **MongoDB** support with **Mongoose**.
    - Token-based authentication using **bearer access** and **refresh tokens**.

## Features

Key features of DiscoRAGBot include:

- **Password-Protected Web Interface**:
  - Manage knowledge base content via file uploads, URL scraping, and manual entries.
  - Bot personality and behavior configuration with extensive customization options.
  - Detailed analytics dashboard displaying usage statistics, content performance, and question analysis.

- **Discord Bot Functionality**:
  - Users interact with the bot through mentions or command prefixes.
  - Bot provides intelligent responses with optional source references.
  - Real-time typing indicators during response generation.

- **Content Management**:
  - Supports multiple file formats for content ingestion.
  - URL scraping for JavaScript-heavy websites.
  - Rich text editor for manual knowledge base entries.

- **Bot Customization**:
  - Configuration for response tone, length, and format.
  - Enable/disable bot in specific channels.
  - Confidence threshold settings and source citation options.

## Getting Started

### Requirements

To run DiscoRAGBot, ensure you have the following installed:

- **Node.js** (v14.x or higher)
- **npm** (v6.x or higher)
- **MongoDB** database

### Quickstart

Follow these steps to set up and run DiscoRAGBot:

1. **Clone the repository**:
   ```shell
   git clone https://github.com/yourusername/discoragbot
   cd discoragbot
   ```

2. **Install dependencies**:
   ```shell
   npm install
   ```

3. **Start the project**:
   ```shell
   npm run start
   ```

4. **Access the frontend**:
   Open your browser and navigate to `http://localhost:5173`.

5. **Access the backend API**:
   The backend is accessible at `http://localhost:3000`.

### License

The project is proprietary (not open source). 

&copy; 2024. All rights reserved.
```
