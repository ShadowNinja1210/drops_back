const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const Drop = require("./models/Drop");
const Showtime = require("./models/Showtime");
const cron = require("node-cron");
const dotenv = require("dotenv");

const app = express();
const PORT = process.env.PORT || 3500;

app.use(cors());
app.use(bodyParser.json());
dotenv.config();

// ------------------------------------------------------- //
// Connect to MongoDB
mongoose.connect("mongodb+srv://user:user@cluster0.m0zeifh.mongodb.net/test?retryWrites=true&w=majority", {
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
  return new Date(date).toLocaleDateString("en-US", options);
}
const currentDate = new Date();
const serverDate = formatDate(currentDate);

// ------------------------------------------------------- //
// Testing home page
app.get("/", (req, res) => {
  res.send("Hello World");
});

// ------------------------------------------------------- //
// Route to get drop information
app.get("/get-drop-info", async (req, res) => {
  try {
    const formattedDate = req.query.formattedDate;
    console.log("GET Request");
    // Retrieve all drop records for a specific date
    const dropInfo = await Drop.find({ date: formattedDate });
    console.log("1st");
    console.log(formattedDate);

    // Send the drop information as a JSON response
    res.json(dropInfo);
    console.log("2nd");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ------------------------------------------------------- //
// Route to get drop information
app.get("/get-showtime", async (req, res) => {
  try {
    console.log("GET showtime Request");
    // Retrieve all drop records for a specific date
    const showtime = await Showtime.findOne();
    console.log("Showtime Found");

    // Send the drop information as a JSON response
    res.json(showtime);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ------------------------------------------------------- //
// Route to create or update the showtime
app.post("/update-showtime", async (req, res) => {
  try {
    const showTime = req.body.showTime;
    console.log("POST showtime Request", showTime);

    // Check if a Showtime document already exists
    const existingShowtime = await Showtime.findOne();

    if (existingShowtime) {
      // If it exists, update the time
      existingShowtime.time = showTime;
      await existingShowtime.save();
    } else {
      // If it doesn't exist, create a new Showtime document
      const newShowtime = new Showtime({ time: showTime });
      await newShowtime.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ------------------------------------------------------- //
// Route to update drop information
app.post("/update-drop", async (req, res) => {
  try {
    console.log("POST Request");
    const { name, count, formattedDate } = req.body;
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
app.get("/create-drop", async (req, res) => {
  try {
    const formattedDate = req.query.formattedDate;
    const existingDrop = await Drop.findOne({ date: formattedDate });

    if (!existingDrop) {
      dropData = [
        {
          name: "Nepastar",
          count: 0,
          date: serverDate,
        },
        {
          name: "Iotim",
          count: 0,
          date: serverDate,
        },
      ];
      // Create a new drop for the current date with a count of 0
      await Drop.insertMany(dropData).then(() => {
        console.log("Created");
        res.send("Created");
        res.json({ success: true });
      });
    } else {
      console.log("Already exists");
      res.send("Already exists");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ------------------------------------------------------- //
// Schedule a daily reset at 00:00 IST
cron.schedule("2,3,4 6 * * *", async () => {
  try {
    // Check if a drop with the same date exists
    const existingDrop = await Drop.findOne({ date: serverDate });

    if (!existingDrop) {
      // Create a new drop for the current date with a count of 0
      await Drop.create(
        {
          name: "Nepastar",
          count: 0,
          date: serverDate,
        },
        {
          name: "Iotim",
          count: 0,
          date: serverDate,
        }
      ).then(() => console.log(`Created drop for ${serverDate}`));
    } else console.log("Already exists");
  } catch (error) {
    console.error(error);
  }
});

// ------------------------------------------------------- //
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`https://localhost:${PORT}`);
});
