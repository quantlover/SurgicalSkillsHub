import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Video, Users, BarChart3, Shield, Award } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Stethoscope className="text-spartan-green text-2xl mr-3" />
              <h1 className="text-xl font-bold text-gray-900">SuturLearn</h1>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-spartan-green hover:bg-deep-green text-white"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-spartan-green to-deep-green text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Master Suturing Skills with Expert Guidance
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            A comprehensive medical education platform designed to enhance suturing proficiency through 
            interactive video learning, expert feedback, and progress tracking.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="bg-white text-spartan-green hover:bg-gray-100"
          >
            Get Started
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Excel
            </h3>
            <p className="text-xl text-gray-600">
              Comprehensive tools for learners, evaluators, and researchers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <Card className="text-center">
              <CardHeader>
                <Video className="w-12 h-12 text-spartan-green mx-auto mb-4" />
                <CardTitle>Interactive Video Library</CardTitle>
                <CardDescription>
                  Access curated suturing videos with synchronized subtitles and step-by-step guidance
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="w-12 h-12 text-spartan-green mx-auto mb-4" />
                <CardTitle>Expert Feedback</CardTitle>
                <CardDescription>
                  Receive detailed evaluations from certified instructors using standardized rubrics
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BarChart3 className="w-12 h-12 text-spartan-green mx-auto mb-4" />
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription>
                  Monitor your learning journey with comprehensive analytics and milestone tracking
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="w-12 h-12 text-spartan-green mx-auto mb-4" />
                <CardTitle>Role-Based Access</CardTitle>
                <CardDescription>
                  Secure, personalized dashboards for learners, evaluators, researchers, and administrators
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Award className="w-12 h-12 text-spartan-green mx-auto mb-4" />
                <CardTitle>Voice Feedback</CardTitle>
                <CardDescription>
                  Advanced speech-to-text technology for efficient feedback collection and review
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BarChart3 className="w-12 h-12 text-spartan-green mx-auto mb-4" />
                <CardTitle>Research Analytics</CardTitle>
                <CardDescription>
                  Comprehensive data export and analysis tools for educational research
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Enhance Your Suturing Skills?
          </h3>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of medical professionals improving their technique with SuturLearn
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="bg-spartan-green hover:bg-deep-green text-white"
          >
            Start Learning Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Stethoscope className="text-spartan-green text-2xl mr-3" />
              <span className="text-lg font-semibold text-gray-900">SuturLearn</span>
            </div>
            <p className="text-gray-600">
              © 2025 SuturLearn. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
