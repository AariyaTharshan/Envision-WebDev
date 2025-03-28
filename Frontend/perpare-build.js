function copyBackendFiles() {
    // Create python directory if it doesn't exist
    if (!fs.existsSync('./python')) {
      fs.mkdirSync('./python');
    }
  
    // Copy backend files
    fs.cpSync('./backend', './python', { recursive: true });
    
    // Copy requirements.txt if it exists
    if (fs.existsSync('./backend/requirements.txt')) {
      fs.copyFileSync('./backend/requirements.txt', './python/requirements.txt');
    }
  }
  
  copyBackendFiles();