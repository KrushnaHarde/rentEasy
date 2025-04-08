# RentEasy

RentEasy is a platform that allows users to **list items for rent** and **rent items from others** seamlessly. Whether it's tools, gadgets, or furniture, RentEasy makes the rental process simple and efficient.

## Features

- **User Authentication**: Sign up and log in securely.
- **List Items**: Add items for rent with images, descriptions, and pricing.
- **Search & Browse**: Find items available for rent based on category and location.
- **Request & Rent**: Rent items from other users with a smooth request system.
- **Chat System**: Communicate with item owners directly.
- **Payments & Transactions**: Secure payments for rentals (if implemented).

## Tech Stack

- **Frontend**: React.js / Next.js 
- **Backend**: Node.js with Express.js 
- **Database**: MongoDB 
- **Authentication**: JWT-based authentication (or OAuth)
- **Storage**: Firebase / AWS S3 (for storing images)

## Installation & Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-username/RentEasy.git
   cd RentEasy
   ```
2. **Install dependencies:**
   ```sh
   npm install  # For frontend and backend separately
   ```
3. **Set up environment variables:** Create a `.env` file and add necessary API keys and database credentials.
   ```env
   DB_URL=your_database_url
   JWT_SECRET=your_secret_key
   CLOUD_STORAGE_KEY=your_storage_key
   ```
4. **Run the application:**
   ```sh
   npm start  # Start backend and frontend servers
   ```

## Future Enhancements

- Implement **ratings & reviews** for rented items.
- Add **AI-based recommendations** for renters.
- Integrate **online payment gateways**.

## Contributing

Feel free to fork this repository and submit pull requests. Contributions are always welcome! 🚀

## License

MIT License

