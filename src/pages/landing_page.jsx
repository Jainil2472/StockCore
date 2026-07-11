import React, { useState } from 'react';
import { Boxes, TrendingUp, Shield, BarChart3, Bell, Users, Package, Check, ArrowRight, Menu, X, Zap, Clock, Globe } from 'lucide-react';
import Nav from '@/components/Nav.jsx';
import Footer from '@/components/footer';
export default function Landing_page() {

  const features = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Real-time Analytics",
      description: "Track stock levels, sales trends, and inventory turnover with live dashboards and insights."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with automated backups, audit trails, and compliance certifications."
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Smart Alerts",
      description: "Get notified about low stock, reorder points, and anomalies before they become problems."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Reporting",
      description: "Generate comprehensive reports with custom filters, exports, and scheduled deliveries."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Collaboration",
      description: "Role-based access, task assignments, and seamless communication across departments."
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: "Multi-warehouse",
      description: "Manage inventory across multiple locations with unified visibility and control."
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "2,999",
      period: "month",
      description: "Perfect for small businesses",
      features: [
        "Up to 1,000 SKUs",
        "1 warehouse location",
        "Basic analytics",
        "Email support",
        "Mobile app access",
        "Real-time tracking"
      ]
    },
    {
      name: "Professional",
      price: "7,999",
      period: "month",
      description: "For growing companies",
      featured: true,
      features: [
        "Up to 10,000 SKUs",
        "5 warehouse locations",
        "Advanced analytics",
        "Priority support",
        "API access",
        "Custom integrations",
        "Multi-user access",
        "Automated reporting"
      ]
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: [
        "Unlimited SKUs",
        "Unlimited locations",
        "White-label solution",
        "Dedicated support",
        "Custom development",
        "SLA guarantee",
        "Training & onboarding",
        "Advanced security"
      ]
    
    }
  ];

  return (
    <div className="bg-white">
      {/* Navigation */}
      <Nav />
 
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full mb-6 border border-emerald-100">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold">Trusted by 10,000+ businesses worldwide</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Modern Inventory<br />
              <span className="bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">
                Management Simplified
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Take control of your inventory with real-time tracking, powerful analytics, and automated workflows. Built for businesses that want to scale.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-blue-700 transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 group">
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all">
                Watch Demo
              </button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Dashboard Preview */}
          <div className="mt-20 max-w-5xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl transform rotate-1"></div>
              <div className="relative bg-white p-4 rounded-2xl shadow-2xl border border-gray-200">
                <div className="bg-gray-50 rounded-xl h-96 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent mb-2">10K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent mb-2">50M+</div>
              <div className="text-gray-600">Items Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent mb-2">150+</div>
              <div className="text-gray-600">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Everything you need to manage inventory
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to streamline your operations and boost efficiency
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-emerald-200 hover:shadow-xl transition-all group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Built for speed and efficiency
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                StockFlow helps you reduce costs, eliminate stockouts, and make data-driven decisions. Our platform grows with your business.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Save 10+ hours per week</h3>
                    <p className="text-gray-600">Automate repetitive tasks and focus on growing your business instead of managing spreadsheets.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Reduce waste by 30%</h3>
                    <p className="text-gray-600">Smart forecasting and alerts help you optimize stock levels and minimize excess inventory.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Scale globally</h3>
                    <p className="text-gray-600">Multi-currency, multi-language support with localized compliance for 150+ countries.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl transform -rotate-3"></div>
              <div className="relative bg-white p-6 rounded-2xl shadow-2xl">
                <div className="bg-gray-50 rounded-xl h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">Feature Showcase</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
           <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
             <div className="max-w-7xl mx-auto">
               <div className="text-center mb-16">
                 <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                   Simple, transparent pricing
                 </h2>
                 <p className="text-xl text-gray-600">
                   Choose the plan that fits your business needs
                 </p>
               </div>
     
               <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                 {pricingPlans.map((plan, index) => (
                   <div 
                     key={index}
                     className={`bg-white rounded-2xl p-8 ${
                       plan.featured 
                         ? 'border-2 border-emerald-500 shadow-2xl shadow-emerald-500/20 transform scale-105' 
                         : 'border border-gray-200'
                     }`}
                   >
                     {plan.featured && (
                       <div className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white text-sm font-semibold px-4 py-1 rounded-full inline-block mb-4">
                         Most Popular
                       </div>
                     )}
                     <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                     <p className="text-gray-600 mb-6">{plan.description}</p>
                     <div className="mb-6">
                       <span className="text-5xl font-bold text-gray-900">
                         {plan.price === "Custom" ? plan.price : `₹${plan.price}`}
                       </span>
                       {plan.price !== "Custom" && <span className="text-gray-600">/{plan.period}</span>}
                     </div>
                     <a href="/signup" className={`block w-full py-3 px-6 rounded-xl font-semibold transition-all text-center ${
                       plan.featured
                         ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white hover:from-emerald-600 hover:to-blue-700 shadow-lg shadow-emerald-500/25'
                         : 'border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                     }`}>
                       Get Started
                     </a>
                     <ul className="mt-8 space-y-4">
                       {plan.features.map((feature, idx) => (
                         <li key={idx} className="flex items-center gap-3">
                           <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                           <span className="text-gray-600">{feature}</span>
                         </li>
                       ))}
                     </ul>
                   </div>
                 ))}
               </div>
             </div>
           </section>

      <Footer/>
    </div>
  );
}