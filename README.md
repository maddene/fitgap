# ICCE-FITGAP Assessment Tool

Feedback-Informed Treatment GAP Assessment Tool (FITGAP) - An online questionnaire for implementing Feedback Informed Treatment by Scott D. Miller.

## Features

- **Multi-realm Assessment**: Covers 4 realms (Clinical, Administrative, Documentation & IT, Stakeholders) with 38+ questions
- **User Authentication**: Secure registration with hCaptcha verification for healthcare professionals
- **Progress Saving**: Save partial assessments and return later
- **Visual Analytics**: Interactive charts and radar visualizations of assessment results
- **PDF Export**: Export assessment results to PDF
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Authentication**: Netlify Identity
- **Storage**: Netlify Blobs (serverless key-value store)
- **Charts**: Recharts
- **PDF Export**: jsPDF + html2canvas
- **Deployment**: Netlify

**Why This Stack?**
Simple, scalable, and perfect for small teams (10-20 concurrent users). No database management needed!

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/icce-fitgap.git
cd icce-fitgap
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

**Note**: For local testing, authentication will only work after deploying to Netlify and enabling Netlify Identity. Locally, you can test the UI without authentication by temporarily commenting out the `<ProtectedRoute>` wrappers in [src/App.jsx](src/App.jsx).

## Deployment to Netlify

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/icce-fitgap.git
git push -u origin main
```

### 2. Deploy to Netlify1. Go to [https://app.netlify.com](https://app.netlify.com)2. Click "Add new site" > "Import an existing project"3. Connect your GitHub repository4. Configure build settings:   - Build command: `npm run build`   - Publish directory: `dist`5. Deploy!### 3. Enable Netlify IdentityAfter deployment:1. Go to your site in Netlify Dashboard2. Navigate to **Site settings** > **Identity**3. Click **Enable Identity**4. Under **Registration preferences**, choose "Invite only" or "Open"5. (Optional) Enable external providers (Google, GitHub, etc.)## Project Structure

```
icce-fitgap/
├── src/
│   ├── components/         # React components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/              # Page components
│   │   ├── Dashboard.jsx
│   │   ├── AssessmentForm.jsx
│   │   └── AssessmentResults.jsx
│   ├── hooks/              # Custom React hooks
│   │   └── useAuth.jsx
│   ├── lib/                # Utilities
│   │   └── supabase.js
│   ├── data/               # Assessment data
│   │   └── assessmentQuestions.js
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
├── public/                 # Static assets
├── netlify.toml           # Netlify configuration
└── package.json
```

## Usage

### For Assessors

1. Register an account with your healthcare organization details
2. Complete the CAPTCHA verification
3. Create a new assessment
4. Complete questions across all 4 realms
5. Save progress at any time
6. Submit when complete
7. View results with charts and analytics
8. Export to PDF

### For Reviewers/Admins

(Future feature - view all assessments across the organization)

## License

© 2023, Miller & Bargmann

## Support

For issues or questions, please contact your system administrator.
