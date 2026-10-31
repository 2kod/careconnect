import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAccessibility } from '../../context/AccessibilityContext';

const routeTitles = {
  '/': 'Welcome to CareConnect | Accessible Healthcare',
  '/doctors': 'Find a Doctor | CareConnect',
  '/dashboard': 'Patient Appointments Dashboard | CareConnect',
  '/login': 'Sign In | CareConnect',
  '/register': 'Create an Account | CareConnect',
  '/accessibility-settings': 'Accessibility Settings & Support | CareConnect',
};

export const RouteAnnouncer = () => {
  const location = useLocation();
  const { announce } = useAccessibility();

  useEffect(() => {
    const path = location.pathname;
    let title = routeTitles[path];

    if (!title) {
      if (path.startsWith('/book/')) {
        title = 'Book Appointment Step-by-Step | CareConnect';
      } else if (path.startsWith('/doctors/')) {
        title = 'Doctor Profile Details | CareConnect';
      } else {
        title = 'CareConnect Healthcare';
      }
    }

    document.title = title;
    announce(`Navigated to ${title.split('|')[0].trim()}`);

    // Shift focus to main heading or top main content for keyboard users
    const mainHeading = document.querySelector('h1, main');
    if (mainHeading) {
      mainHeading.setAttribute('tabIndex', '-1');
      mainHeading.focus({ preventScroll: true });
    }
  }, [location.pathname, announce]);

  return null;
};

export default RouteAnnouncer;

