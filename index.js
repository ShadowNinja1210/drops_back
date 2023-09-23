const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const Drop = require("./models/Drop");
const schedule = require("node-schedule");
const dotenv = require("dotenv");

const app = express();
const PORT = process.env.PORT || 3500;

app.use(cors());
app.use(bodyParser.json());
dotenv.config();

// ------------------------------------------------------- //
// Connect to MongoDB
mongoose.connect(process.env.MONGO_DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// To check if the connection is established
mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});

// ------------------------------------------------------- //
// Define a function to format the date
function formatDate(date) {
  const options = { day: "numeric", month: "long", year: "numeric" };
  return new Date(date).toLocaleDateString(undefined, options);
}
const currentDate = new Date();
const formattedDate = formatDate(currentDate);
console.log(formattedDate);

// ------------------------------------------------------- //
// Route to get drop information
app.get("/get-drop-info", async (req, res) => {
  try {
    console.log(formattedDate);
    // Retrieve all drop records for a specific date
    const dropInfo = await Drop.find({ date: formattedDate });

    // Send the drop information as a JSON response
    res.json(dropInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ------------------------------------------------------- //
// Route to update drop information
app.post("/update-drop", async (req, res) => {
  try {
    const { name, count } = req.body;
    console.log("Received update request:", name, count);

    // Find the drop record with the specified name and date
    const drop = await Drop.findOne({ name, date: formattedDate });
    console.log("Found drop:", drop);
    if (!drop) {
      // If the drop record doesn't exist, you may choose to handle this case accordingly
      return res.status(404).json({ error: "Drop not found" });
    }

    // Update the count
    drop.count = count;
    // Save the updated drop record
    await drop.save();

    // Send a success response
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ------------------------------------------------------- //
// Route to create a drop for the current date
/*app.get("/create-drop", async (req, res) => {
    try {
        const existingDrop = await Drop.findOne({ date: formattedDate });

        if (!existingDrop) {
            // Create a new drop for the current date with a count of 0
        await Drop.create(
            {
                name: "Pred Forte", // Set the drop name accordingly
                count: 0,
                date: formattedDate,
            },
            {
                name: "Molflox", // Set the drop name accordingly
                count: 0,
                date: formattedDate,
            },
            {
                name: "Homide", // Set the drop name accordingly
                count: 0,
                date: formattedDate,
            }
            ).then(() => console.log("Created"));
        } else {
            console.log("Already exists");
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});*/

// ------------------------------------------------------- //
// Schedule a daily reset at 00:00 IST
schedule.scheduleJob("0 0 * * *", async () => {
  try {
    // Check if a drop with the same date exists
    const existingDrop = await Drop.findOne({ date: formattedDate });

    if (!existingDrop) {
      // Create a new drop for the current date with a count of 0
      await Drop.create(
        {
          name: "Pred Forte", // Set the drop name accordingly
          count: 0,
          date: formattedDate,
        },
        {
          name: "Milflox", // Set the drop name accordingly
          count: 0,
          date: formattedDate,
        },
        {
          name: "Homide", // Set the drop name accordingly
          count: 0,
          date: formattedDate,
        }
      ).then(() => console.log(`Created drop for ${formattedDate}`));
    } else console.log("Already exists");
  } catch (error) {
    console.error(error);
  }
});

// ------------------------------------------------------- //
/*// Schedule weekly advancement
schedule.scheduleJob("0 0 * * 0", async () => {
  try {
    // Advance the week for your logic
  } catch (error) {
    console.error(error);
  }
});*/

// ------------------------------------------------------- //
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`https://localhost:${PORT}`);
});
