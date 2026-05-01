/**
 * @file The main footer for the application.
 */

/**
 * Footer component for the application layout.
 * @returns {React.ReactElement} - The Footer component.
 */
const Footer = () => {
  return (
    <footer role="contentinfo" className="bg-gray-800 text-white p-4 text-center">
      <p>&copy; {new Date().getFullYear()} ElectIQ. All rights reserved.</p>
      <p className="text-xs mt-1">Built for the Google AI PW2 Program</p>
    </footer>
  );
};

export default Footer;
