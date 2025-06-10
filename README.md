# Lis Mobile

A React Native mobile application for managing tasks, built with the same design and business logic as the web application.

## Features

- User authentication
- Task management
- Real-time updates
- Material Design UI
- TypeScript support

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- React Native development environment setup
- iOS Simulator (for iOS development)
- Android Studio and Android SDK (for Android development)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd LisMobile
```

2. Install dependencies:
```bash
npm install
```

3. Install iOS dependencies (iOS only):
```bash
cd ios
pod install
cd ..
```

## Configuration

1. Update the API URL in `src/services/api.ts` to point to your backend server:
```typescript
const API_URL = 'http://your-backend-url:3000';
```

## Running the App

### iOS

```bash
npm run ios
```

### Android

```bash
npm run android
```

### Development

```bash
npm start
```

## Project Structure

```
src/
  ├── components/     # Reusable components
  ├── screens/        # Screen components
  ├── services/       # API and other services
  ├── types/          # TypeScript type definitions
  ├── utils/          # Utility functions and constants
  └── contexts/       # React Context providers
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
# Mobile-Lis
