/**
 * Session Management Module
 * Handles admin authentication and session storage
 */

// Session Configuration
const SESSION_CONFIG = {
  LOGGED_IN_KEY: "adminLoggedIn",
  EMAIL_KEY: "adminEmail",
  LOGIN_REDIRECT_URL: "index.html",
  ADMIN_URL: "admin/admin.html",
};

/**
 * Check if admin is currently logged in
 * @returns {boolean} True if logged in, false otherwise
 */
function isAdminLoggedIn() {
  const isLoggedIn = sessionStorage.getItem(SESSION_CONFIG.LOGGED_IN_KEY);
  return isLoggedIn === "true";
}

/**
 * Get the stored admin email
 * @returns {string|null} Admin email or null if not logged in
 */
function getAdminEmail() {
  return sessionStorage.getItem(SESSION_CONFIG.EMAIL_KEY);
}

/**
 * Perform admin login
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise<{success: boolean, message: string}>} Login result
 */
async function adminLogin(email, password) {
  // Default admin credentials
  const adminEmail = "admin@agbbc.org";
  const adminPassword = "admin123";

  if (email === "" || password === "") {
    return {
      success: false,
      message: "Please enter both email and password.",
    };
  }

  if (email === adminEmail && password === adminPassword) {
    // Store session
    sessionStorage.setItem(SESSION_CONFIG.LOGGED_IN_KEY, "true");
    sessionStorage.setItem(SESSION_CONFIG.EMAIL_KEY, email);
    return {
      success: true,
      message: "Login successful!",
    };
  }

  return {
    success: false,
    message: "Invalid email or password. Please try again.",
  };
}

/**
 * Perform admin logout
 */
function adminLogout() {
  sessionStorage.removeItem(SESSION_CONFIG.LOGGED_IN_KEY);
  sessionStorage.removeItem(SESSION_CONFIG.EMAIL_KEY);
}

/**
 * Check admin session and redirect if not logged in
 * Used in admin pages to protect access
 */
function checkAdminSession() {
  if (!isAdminLoggedIn()) {
    // Redirect to login page with query parameter
    window.location.href = `${SESSION_CONFIG.LOGIN_REDIRECT_URL}?needLogin=1`;
    return false;
  }
  return true;
}

/**
 * Initialize session check on admin pages
 * Call this on page load in admin pages
 */
function initAdminSessionCheck() {
  (function () {
    if (!checkAdminSession()) {
      return;
    }
  })();
}

/**
 * Handle login required redirect
 * Call this on index.html page load to check for needLogin parameter
 */
function handleLoginRequiredRedirect() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("needLogin") === "1") {
    // Remove the query parameter from URL
    window.history.replaceState({}, document.title, window.location.pathname);

    // Show login required message
    setTimeout(() => {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to access the admin dashboard.",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      }).then(() => {
        // Open login modal after clicking OK
        const loginModal = document.getElementById("loginModal");
        if (loginModal) {
          loginModal.classList.add("active");
          document.body.style.overflow = "hidden";
        }
      });
    }, 100);
  }
}

/**
 * Setup login form event listeners
 * Call this after DOM is loaded in pages with login modal
 */
function setupLoginForm() {
  const submitEmailBtn = document.getElementById("submitEmailBtn");

  if (!submitEmailBtn) return;

  // Add Enter key support for email and password inputs
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");

  if (emailInput) {
    emailInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        submitEmailBtn.click();
      }
    });
  }

  if (passwordInput) {
    passwordInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        submitEmailBtn.click();
      }
    });
  }

  submitEmailBtn.addEventListener("click", async function () {
    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");

    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";

    // Remove focus before showing SweetAlert
    submitEmailBtn.blur();

    const result = await adminLogin(email, password);

    if (result.success) {
      Swal.fire({
        icon: "success",
        title: "Login Successful!",
        text: "Welcome back, Admin!",
        timer: 1500,
        showConfirmButton: false,
        confirmButtonColor: "#3085d6",
      }).then(() => {
        // Close modal and redirect
        const loginModal = document.getElementById("loginModal");
        if (loginModal) {
          loginModal.classList.remove("active");
          document.body.style.overflow = "";
        }
        // Redirect to admin page
        window.location.href = SESSION_CONFIG.ADMIN_URL;
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: result.message,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });
    }
  });
}

/**
 * Setup logout functionality
 * Call this in admin pages to enable logout
 */
function setupLogout() {
  // Try to find logout button in sidebar or header
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutOption = document.getElementById("logoutOption");

  const logoutElement = logoutBtn || logoutOption;

  if (!logoutElement) return;

  logoutElement.addEventListener("click", function (e) {
    e.preventDefault();

    Swal.fire({
      icon: "question",
      title: "Logout",
      text: "Are you sure you want to logout?",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        adminLogout();
        Swal.fire({
          icon: "success",
          title: "Logged Out",
          text: "You have been logged out successfully.",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          window.location.href = SESSION_CONFIG.LOGIN_REDIRECT_URL;
        });
      }
    });
  });
}

// Export functions for use in HTML files
window.SessionManager = {
  isAdminLoggedIn,
  getAdminEmail,
  adminLogin,
  adminLogout,
  checkAdminSession,
  initAdminSessionCheck,
  handleLoginRequiredRedirect,
  setupLoginForm,
  setupLogout,
};
