# ResumeNow - Professional Resume Builder

A modern, responsive resume builder application built with React that helps users create professional resumes with ease.

## Features

- **Modern UI**: Clean, professional interface with gradient backgrounds and glass morphism effects
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Form Management**: Advanced form handling with React Hook Form
- **Real-time Preview**: Live preview of resume as you type
- **PDF Export**: Download resumes as high-quality PDF files with clickable links
- **Professional Templates**: Clean, ATS-friendly resume format
- **Mobile Optimized**: Compact mobile interface with touch-friendly controls

## Tech Stack

- **Frontend**: React 19.1.1 with Vite
- **Styling**: Modern CSS with gradients, backdrop-blur effects, and responsive design
- **Form Handling**: React Hook Form for efficient form management
- **PDF Generation**: jsPDF and html2canvas for high-quality PDF export
- **Icons**: Lucide React for modern iconography
- **Build Tool**: Vite for fast development and optimized builds

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

1. **Landing Page**: Start by clicking "Get Started" on the professional landing page
2. **Fill Form**: Complete the comprehensive resume form with your personal information, work experience, education, skills, and more
3. **Live Preview**: See your resume update in real-time as you fill out the form
4. **Download**: Export your completed resume as a professional PDF with clickable links

## Project Structure

```
resumenow/
├── src/
│   ├── components/          # Reusable components
│   │   └── Navbar.jsx      # Navigation component
│   ├── pages/              # Main application pages
│   │   ├── LandingPage.jsx # Landing page component
│   │   ├── FormPage.jsx    # Resume form component
│   │   └── PreviewPage.jsx # Resume preview component
│   ├── App.jsx             # Main application component
│   └── main.jsx           # Application entry point
├── public/                 # Static assets
│   └── resume-icon.svg    # Custom favicon
└── index.html             # HTML template
```

## Features in Detail

### Responsive Design
- **Desktop**: Full-featured layout with side-by-side form and preview
- **Mobile**: Compact, touch-friendly interface with optimized spacing
- **Tablet**: Adaptive layout that works perfectly on medium screens

### PDF Export
- **High Quality**: 300 DPI output for professional printing
- **Clickable Links**: Email, LinkedIn, and Portfolio links remain functional in PDF
- **Single Page**: Smart scaling ensures content fits on one page
- **ATS Friendly**: Clean formatting that works with Applicant Tracking Systems

### Form Features
- **Dynamic Sections**: Add multiple work experiences, education entries, and custom sections
- **Validation**: Real-time form validation for required fields
- **Auto-save**: Form data persists during editing
- **Professional Formatting**: Automatic formatting for dates, locations, and contact information

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
