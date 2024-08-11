const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const path = require('path');
const app = express();
const port = 3000;

app.use(bodyParser.json()); // Parse application/json requests
// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  session({
    secret: "jkhaskfhaklhfjkhjkfwqwr2324jhskhdkf",
    resave: false,
    saveUninitialized: true,
  })
);
// Route to serve find.html
app.get('/find', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'find.html'));
});

// Route to handle form submission
// Serve the index.html page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});
app.post('/submit-form', (req, res) => {
    const {petType, breed, age,gender,otherDogs,otherCats,smallChildren} = req.body;
    console.log('Received form data:', {petType, breed, age,gender,otherDogs,otherCats,smallChildren}); // Logging form data to verify

    fs.readFile('pets.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading pets data:', err);
            res.status(500).json({ error: 'Error reading pets data.' });
            return;
        }

        try {
            const pets = JSON.parse(data);
            const filteredPets = pets.filter(pet => {
                return (petType === pet.petType) &&
                    (breed === "Doesn't matter" || breed === pet.breed) &&
                    (age === "Doesn't matter" || parseInt(age) === pet.age) &&
                    (gender === "Doesn't matter" || gender === pet.gender) &&
                    (otherDogs ? pet.otherDogs : true) &&
                    (otherCats ? pet.otherCats : true) &&
                    (smallChildren ? pet.smallChildren : true);
            });

            console.log('Filtered pets:', filteredPets); // Logging filtered pets to verify
            res.json(filteredPets);
        } catch (error) {
            console.error('Error parsing pets data:', error);
            res.status(500).json({ error: 'Error parsing pets data.' });
        }
    });
});

// Route to handle form submission
app.post('/giveaway', (req, res) => {
  const { petType, breed, age, gender, getsAlong, comment, ownerName, ownerEmail } = req.body;

  // Load existing pets from file
  fs.readFile('pets.txt', 'utf8', (err, data) => {
      if (err && err.code !== 'ENOENT') {
          console.error('Error reading pets.txt:', err);
          return res.status(500).json({ error: 'Error reading pets data.' });
      }

      let pets = [];
      if (!err && data) {
          try {
              pets = JSON.parse(data);
          } catch (parseError) {
              console.error('Error parsing pets.txt:', parseError);
              return res.status(500).json({ error: 'Error parsing pets data.' });
          }
      }

      // Generate a unique ID for the new pet
      const petId = pets.length > 0 ? pets[pets.length - 1].id + 1 : 1;

      // Create new pet object
      const newPet = {
          id: petId,
          petType,
          breed,
          age: parseInt(age),
          gender,
          getsAlong: Array.isArray(getsAlong) ? getsAlong : [getsAlong],
          comment,
          ownerName,
          ownerEmail
      };

      // Add the new pet to the array
      pets.push(newPet);

      // Save the updated pets array back to the file
      fs.writeFile('pets.txt', JSON.stringify(pets, null, 2), 'utf8', (writeErr) => {
          if (writeErr) {
              console.error('Error writing to pets.txt:', writeErr);
              return res.status(500).json({ error: 'Error saving pets data.' });
          }

          console.log('New pet added:', newPet);
          res.json({ message: 'Pet added successfully!', pet: newPet });
      });
  });
});


// Load users from file
function loadUsersFromFile() {
    fs.readFile("users.txt", "utf8", (err, data) => {
      if (err) {
        console.error("Error reading users.txt:", err);
      } else {
        try {
          users = JSON.parse(data) || [];
        } catch (parseError) {
          console.error("Error parsing users.txt:", parseError);
          users = [];
        }
      }
    });
  }
  
  // Function to save users to file
  function saveUsersToFile() {
    fs.writeFile("users.txt", JSON.stringify(users), "utf8", (err) => {
      if (err) {
        console.error("Error writing to users.txt:", err);
      } else {
        console.log("Users saved to users.txt");
      }
    });
  }
  
  // Call loadUsersFromFile initially to load users into memory
  loadUsersFromFile();
  
// Signup endpoint
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  // Check if email already exists
  if (users.some((user) => user.email === email)) {
    return res.send("Email already taken");
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store email and hashed password in "database" and save to file
    users.push({ email, password: hashedPassword });
    saveUsersToFile();

    res.redirect("/login.html");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Find the user by email
  const user = users.find((user) => user.email === email);
  if (!user) {
    return res.send("Invalid email or password");
  }

  try {
    // Compare the password with the hashed password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.send("Invalid email or password");
    }

    // Create a session for the user after login
    req.session.loggedIn = true;
    req.session.email = email;

    res.redirect("/index.html");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Backend endpoint to check login status
app.get("/check-login", (req, res) => {
  if (req.session.loggedIn) {
    // User is logged in, return authenticated status and user email
    res.json({ loggedIn: true, email: req.session.email });
  } else {
    // User is not logged in
    res.json({ loggedIn: false });
  }
});

// Logout endpoint
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Could not log out.");
    } else {
      res.redirect("/login.html");
    }
  });
});

// Protect all routes except index.html and login/signup pages
app.use((req, res, next) => {
    if (
      req.path === "/index.html" ||
      req.path === "/signup.html" ||
      req.path === "/login.html" ||
      req.path.startsWith("/public/")
    ) {
      next();
    } else {
      protectRoute(req, res, next);
    }
  });
  
  // Middleware to protect specific routes
  function protectRoute(req, res, next) {
    if (req.session.loggedIn) {
      next(); // User is logged in, proceed to the next middleware
    } else {
      res.redirect('/login.html'); // Redirect to login page if not logged in
    }
  }
  
  // Apply protectRoute middleware to all routes that need protection
  app.use(['/pets.html', '/find.html', '/dog-care.html', '/cat-care.html', '/giveaway.html', '/contact.html'], protectRoute);
  
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
