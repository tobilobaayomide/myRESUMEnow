# ResumeNow - Professional Resume Builder

A modern, responsive resume builder application built with React that helps users create professional resumes with ease.

## Features

- **User Authentication**: Firebase authentication with email/password and Google OAuth
- **Modern UI**: Clean, professional interface with gradient backgrounds and glass morphism effects
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Form Management**: Advanced form handling with React Hook Form
- **Real-time Preview**: Live preview of resume as you type with Paged.js pagination
- **PDF Export**: Download resumes as high-quality PDF files with clickable links
- **DOCX Upload**: Upload existing resumes in DOCX format with intelligent parsing
- **Cloud Storage**: Save and manage multiple resumes with Firebase Firestore
- **Dashboard**: View, edit, and delete saved resumes from your personal dashboard
- **Professional Templates**: Clean, ATS-friendly resume format
- **Mobile Optimized**: Compact mobile interface with touch-friendly controls

## Tech Stack

- **Frontend**: React 19.1.1 with Vite
- **Styling**: Modern CSS with gradients, backdrop-blur effects, and responsive design
- **Routing**: React Router v7 for client-side navigation
- **Form Handling**: React Hook Form for efficient form management
- **Authentication**: Firebase Authentication (Email/Password & Google OAuth)
- **Database**: Firebase Firestore for cloud resume storage
- **PDF Generation**: jsPDF and html2canvas for high-quality PDF export
- **PDF Pagination**: Paged.js for professional document formatting
- **DOCX Parsing**: Mammoth.js for resume upload and text extraction
- **Icons**: Lucide React for modern iconography
- **Build Tool**: Vite (Rolldown) for fast development and optimized builds

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/resumenow.git
   cd resumenow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### For New Users

1. **Sign Up**: Create an account using email/password or Google OAuth
2. **Create Resume**: Click "Build New Resume" or upload an existing DOCX file
3. **Fill Form**: Complete the comprehensive resume form with your information
4. **Live Preview**: See your resume update in real-time as you fill out the form
5. **Save**: Your resume is automatically saved to the cloud
6. **Download**: Export your completed resume as a professional PDF

### For Returning Users

1. **Sign In**: Log in with your credentials
2. **Dashboard**: View all your saved resumes
3. **Manage**: View, edit, or delete any saved resume
4. **Create More**: Build additional resumes for different job applications

## Project Structure

```
resumenow/
├── src/
│   ├── components/          # Reusable components
│   │   └── Navbar.jsx      # Navigation component
│   ├── contexts/           # React contexts
│   │   └── AuthContext.jsx # Authentication state management
│   ├── firebase/           # Firebase configuration
│   │   ├── config.js      # Firebase app configuration
│   │   ├── auth.js        # Authentication functions
│   │   └── firestore.js   # Database operations
│   ├── pages/             # Main application pages
│   │   ├── LandingPage.jsx    # Landing page component
│   │   ├── LoginPage.jsx      # User login page
│   │   ├── SignupPage.jsx     # User registration page
│   │   ├── ForgotPasswordPage.jsx # Password reset
│   │   ├── DashboardPage.jsx  # User dashboard
│   │   ├── FormPage.jsx       # Resume form component
│   │   └── PreviewPage.jsx    # Resume preview component
│   ├── utils/             # Utility functions
│   │   └── resumeParser.js # DOCX parsing logic
│   ├── App.jsx            # Main application component
│   └── main.jsx          # Application entry point
├── public/                # Static assets
│   └── resume-icon.svg   # Custom favicon
└── index.html            # HTML template
```

## Features in Detail

### Authentication & User Management
- **Email/Password Authentication**: Secure account creation and login
- **Google OAuth**: Quick sign-in with Google accounts
- **Password Reset**: Forgot password functionality with email verification
- **Protected Routes**: Secure access to dashboard and resume features

### Resume Management
- **Cloud Storage**: All resumes saved to Firebase Firestore
- **Multiple Resumes**: Create and manage unlimited resumes
- **Guest Mode**: Try the app without signing up (local storage only)
- **Edit Anytime**: Return to edit any saved resume

### DOCX Upload & Parsing
- **Smart Upload**: Upload existing DOCX resumes
- **Intelligent Parsing**: Extracts name, contact info, summary, skills, and work experience
- **Format Detection**: Handles various resume formats and layouts
- **Auto-population**: Parsed data automatically fills form fields

### Responsive Design
- **Desktop**: Full-featured layout with side-by-side form and preview
- **Mobile**: Compact, touch-friendly interface with optimized spacing
- **Tablet**: Adaptive layout that works perfectly on medium screens

### PDF Export
- **High Quality**: Professional output for printing and digital sharing
- **Clickable Links**: Email, LinkedIn, and Portfolio links remain functional in PDF
- **Multi-page Support**: Paged.js handles content pagination automatically
- **ATS Friendly**: Clean formatting that works with Applicant Tracking Systems

### Form Features
- **Dynamic Sections**: Add multiple work experiences, education entries, and custom sections
- **Validation**: Real-time form validation for required fields
- **Auto-save**: Form data automatically saved to cloud or local storage
- **Professional Formatting**: Automatic formatting for dates, locations, and contact information
- **Progress Tracking**: Visual indicator shows form completion status

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with modern web technologies for optimal performance
- Designed with user experience and accessibility in mind
- Optimized for both desktop and mobile users

---

Made with ❤️ for job seekers worldwide
