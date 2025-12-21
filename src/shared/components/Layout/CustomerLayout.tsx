import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiMenu, FiUser, FiLogOut, FiX, FiSearch, FiHome, FiLayout } from 'react-icons/fi';
import { useAuth } from '../../../domains/auth/hooks/useAuth';
import { UserRole } from '../../../shared/types';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const handleLogout = () => {
    logout();
    router.push('/');
    setUserMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header - Divar style */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/property-ads" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
                <FiHome className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">املاک یار</span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="جستجو در آگهی‌ها..."
                  className="w-full rounded-2xl border border-gray-300 bg-gray-50 pr-12 pl-4 py-2 text-sm text-right placeholder-gray-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                  onFocus={(e) => {
                    e.target.blur();
                    router.push('/property-ads');
                    // Focus search on property ads page
                    setTimeout(() => {
                      const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
                      searchInput?.focus();
                    }, 100);
                  }}
                />
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Right Side - User Menu */}
            <div className="flex items-center gap-4">
              {/* Dashboard Button - for non-CUSTOMER users */}
              {user && user.role !== UserRole.CUSTOMER && (
                <Link
                  href="/dashboard"
                  className="hidden md:flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <FiLayout className="w-4 h-4" />
                  <span>داشبورد</span>
                </Link>
              )}

              {/* Mobile Search Button */}
              <button
                onClick={() => {
                  router.push('/property-ads');
                  setTimeout(() => {
                    const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
                    searchInput?.focus();
                  }, 100);
                }}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                aria-label="جستجو"
              >
                <FiSearch className="w-5 h-5" />
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                aria-label="منو"
              >
                {mobileMenuOpen ? (
                  <FiX className="w-6 h-6" />
                ) : (
                  <FiMenu className="w-6 h-6" />
                )}
              </button>

              {/* User Menu - Desktop */}
              {user && (
                <div className="hidden md:block relative" ref={menuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center justify-center px-4 h-10 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                    aria-label="منوی کاربر"
                  >
                    {(user.firstName && user.lastName) ? `${user.firstName} ${user.lastName}` : (user.firstName || 'کاربر')}
                  </button>
                  {userMenuOpen && (
                    <div className="absolute left-0 top-12 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user.phoneNumber}</p>
                      </div>
                      {user.role !== UserRole.CUSTOMER && (
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-right text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <FiLayout className="w-4 h-4" />
                          <span>داشبورد</span>
                        </Link>
                      )}
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-right text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <FiUser className="w-4 h-4" />
                        <span>پروفایل</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-right text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>خروج</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-2">
              {user && (
                <>
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user.phoneNumber}</p>
                  </div>
                  {user.role !== UserRole.CUSTOMER && (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                      <FiLayout className="w-5 h-5" />
                      <span>داشبورد</span>
                    </Link>
                  )}
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    <FiUser className="w-5 h-5" />
                    <span>پروفایل</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span>خروج</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
