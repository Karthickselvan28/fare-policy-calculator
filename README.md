# Fare Policy Calculator

A web application for calculating and managing fare policies for ride-hailing services. This application allows users to create, save, and compare different fare policies with various parameters like base fare, per kilometer charges, and threshold fares.

## Features

- Create and customize fare policies
- Save policies for future reference
- View detailed policy information
- Delete saved policies
- Responsive design for both desktop and mobile
- Real-time fare calculations
- Support for multiple cities and vehicle variants

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/fare-policy-calculator.git
cd fare-policy-calculator
```

2. Install dependencies:

```bash
npm install
```

3. Create a `src/data` directory:

```bash
mkdir -p src/data
```

## Running the Application

1. Start the backend server:

```bash
npm run server:dev
```

2. In a new terminal, start the frontend development server:

```bash
npm run dev
```

3. Open your browser and navigate to:

```
http://localhost:3001
```

## Project Structure

```
fare-policy-calculator/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── utils/         # Utility functions
│   ├── types/         # TypeScript type definitions
│   └── data/          # Data storage directory
├── public/            # Static assets
├── server.js          # Backend server
└── package.json       # Project dependencies
```

## API Endpoints

The application uses the following API endpoints:

- `GET /api/policies` - Retrieve all saved policies
- `POST /api/policies` - Save a new policy or update existing policies

## Development

- Frontend runs on port 3001
- Backend runs on port 3002
- The application uses Vite for frontend development
- Express.js for the backend server

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with React and Material-UI
- Uses Express.js for the backend
- Data persistence using JSON file storage

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
