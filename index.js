const express = require("express");
const router = require("./Routers/Route");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const mysql = require("mysql2/promise");
const axios = require("axios");
const mammoth = require("mammoth");
const CryptoJS = require("crypto-js");
const multer = require("multer");
const NodeCache = require("node-cache");
const iconv = require("iconv-lite");
const session = require("express-session");
const { google } = require("googleapis");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8000;
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      
      "https://ajls.online",
      "https://api.ajls.online",
      "http://localhost:5173",
      "https://natheer777.github.io"
     
    ];
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, 
}))



app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));



app.use(session({
  secret: 'sawa',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: 60000
  }
}));

app.use(router);

const db = mysql.createPool({
  host: "srv621.hstgr.io",
  user: "u229294786_UKHrI",
  password: "Sawa2020!",
  database: "u229294786_JZfqq",
});

function checkAuth(req, res, next) {
  if (req.session.loggedIn) {
    return next();
  } else {
    res.redirect("/login");
  }
}

let storedUsername = "sawa";
let storedPassword = "sawa";

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === storedUsername && password === storedPassword) {
    req.session.loggedIn = true;
    return res.json({ success: true });
  } else {
    return res.json({ success: false });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

app.get("/files", checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "system_files.html"));
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    const fileId = iconv.decode(Buffer.from(file.originalname, "binary"), "utf-8");
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    const text = result.value;

    const sentences = text
      .split(/(?<!\S)(?:[。،؟!]|[\.\?!])\s+|(?<=\n)/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence);

    const connection = await db.getConnection();
    for (const sentence of sentences) {
      await connection.query(
        "INSERT INTO sentences (sentence, file_id) VALUES (?, ?)",
        [sentence, fileId]
      );
    }
    connection.release();

    res.send(`File uploaded and processed successfully. File ID: ${fileId}`);
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).send("Error processing file.");
  }
});

app.get("/api/files", async (req, res) => {
  try {
    const [files] = await db.query("SELECT DISTINCT file_id FROM sentences");
    res.json(files);
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).send("Error fetching files.");
  }
});

app.delete("/delete-file/:fileId", async (req, res) => {
  const { fileId } = req.params;

  try {
    const [results] = await db.query(
      "DELETE FROM sentences WHERE file_id = ?",
      [fileId]
    );
    res.send(
      `File with ID ${fileId} and ${results.affectedRows} sentences deleted successfully.`
    );
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).send("Error deleting file.");
  }
});

const deleteDuplicatesQuery = `
  DELETE t1 FROM sentences t1
  INNER JOIN sentences t2 
  WHERE t1.id > t2.id AND t1.sentence = t2.sentence
`;

async function deleteDuplicates() {
  try {
    const [results] = await db.query(deleteDuplicatesQuery);
    console.log(
      "Duplicate entries deleted successfully:",
      results.affectedRows,
      "records."
    );
  } catch (err) {
    console.error("Error deleting duplicates:", err);
  }
}

setInterval(deleteDuplicates, 3600000); // Every hour

app.post("/change-credentials", (req, res) => {
  const { newUsername, newPassword } = req.body;

  if (newUsername && newPassword) {
    storedUsername = newUsername;
    storedPassword = newPassword;
    res.json({ success: true, message: "تم تحديث بيانات الدخول بنجاح" });
  } else {
    res.json({
      success: false,
      message: "يرجى إدخال اسم المستخدم وكلمة المرور الجديدة",
    });
  }
});

const cache = new NodeCache({ stdTTL: 60, checkperiod: 60 });

const sheets = google.sheets("v4");

const auth = new google.auth.GoogleAuth({
  keyFile: "secret/data-427402-2096509aa9d6.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

app.post("/api/excel", async (req, res) => {
  try {
    const cacheKey = "spreadsheetDataEncrypted";
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return res.json({ data: cachedData });
    }

    const client = await auth.getClient();
    const spreadsheetId = "16FiJrTM8hYcqPZ6Vj2P4Jbpzck80824ldrBJiHbTxCE";
    const range = "sawa";

    const response = await sheets.spreadsheets.values.get({
      auth: client,
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    let jsonData = [];

    if (rows.length) {
      const headers = rows[0];
      const dataRows = rows.slice(1);

      jsonData = dataRows
        .map((row) => {
          let obj = {};
          row.forEach((cell, i) => {
            obj[headers[i]] = cell;
          });

          const hasValues = Object.values(obj).some(
            (value) => value && value.toString().trim() !== ""
          );
          return hasValues ? obj : null;
        })
        .filter((row) => row !== null);
    }

    const result = {
      Items: jsonData,
      TotalResults: jsonData.length,
      TotalPages: Math.ceil(jsonData.length / 10),
    };

    const secretKey = "sawa2020!";
    const encryptedResult = CryptoJS.AES.encrypt(
      JSON.stringify(result),
      secretKey
    ).toString();

    cache.set(cacheKey, encryptedResult);

    res.json({ data: encryptedResult });
  } catch (error) {
    console.error(
      "Error fetching or processing the Google Sheets API data:",
      error.message
    );
    res
      .status(500)
      .send("Error fetching or processing the Google Sheets API data.");
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/upload", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "upload_file.html"));
});

app.get("/adduser", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "input_form.html"));
});
app.get("/edite", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "edite.html"));
});
app.get("/delete", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "delete.html"));
});

async function getExcelData() {
  try {
    const response = await axios.post("https://api.ajls.online/api/excel", {},);
    return response.data.data.Items || [];
  } catch (error) {
    console.error("Error fetching Excel data:", error);
    return [];
  }
}

async function getSuggestions() {
  try {
    const response = await axios.get('https://api.ajls.online/getSuggestions',);
    return response.data;
  } catch (error) {
    console.error('Error fetching suggestions:', error);
  }
}

function deleteSuggestionFromDB(suggestion) {
  const query = "DELETE FROM Suggestions WHERE Suggestion = ?";
  db.query(query, [suggestion], (err, result) => {
    if (err) {
      console.error("خطأ أثناء حذف البيانات:", err);
    } else {
      console.log(`تم حذف ${suggestion} من قاعدة البيانات.`);
    }
  });
}

async function compareAndDelete() {
  try {
    const excelData = await getExcelData();
    const suggestions = await getSuggestions();

    if (!Array.isArray(excelData) || !Array.isArray(suggestions)) {
      console.error("Invalid data format received.");
      return;
    }

    const fields = [
      "المعنى",
      "التصنيف النحوي",
      "الأمثلة",
      "kana",
      "meaning",
      "short",
      "writings",
      "الكلمة",
      "النطق",
      "التعريف",
      "الاشتقاقات والتصريفات",
      "الملاحظات الثقافية",
      "المصادر والمراجع",
      "الأمثلة الصوتية",
      "المرادف",
      "العبارات الاصطلاحية",
      "الاستعمالات الشائعة",
      "الرموز والأصل اللغوي",
      "الصور",
      "التعليقات والملاحظات",
      "الفئة",
      "الأمثلة السياقية",
      "الاختصارات",
      "التنبيهات النحوية",
    ];

    suggestions.forEach((suggestion) => {
      excelData.forEach((row) => {
        fields.forEach((field) => {
          if (row[field] && row[field] === suggestion.Suggestion) {
            deleteSuggestionFromDB(suggestion.Suggestion);
          }
        });
      });
    });

    console.log("Comparison and deletion completed successfully.");
  } catch (error) {
    console.error("Error during comparison and deletion:", error);
  }
}

setInterval(() => {
  compareAndDelete();
}, 3600000);


app.listen(port, '0.0.0.0',() => {
  console.log(`Server running on port ${port}`);
});
