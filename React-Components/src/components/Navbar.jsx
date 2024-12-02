import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';

const menuItems = [
  {
    title: 'File',
    items: ['New', 'Open', 'Save', 'Export'],
  },
  {
    title: 'Settings',
    items: ['Camera Configuration'],
  },
  {
    title: 'Image',
    items: ['Import', 'Edit', 'Filters', 'Adjust'],
  },
  {
    title: 'Image Process',
    items: ['Batch Processing', 'AI Enhancement', 'Noise Reduction'],
  },
  {
    title: 'Measurements',
    items: ['Calibrate', 'Distance', 'Area', 'Volume'],
  },
  {
    title: 'Help',
    items: ['Documentation', 'Tutorials', 'Support', 'About'],
  },
];

function Navbar() {
  const [activeMenu, setActiveMenu] = useState(null);

  const handleMouseEnter = (menuTitle) => {
    setActiveMenu(menuTitle);
  };

  const handleMouseLeave = () => {
    setActiveMenu(null);
  };

  return (
    <header className="navbar-header">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex justify-between w-10/12 items-center">
            {/* Logo */}
            <h1 className="text-2xl font-bold text-primary mr-8">Envision</h1>

            {/* Navigation Menu */}
            <nav className="relative">
              <ul className="flex space-x-4">
                {menuItems.map((menu) => (
                  <li
                    key={menu.title}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(menu.title)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button className="navbar-button">
                      <span>{menu.title}</span>
                      <motion.span
                        animate={{ rotate: activeMenu === menu.title ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.span>
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {activeMenu === menu.title && (
                        <motion.ul
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="navbar-dropdown"
                          onMouseEnter={() => handleMouseEnter(menu.title)}
                          onMouseLeave={handleMouseLeave}
                        >
                          {menu.items.map((item) => (
                            <motion.li
                              key={item}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <a href="#" className="navbar-dropdown-item">
                                {item}
                              </a>
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

