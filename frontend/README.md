# Create Sui Template

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) and integrated with the [Sui](https://sui.io/) blockchain. It provides a comprehensive starting point for building decentralized applications (dApps) on Sui.

## Features

- **Next.js 14:** The latest version of the popular React framework for building server-rendered applications.
- **Sui Integration:** Seamless integration with the Sui blockchain using the official `@mysten/dapp-kit` and `@mysten/sui` libraries.
- **zkLogin:** Implementation of zkLogin for secure and private user authentication.
- **WalletConnect:** Support for various wallets through `@mysten/wallet-kit`.
- **UI Components:** A rich set of UI components from `shadcn/ui` and `lucide-react`.
- **Theming:** Dark mode support with `next-themes`.
- **Styling:** Styled with [Tailwind CSS](https://tailwindcss.com/) for a modern and responsive design.
- **Linting and Formatting:** Pre-configured with ESLint and Prettier for code quality and consistency.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later)
- [Bun](https://bun.sh/) (or npm/yarn/pnpm)

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/0xshikhar/create-sui-template.git
   ```
2. Install NPM packages
   ```sh
   bun install
   ```
3. Create a `.env.local` file by copying the `.env.example` file and fill in the required environment variables.
   ```sh
   cp .env.example .env.local
   ```

### Running the Application

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

The following environment variables are required to run the application:

- `NEXT_PUBLIC_SUI_NETWORK`: The Sui network to connect to (e.g., `mainnet`, `testnet`, `devnet`).
- `NEXT_PUBLIC_CLIENT_ID`: The client ID for your Google OAuth application (for zkLogin).
- `NEXT_PUBLIC_REDIRECT_URI`: The redirect URI for your Google OAuth application.
- `NEXT_PUBLIC_ENOKI_API_KEY`: Your API key for Enoki.

## Available Scripts

In the project directory, you can run:

- `bun dev`: Runs the app in the development mode.
- `bun build`: Builds the app for production to the `.next` folder.
- `bun start`: Starts a Next.js production server.
- `bun lint`: Runs ESLint to find and fix problems in your code.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Learn More

To learn more about the technologies used in this template, take a look at the following resources:

- [Sui Documentation](https://docs.sui.io/) - learn about Sui features and API.
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [React Documentation](https://react.dev/) - learn about React.
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about Tailwind CSS.

## License

Distributed under the MIT License. See `LICENSE` for more information.