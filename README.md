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

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **PDF Export**: jsPDF + html2canvas
- **Deployment**: Netlify

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

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_HCAPTCHA_SITE_KEY=your_hcaptcha_site_key
```

### 4. Set Up Supabase

Follow the instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
- Create a Supabase project
- Run the database schema SQL
- Configure authentication
- Get your API credentials

### 5. Set Up hCaptcha

1. Go to [https://www.hcaptcha.com/](https://www.hcaptcha.com/)
2. Sign up and create a new site
3. Add your site key to `.env`

### 6. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

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

### 2. Deploy to Netlify

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Click "Add new site" > "Import an existing project"
3. Connect your GitHub repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables in Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_HCAPTCHA_SITE_KEY`
6. Deploy!

### 3. Update Supabase Site URL

In your Supabase project:
1. Go to Authentication > URL Configuration
2. Add your Netlify URL to allowed redirect URLs

## Project Structure

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
