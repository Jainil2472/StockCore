import '@/index.css'
import React, { useState } from 'react';
import { ArrowRight, TrendingUp, Shield, Loader2 } from 'lucide-react';
import Logo from '@/assets/black_n_white.png'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext'; // ✅ import

function App() {
  const { login } = useAuth(); // ✅ get login function from context
  const navigate = useNavigate();

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    phone: '',
    state: '',
    city: ''
  });

  React.useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      setLoadingStates(true);
      const response = await axios.post(
        "https://countriesnow.space/api/v0.1/countries/states",
        { country: "India" }
      );
      setStates(response.data.data.states.map(s => s.name));
    } catch (error) {
      console.error("Error fetching states:", error);
      alert("Unable to load states.");
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchCities = async (stateName) => {
    try {
      setLoadingCities(true);
      const response = await axios.post(
        "https://countriesnow.space/api/v0.1/countries/state/cities",
        { country: "India", state: stateName }
      );
      setCities(response.data.data);
    } catch (error) {
      console.error("Error fetching cities:", error);
      alert("Unable to load cities.");
    } finally {
      setLoadingCities(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!isLogin) {
        // SIGNUP
        if (formData.password !== formData.confirmPassword) {
          alert("Passwords do not match");
          setIsSubmitting(false);
          return;
        }

        await axios.post("http://localhost:8080/api/auth/signup", {
          companyName: formData.companyName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          state: formData.state,
          city: formData.city
        });

        alert("Account created successfully. Please login.");
        setIsLogin(true);
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          companyName: '',
          phone: '',
          state: '',
          city: ''
        });

      } else {
        // LOGIN
        const response = await axios.post("http://localhost:8080/api/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        login(response.data); // ✅ replaces all 3 localStorage.setItem + dispatchEvent
        navigate("/home");
      }

    } catch (error) {
      console.error(error);
      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Server not reachable. Try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    if (name === "state") {
      setFormData({ ...formData, state: value, city: "" });
      fetchCities(value);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4 relative overflow-hidden">

      {/* FULL SCREEN LOADING OVERLAY */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            <div className="text-center">
              <p className="text-gray-900 font-semibold text-lg">
                {isLogin ? 'Signing you in...' : 'Creating your account...'}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {isLogin
                  ? 'Sending login alert to your email'
                  : 'Sending confirmation email, please wait'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main container */}
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-0 bg-white rounded-3xl overflow-hidden shadow-2xl relative z-10">

        {/* Left side - Branding */}
        <div className="bg-gradient-to-br from-emerald-500 to-blue-600 p-12 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-40"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <img src={Logo} alt="Stock Core" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Stock Core</h1>
                <p className="text-white/90 text-sm">Inventory Management</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Control Stock. <br />Boost Growth.
            </h2>
            <p className="text-white/90 text-lg leading-relaxed">
              Real-time tracking, smart analytics, and seamless workflow automation for modern businesses.
            </p>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Real-time Analytics</h3>
                <p className="text-white/80 text-sm">Track stock levels, sales trends, and inventory turnover instantly</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Secure & Reliable</h3>
                <p className="text-white/80 text-sm">Enterprise-grade security with automated backups and compliance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="bg-white p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h3>
            <p className="text-gray-600">
              {isLogin ? 'Sign in to access your dashboard' : 'Create your account to begin'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Your Company Ltd."
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="you@company.com"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="+91 98765 43210"
                  pattern="[0-9+ -]+"
                  required={!isLogin}
                />
              </div>
            )}

            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    required={!isLogin}
                  >
                    <option value="">Select State</option>
                    {loadingStates ? (
                      <option disabled>Loading states...</option>
                    ) : (
                      states.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    required={!isLogin}
                    disabled={!formData.state}
                  >
                    <option value="">Select City</option>
                    {loadingCities ? (
                      <option disabled>Loading cities...</option>
                    ) : (
                      cities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required={!isLogin}
                />
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-gray-600 cursor-pointer">
                  <input type="checkbox" className="mr-2 rounded bg-gray-50 border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                  Remember me
                </label>
                <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-emerald-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => !isSubmitting && setIsLogin(!isLogin)}
                disabled={isSubmitting}
                className="ml-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          {!isLogin && (
            <p className="mt-6 text-xs text-gray-500 text-center">
              By signing up, you agree to our{' '}
              <a href="#" className="text-emerald-600 hover:text-emerald-700">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-emerald-600 hover:text-emerald-700">Privacy Policy</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;