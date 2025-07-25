# MoneyWise

MoneyWise is a modern financial management application designed to help individuals and families track, analyze, and optimize their finances effectively. With a focus on user experience and powerful features, MoneyWise makes managing money easy and intuitive.

Visit MoneyWise here!
[https://money-wise-cyan.vercel.app/](https://money-wise-cyan.vercel.app/)

## Features

- Track income, expenses, and balances.
- Manage personal and family finances with seamless mode switching.
- Analyze financial data with visual insights using bar and pie charts.
- User-friendly UI powered by Tailwind CSS.
- Real-time data synchronization with React-Query.

## Built With

- **Next.js 14** - A framework for building fast, server-rendered React applications.
- **TypeScript** - Ensures code reliability and maintainability.
- **Prisma ORM** - For seamless database integration and management.
- **Tailwind CSS** - For designing a modern, responsive user interface.
- **React-Query** - For efficient state management and real-time updates.

## Areas for Improvement

MoneyWise is constantly evolving to provide a better experience. Below are the planned improvements:

1. **Auto-Update Balances**  
   Automatically update balance, expense, and income fields upon adding a transaction.

2. **Transfer Feature**  
   Introduce a "Transfers" feature to enable moving funds between accounts. Research best practices for implementation.

3. **Edit Transaction**  
   Allow users to modify existing transactions for flexibility and accuracy.

4. **Bar Chart Improvement**  
   Enhance the bar chart visuals for better data representation.

5. **Mobile UI Fixes**  
   Adjust button positioning on mobile devices for a seamless experience.

6. **Picker Adjustments**  
   Fix the out-of-bounds issue for emoji and date pickers.

7. **Future Feature: CSV Import**  
   Enable importing transactions via CSV files for easier data migration.

8. **Sign-In Fix**  
   Transition sign-in functionality from Clerk Development to production-ready settings.

9. **Family Mode**  
   Expand Family Mode functionality for shared financial management.

10. **Bulk Delete**  
    Add a feature to delete multiple transactions at once for easier data management.

11. **Percentage Difference**  
    Display percentage differences in income/expenses from previous periods.

12. **Pie Chart Categorization**  
    Introduce pie charts for categorizing transactions for improved data visualization.

## Contributing

Contributions are welcome! If you have ideas or want to fix a bug, feel free to open an issue or submit a pull request.

## Getting Started

To run MoneyWise locally:

2. Navigate to the project directory:
   ```bash
   cd moneywise
   ```

3. Install dependencies:
   ```bash
   npm install
   ```
   
4. Configure Authentication:  
   MoneyWise uses **Clerk** for user authentication.  
   Set up your Clerk project and add the required Clerk environment variables to your `.env.local` file and also add these lines:  
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZGVjaWRpbmctY29kLTE3LmNsZXJrLmFjY291bnRzLmRldiQ

   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/wizard
   CLERK_AFTER_SIGN_OUT_URL=/sign-in
   ``` 
   

5. Set up the database:  
   Find the `schema.prisma` file configure it like so:  
   ```prisma
   datasource db {
     provider = "sqlite" 
     url      = env("file:./dev.db")
   }
   ```  
   Then, migrate the database schema:  
   ```bash
   npx prisma migrate dev
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```
Test commit

6. Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.
