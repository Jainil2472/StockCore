// layouts/DashboardLayout.jsx
import React, { useState } from 'react';
import Logo from '@/assets/stock_core_main_logo.png';

import Chatbot from '@/components/Chatbot.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Users, Warehouse, TrendingUp,
  Tag, Folder, Ruler, Settings, LogOut, Menu, X,Box,
  Clock, Send, ShoppingCart, FileText, ChevronDown, ChevronRight, Mail,BarChart3,LineChart,Receipt 
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stockMenuOpen, setStockMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get user info
  const userRole = localStorage.getItem('role');
  const companyName = localStorage.getItem('companyName') || 'Stock Core';
  const isOwner = userRole === 'OWNER';
  const isStaff = userRole === 'STAFF';

  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (confirmed) {
      localStorage.clear();
      navigate('/login_signup');
    }
  };

  // Navigation items (Updated with your route paths)
  const navItems = [
    {
      section: 'Main',
      items: [
        { 
          name: 'Dashboard', 
          icon: LayoutDashboard, 
          path: '/dashboard',
          roles: ['OWNER', 'STAFF']
        },
        {
          name: 'Inventory Overview',
          icon: Box,
          path: '/inventory-overview',
          roles: ['OWNER', 'STAFF']
        }
      ]
    },
    // In DashboardLayout.jsx
{
  section: 'Analytics',
  items: [
    { 
      name: 'Reports', 
      icon: BarChart3, 
      path: '/reports',
      roles: ['OWNER'] // Only OWNER
    },
  
  
    { 
      name: 'Forecasting', 
      icon: LineChart , 
      path: '/forecasting',
      roles: ['OWNER'] // Only OWNER
    }
  ]
},
    {
      section: 'Inventory',
      items: [
        { 
          name: 'Products', 
          icon: Package, 
          path: '/product',
          roles: ['OWNER', 'STAFF']
        },
        { 
          name: 'Categories', 
          icon: Folder, 
          path: '/category',
          roles: ['OWNER']
        },
        { 
          name: 'Attributes', 
          icon: Folder, 
          path: '/attributes',
          roles: ['OWNER']
        },
        { 
          name: 'Brands', 
          icon: Tag, 
          path: '/brand',
          roles: ['OWNER']
        },
        { 
          name: 'Units', 
          icon: Ruler, 
          path: '/unit',
          roles: ['OWNER']
        },
        { 
          name: 'Warehouses', 
          icon: Warehouse , 
          path: '/warehouse',
          roles: ['OWNER']
        }

      ]
    },
    
    {
      section: 'Stock Management',
      items: [
        { 
          name: 'Stock Transfers', 
          icon: TrendingUp, 
          path: '#',
          roles: ['OWNER', 'STAFF'],
          hasSubmenu: true
        }
      ]
    },
    // In DashboardLayout.jsx
{
  section: 'Transactions',
  items: [
    { 
      name: 'Transactions History', 
      icon: Package, 
      path: '/transactions',
      roles: ['OWNER']
    }
  ]
},
    {
      section: 'Team',
      items: [
        { 
          name: 'Staff Management', 
          icon: Users, 
          path: '/staff_management',
          roles: ['OWNER']
        }
      ]
    },
    {
      section: 'Parties',
      items: [
        { 
          name: 'Sellers', 
          icon: Users, 
          path: '/sellers',
          roles: ['OWNER', 'STAFF']
        },
        { 
          name: 'Buyers', 
          icon: Users, 
          path: '/buyers',
          roles: ['OWNER', 'STAFF']
        }
      ]
    },
    // In DashboardLayout.jsx
    {
      section: 'Orders',
      items: [
        { 
          name: 'Purchase Orders', 
          icon: Mail, 
          path: '/purchase-orders',
          roles: ['OWNER'] // Only OWNER
        }
      ]
    },




    {
      section: 'Subscription',
      items: [
        { 
          name: 'Subscription', 
          icon: Receipt, 
          path: '//subscription',
          roles: ['OWNER']
        }
      ]
    },
  ];

  // Stock submenu items (Updated with your route paths)
  const stockSubmenuItems = [
    { 
      name: 'Stock Request', 
      icon: Send, 
      path: '/staff_stocktransfer',
      roles: ['STAFF']
    },
    { 
      name: 'Pending Approvals', 
      icon: Clock, 
      path: '/owner_stocktransfer',
      roles: ['OWNER']
    }
  ];

  const isActive = (path) => {
    if (path === '#') return false;
    return location.pathname === path;
  };

  const hasAccess = (roles) => {
    return roles.includes(userRole);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? 'w-64' : 'w-20'
      } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        
        {/* Logo & Toggle */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10  rounded-lg flex items-center justify-center">
                <img src={Logo} alt="Stock Core" />
              </div>
              <span className="font-bold text-gray-900">{companyName}</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-gray-600" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map((section) => (
            <div key={section.section} className="mb-6">
              {sidebarOpen && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.section}
                </h3>
              )}
              
              <div className="space-y-1">
                {section.items.map((item) => {
                  if (!hasAccess(item.roles)) return null;

                  const Icon = item.icon;
                  const active = isActive(item.path);

                  if (item.hasSubmenu) {
                    return (
                      <div key={item.name}>
                        <button
                          onClick={() => setStockMenuOpen(!stockMenuOpen)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                            active
                              ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          title={!sidebarOpen ? item.name : ''}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {sidebarOpen && (
                              <span className="font-medium">{item.name}</span>
                            )}
                          </div>
                          {sidebarOpen && (
                            stockMenuOpen ? 
                              <ChevronDown className="w-4 h-4" /> : 
                              <ChevronRight className="w-4 h-4" />
                          )}
                        </button>

                        {/* Submenu */}
                        {sidebarOpen && stockMenuOpen && (
                          <div className="ml-4 mt-1 space-y-1">
                            {stockSubmenuItems.map((subItem) => {
                              if (!hasAccess(subItem.roles)) return null;
                              
                              const SubIcon = subItem.icon;
                              const subActive = isActive(subItem.path);

                              return (
                                <button
                                  key={subItem.name}
                                  onClick={() => navigate(subItem.path)}
                                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                    subActive
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : 'text-gray-600 hover:bg-gray-50'
                                  }`}
                                >
                                  <SubIcon className="w-4 h-4" />
                                  <span className="text-sm">{subItem.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <button
                      key={item.name}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        active
                          ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      title={!sidebarOpen ? item.name : ''}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {sidebarOpen && (
                        <span className="font-medium">{item.name}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200 p-4">
          {sidebarOpen ? (
            <div className="mb-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {localStorage.getItem('email') || 'User'}
                  </p>
                  <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                    isOwner 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {isOwner ? 'Owner' : 'Staff'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <Chatbot />
    </div>
  );
}