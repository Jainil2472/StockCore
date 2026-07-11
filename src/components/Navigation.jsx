import React, { useState } from 'react';
import Logo from '@/assets/stock_core_main_logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, CreditCard, Activity, TrendingUp, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function Nav2() {
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [subscriptionDropdownOpen, setSubscriptionDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <img src={Logo} alt="Stock Core" />
            </div>
            <span className="text-xl font-bold text-gray-900">Stock Core</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            

            {/* ✅ Subscription Dropdown - Only show when logged in */}
            {isLoggedIn && (
              <div className="relative">
                <button
                  onClick={() => setSubscriptionDropdownOpen(!subscriptionDropdownOpen)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Subscription
                  <ChevronDown className={`w-4 h-4 transition-transform ${subscriptionDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {subscriptionDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
                    <Link
                      to="/subscription"
                      onClick={() => setSubscriptionDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                      <span className="font-medium">Subscription Plans</span>
                    </Link>
                    <Link
                      to="/subscription/current"
                      onClick={() => setSubscriptionDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Activity className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Current Plan</span>
                    </Link>
                    <Link
                      to="/subscription/usage"
                      onClick={() => setSubscriptionDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Usage</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Sign In / Get Started or Logout */}
            {!isLoggedIn ? (
              <>
                <Link to="/login_signup">
                  <button className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link to="/login_signup">
                  <button className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-emerald-600 hover:to-blue-700 transition-all shadow-lg shadow-emerald-500/25">
                    Get Started
                  </button>
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-4">


              {/* Mobile Subscription Links - Only when logged in */}
              {isLoggedIn && (
                
                  <div className="border-t border-gray-200 pt-4 mt-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                      Subscription
                    </p>
                    <Link
                      to="/subscription"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-2 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                      <span className="font-medium">Subscription Plans</span>
                    </Link>
                    <Link
                      to="/subscription/current"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-2 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Activity className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Current Plan</span>
                    </Link>
                    <Link
                      to="/subscription/usage"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-2 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Usage</span>
                    </Link>
                  </div>
                
              )}

              {!isLoggedIn ? (
                <>
                  <Link to="/login_signup" className="text-emerald-600 hover:text-emerald-700 font-semibold text-left">
                    Sign In
                  </Link>
                  <Link to="/login_signup" className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-center">
                    Get Started
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold text-center"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Nav2;