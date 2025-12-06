import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  FiMenu,
  FiLayout,
  FiUsers,
  FiUser,
  FiLogOut,
  FiShield,
  FiHome,
  FiFileText,
  FiX,
  FiFolder,
  FiPhone,
  FiClipboard,
  FiImage,
  FiMapPin,
} from 'react-icons/fi';
import { useAuth } from '../../../domains/auth/hooks/useAuth';
import { UserRole } from '../../../shared/types';

const drawerWidth = 280;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    text: 'داشبورد',
    icon: <FiLayout className="w-5 h-5" />,
    path: '/dashboard',
    roles: [UserRole.CUSTOMER, UserRole.CONSULTANT, UserRole.SECRETARY, UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.MASTER],
  },
  {
    text: 'پروفایل',
    icon: <FiUser className="w-5 h-5" />,
    path: '/dashboard/profile',
    roles: [UserRole.CUSTOMER, UserRole.CONSULTANT, UserRole.SECRETARY, UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.MASTER],
  },
  {
    text: 'مشاوران',
    icon: <FiShield className="w-5 h-5" />,
    path: '/dashboard/consultants',
    roles: [UserRole.SUPERVISOR],
  },
  {
    text: 'کاربران',
    icon: <FiUsers className="w-5 h-5" />,
    path: '/dashboard/users',
    roles: [UserRole.ADMIN, UserRole.MASTER],
  },
  {
    text: 'املاکی‌ها',
    icon: <FiHome className="w-5 h-5" />,
    path: '/dashboard/estates',
    roles: [UserRole.MASTER],
  },
  {
    text: 'قراردادها',
    icon: <FiFileText className="w-5 h-5" />,
    path: '/dashboard/contracts',
    roles: [UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.MASTER],
  },
  {
    text: 'آگهی‌های املاک',
    icon: <FiImage className="w-5 h-5" />,
    path: '/dashboard/property-ads',
    roles: [UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.MASTER],
  },
  {
    text: 'مدیریت موقعیت‌ها',
    icon: <FiMapPin className="w-5 h-5" />,
    path: '/dashboard/locations',
    roles: [UserRole.MASTER],
  },
  {
    text: 'فایل‌های ملکی',
    icon: <FiFolder className="w-5 h-5" />,
    path: '/dashboard/property-files',
    roles: [UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.SECRETARY, UserRole.CONSULTANT],
  },
  {
    text: 'دفترچه تلفن',
    icon: <FiPhone className="w-5 h-5" />,
    path: '/dashboard/contacts',
    roles: [UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.SECRETARY, UserRole.CONSULTANT],
  },
  {
    text: 'ثبت مراجعات',
    icon: <FiClipboard className="w-5 h-5" />,
    path: '/dashboard/client-logs',
    roles: [UserRole.ADMIN, UserRole.SECRETARY],
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, logout, isImpersonating, exitImpersonation } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setAnchorEl(null);
      }
    };

    if (anchorEl) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [anchorEl]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
    handleMenuClose();
  };

  const handleSidebarLogout = () => {
    logout();
    router.push('/');
  };

  const handleProfile = () => {
    router.push('/dashboard/profile');
    handleMenuClose();
  };

  const handleExitImpersonation = () => {
    exitImpersonation();
    router.push('/dashboard/users');
    handleMenuClose();
  };

  const filteredMenuItems = menuItems.filter(item => user && item.roles.includes(user.role));

  const getRoleLabel = (role: UserRole): string => {
    const labels: Record<UserRole, string> = {
      [UserRole.CUSTOMER]: 'مشتری',
      [UserRole.CONSULTANT]: 'مشاور',
      [UserRole.SECRETARY]: 'منشی',
      [UserRole.SUPERVISOR]: 'ناظر',
      [UserRole.ADMIN]: 'مدیر',
      [UserRole.MASTER]: 'مستر',
    };
    return labels[role] || role;
  };

  const drawer = (
    <div className="flex flex-col h-full text-right">
      <div className="flex items-center justify-between p-4 h-16 cursor-pointer">
        <Link href="/" className="text-xl font-bold text-right hover:underline focus:outline-none focus:ring-2 focus:ring-primary-600 rounded">
          املاک یار
        </Link>
      </div>
      <div className="border-t border-gray-200"></div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="p-2">
          {filteredMenuItems.map((item) => {
            const isActive = router.pathname === item.path || router.asPath === item.path;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={(e) => {
                    // Close mobile drawer on navigation
                    if (mobileOpen) {
                      setMobileOpen(false);
                    }
                    // Ensure link is clickable
                    e.stopPropagation();
                  }}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span>{item.text}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-gray-200"></div>
      <div className="p-2">
        <button
          onClick={handleSidebarLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right text-red-600 hover:bg-red-50 transition-colors"
        >
          <FiLogOut className="w-5 h-5" />
          <span>خروج از حساب</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={handleDrawerToggle}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-[280px] bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {drawer}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-[280px] bg-white shadow-md flex-shrink-0">
        {drawer}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden p-4">
        {/* App Bar */}
        <header className="bg-white shadow-sm z-30 fixed top-0 left-0 right-0 md:right-[280px] h-16 flex items-center justify-between px-4">
          <button
            onClick={handleDrawerToggle}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            aria-label="open drawer"
          >
            <FiMenu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-right flex-1 mr-4">داشبورد</h1>
          {user && (
            <div className="flex items-center gap-3">
              {isImpersonating && (
                <button
                  onClick={handleExitImpersonation}
                  className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm font-medium hover:bg-amber-200 transition-colors"
                  title="خروج از حساب کاربری فعلی و بازگشت به حساب مستر"
                >
                  <FiX className="w-4 h-4" />
                  خروج از حساب کاربری
                </button>
              )}
              <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                {getRoleLabel(user.role)}
              </span>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={handleMenuOpen}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                  aria-label="account menu"
                >
                  {user.firstName?.[0]?.toUpperCase() || 'U'}
                </button>
                {anchorEl && (
                  <div className="absolute left-0 top-12 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={handleProfile}
                      className="w-full flex items-center gap-2 px-4 py-2 text-right text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <FiUser className="w-4 h-4" />
                      <span>پروفایل</span>
                    </button>
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
            </div>
          )}
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto pt-16 p-6 text-right">
          {children}
        </main>
      </div>
    </div>
  );
}
