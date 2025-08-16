import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Video, Users, BarChart3, Shield, Award, LogOut } from "lucide-react";
import { useDemoAuth } from "@/hooks/useDemoAuth";
import { signInWithGoogle, signOut } from "@/lib/firebase";
import { useLocation } from "wouter";

export default function Landing() {
  const { userProfile, isAuthenticated } = useDemoAuth();
  const [, setLocation] = useLocation();

  const handleLogin = async () => {
    try {
      console.log('Starting login process...');
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
      
      // Show user-friendly error message and suggest demo mode
      alert(`Authentication is not available: ${(error as Error).message}\n\nPlease use the demo buttons below to try the platform.`);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleRoleNavigation = (role: string) => {
    setLocation(`/${role}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Stethoscope className="text-spartan-green text-2xl mr-3" />
              <h1 className="text-xl font-bold text-gray-900">SutureLearn</h1>
            </div>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {userProfile?.firstName || userProfile?.email || "User"}
                </span>
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleLogin}
                className="bg-spartan-green hover:bg-deep-green text-white"
              >
                Sign In with Google
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold mb-6 text-white drop-shadow-lg">
            Master Suturing Skills with Expert Guidance
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-gray-200 font-medium">
            A comprehensive medical education platform designed to enhance suturing proficiency through 
            interactive video learning, expert feedback, and progress tracking.
          </p>
          {isAuthenticated ? (
            <div className="space-y-4">
              <p className="text-lg text-white font-medium">Choose your role to get started:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <Button 
                  onClick={() => handleRoleNavigation('learner')}
                  size="lg"
                  className="bg-white text-spartan-green hover:bg-gray-50 border-2 border-white shadow-lg font-semibold"
                >
                  Learner
                </Button>
                <Button 
                  onClick={() => handleRoleNavigation('evaluator')}
                  size="lg"
                  className="bg-white text-spartan-green hover:bg-gray-50 border-2 border-white shadow-lg font-semibold"
                >
                  Evaluator
                </Button>
                <Button 
                  onClick={() => handleRoleNavigation('researcher')}
                  size="lg"
                  className="bg-white text-spartan-green hover:bg-gray-50 border-2 border-white shadow-lg font-semibold"
                >
                  Researcher
                </Button>
                <Button 
                  onClick={() => handleRoleNavigation('admin')}
                  size="lg"
                  className="bg-white text-spartan-green hover:bg-gray-50 border-2 border-white shadow-lg font-semibold"
                >
                  Admin
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Button 
                onClick={handleLogin}
                size="lg"
                className="bg-spartan-green hover:bg-deep-green text-white px-8 py-3 font-semibold text-lg shadow-lg"
              >
                Get Started
              </Button>
              <div className="mt-4">
                <p className="text-sm text-gray-300 mb-2">Or try the demo:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button 
                    onClick={() => setLocation('/learner')}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 text-white border-white hover:bg-white/20"
                  >
                    Demo: Learner
                  </Button>
                  <Button 
                    onClick={() => setLocation('/evaluator')}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 text-white border-white hover:bg-white/20"
                  >
                    Demo: Evaluator
                  </Button>
                </div>
              </div>
            </div>
          )}
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
            Join thousands of medical professionals improving their technique with SutureLearn
          </p>
          {isAuthenticated ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-700">Access your dashboard:</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  onClick={() => handleRoleNavigation('learner')}
                  size="lg"
                  className="bg-spartan-green hover:bg-deep-green text-white"
                >
                  Learner Dashboard
                </Button>
                <Button 
                  onClick={() => handleRoleNavigation('evaluator')}
                  size="lg"
                  className="bg-spartan-green hover:bg-deep-green text-white"
                >
                  Evaluator Dashboard
                </Button>
                <Button 
                  onClick={() => handleRoleNavigation('researcher')}
                  size="lg"
                  className="bg-spartan-green hover:bg-deep-green text-white"
                >
                  Researcher Dashboard
                </Button>
                <Button 
                  onClick={() => handleRoleNavigation('admin')}
                  size="lg"
                  className="bg-spartan-green hover:bg-deep-green text-white"
                >
                  Admin Dashboard
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              onClick={handleLogin}
              size="lg"
              className="bg-spartan-green hover:bg-deep-green text-white"
            >
              Start Learning Today
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Stethoscope className="text-spartan-green text-2xl mr-3" />
              <span className="text-lg font-semibold text-gray-900">SutureLearn</span>
            </div>
            <p className="text-gray-600">
              © 2025 SutureLearn. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
