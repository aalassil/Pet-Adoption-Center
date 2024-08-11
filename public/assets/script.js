// Function to check if user is logged in
function checkLoginStatus() {
  fetch("/check-login") // Assuming you have an endpoint to check login status
    .then((response) => response.json())
    .then((data) => {
      if (data.loggedIn) {

        // User is logged in, show authenticated content
        console.log("User is logged in:", data.email);
        // Example: Update UI to show logged-in state
        showLoggedInUI();
      } else {
        if (page == 'protected') {
          window.location.href = 'login.html';
        }
        // User is not logged in, show login form or non-authenticated content
        console.log("User is not logged in");
        // Example: Update UI to show login form or non-authenticated state
        showLoggedOutUI();
      }
    })
    .catch((error) => {
      console.error("Error checking login status:", error);
      // Handle error scenario
    });
}


// Example function to update UI for logged-in state
function showLoggedInUI() {
  document.querySelector(
    ".sidebar>ul"
  ).innerHTML = `<li><a href="index.html">Home</a></li>
            <li><a href="find.html">Find a Dog/Cat</a></li>
            <li><a href="dog-care.html">Dog Care</a></li>
            <li><a href="cat-care.html">Cat Care</a></li>
            <li><a href="giveaway.html">Have a Pet to Give Away</a></li>
            <li><a href="contact.html">Contact Us</a></li>
            <li><a href="/logout">Logout</a></li>`;
}

// Example function to update UI for logged-out state
function showLoggedOutUI() {
  document.querySelector(".sidebar>ul").innerHTML = `
            <li><a href="login.html">Login</a></li>
            <li><a href="signup.html">Register</a></li>`;
}

// Check login status when the page loads
document.addEventListener("DOMContentLoaded", () => {
  checkLoginStatus();
});


function updateTime() {
  const now = new Date();
  document.getElementById('date-time').textContent = now.toLocaleString();
}
setInterval(updateTime, 1000);
updateTime();