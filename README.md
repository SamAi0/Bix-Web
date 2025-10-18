# IndiaBIX Clone

A modern, responsive clone of IndiaBIX built with React, TypeScript, and Tailwind CSS. This application provides a comprehensive platform for practicing aptitude, reasoning, and technical questions with detailed explanations.

## Features

### 🎯 Core Functionality
- **Question Practice**: Practice individual questions with detailed explanations
- **Quiz System**: Take timed quizzes with multiple choice questions
- **Category-based Learning**: Organized questions by subjects (Aptitude, Reasoning, English, Technical)
- **Search Functionality**: Find questions by keywords, topics, or categories
- **User Progress Tracking**: Monitor performance and track improvement

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with seamless desktop experience
- **Smooth Animations**: Framer Motion animations for enhanced user experience
- **Modern Components**: Clean, accessible components with Tailwind CSS
- **Interactive Elements**: Hover effects, transitions, and micro-interactions

### 📱 Responsive Features
- **Mobile Navigation**: Collapsible hamburger menu for mobile devices
- **Touch-friendly**: Optimized for touch interactions on mobile devices
- **Adaptive Layout**: Grid layouts that adapt to different screen sizes
- **Fast Loading**: Optimized performance across all devices

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth transitions
- **Routing**: React Router DOM for navigation
- **Icons**: Lucide React for consistent iconography
- **Build Tool**: Vite for fast development and building

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd indiabix-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to view the application

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx       # Navigation header
│   ├── Footer.tsx       # Site footer
│   ├── CategoryCard.tsx # Category display card
│   ├── StatsSection.tsx # Statistics display
│   └── FeaturedSection.tsx # Featured content
├── pages/               # Page components
│   ├── HomePage.tsx     # Landing page
│   ├── CategoryPage.tsx # Category listing
│   ├── QuizPage.tsx     # Quiz interface
│   ├── SearchPage.tsx   # Search functionality
│   └── ProfilePage.tsx  # User profile
├── data/                # Mock data and types
│   └── mockData.ts      # Sample questions and categories
├── types/               # TypeScript type definitions
│   └── index.ts         # Shared types
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## Features Overview

### 🏠 Homepage
- Hero section with call-to-action
- Statistics showcase
- Category cards with question counts
- Featured practice tests
- Feature highlights

### 📚 Categories
- **Aptitude**: Arithmetic, Algebra, Geometry, Trigonometry
- **Reasoning**: Verbal, Non-verbal, Analytical
- **English**: Grammar, Vocabulary, Comprehension
- **Technical**: Programming, Databases, Algorithms
- **General Knowledge**: Current Affairs, History, Geography

### 🧠 Quiz System
- **Practice Mode**: Individual questions with explanations
- **Timed Tests**: Complete quizzes with time limits
- **Progress Tracking**: Real-time score and progress
- **Difficulty Levels**: Easy, Medium, Hard questions
- **Detailed Explanations**: Step-by-step solutions

### 🔍 Search & Filter
- **Smart Search**: Search by question content or tags
- **Category Filtering**: Filter by subject categories
- **Difficulty Filtering**: Filter by difficulty level
- **Real-time Results**: Instant search results

### 👤 User Profile
- **Progress Tracking**: Question count, accuracy, time spent
- **Achievement System**: Unlock badges and milestones
- **Activity History**: Track recent practice sessions
- **Performance Analytics**: Visual progress indicators

## Design System

### Colors
- **Primary**: Blue gradient (#3b82f6 to #1e3a8a)
- **Secondary**: Gray scale (#f8fafc to #0f172a)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: Bold weights (600-700)
- **Body**: Regular weight (400)
- **Captions**: Medium weight (500)

### Components
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Primary, secondary, and outline variants
- **Forms**: Clean inputs with focus states
- **Navigation**: Sticky header with mobile menu

## Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by IndiaBIX.com
- Icons by Lucide React
- Animations by Framer Motion
- Styling by Tailwind CSS
