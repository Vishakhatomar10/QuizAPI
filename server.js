const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
const bodyParser = require("body-parser");
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
const pool = require("./app/config/db");

require("./app/routes/quiz.routes")(app);


app.post("/addNewQuestion", async (request, response) => {
  const client = await pool.connect();
  const subject_id = request.body.subject_id;
  const question = request.body.question;
  const option1 = request.body.option1;
  const option2 = request.body.option2;
  const option3 = request.body.option3;
  const option4 = request.body.option4;
  const correct_answer = request.body.correct_answer;


  try {
    const res = await client.query(`INSERT INTO questions (subject_id,question, option1, option2, option3, option4, correct_answer) VALUES ($1, $2, $3, $4, $5, $6,$7);`, [subject_id, question, option1, option2, option3, option4, correct_answer]);
    response.json({ data: res.rows, message: 'Data inserted successfully' });
  } catch (error) {
    response.json({ error: error });
  } finally {
    console.log("Connection released");
    client.release();
  }
});



app.post('/editQuestion', async (request, response) => {
  const client = await pool.connect();

  const subject_id = request.body.subject_id;
  const question = request.body.question;
  const option1 = request.body.option1;
  const option2 = request.body.option2;
  const option3 = request.body.option3;
  const option4 = request.body.option4;
  const correct_answer = request.body.correct_answer;
  const ques_id = request.body.ques_id;

  try {
    const res = await client.query(`
    UPDATE questions
    SET subject_id = $1, question = $2, option1 = $3, option2 = $4, option3 = $5, option4 = $6, correct_answer = $7
    WHERE ques_id = $8;
    
    `, [subject_id, question, option1, option2, option3, option4, correct_answer, ques_id]);

    if (res.rowCount > 0) {
      response.json({ message: 'Data updated successfully' });
    } else {
      response.json({ message: 'No data updated' });
    }
  } catch (error) {
    response.json({ error: error });
  } finally {
    client.release();
  }
});

app.post("/quiz", async (request, response) => {
  const client = await pool.connect();
  const subject_id = request.body.subject_id;

  try {
    const res = await client.query(`select subject_id, question ,option1,option2,option3,option4 from questions where subject_id = $1`, [subject_id]);
    response.json({ data: res.rows, message: "Data found" });
  } catch (e) {
    response.json({
      error: e,
    });
  } finally {
    client.release();
  }
});

app.post("/userDetails", async (request, response) => {
  const client = await pool.connect();
  const name = request.body.name;
  const email = request.body.email;
  const otp = request.body.otp;

  try {
    const emailCheck = await client.query(`SELECT * FROM "user" WHERE email = $1;`, [email]);

    if (emailCheck.rows.length > 0) {
      response.status(400).json({ message: 'Email already exists in the database' });
    }
     else {
      await client.query(`INSERT INTO "user" (name, email, otp) VALUES ($1, $2, $3)`, [name, email, otp]);
      response.json({ message: 'Data inserted successfully' });
    }
  } catch (error) {
    response.json({ error: error });
  } finally {
    console.log("Connection released");
    client.release();
  }
});




app.post("/validateOTP", async (request, response) => {
  const { email, enteredOTP } = request.body;

  try {
    const client = await pool.connect();
    const res = await client.query(`SELECT otp FROM "user" WHERE email = $1`, [email]);
  

    if (res.rows.length > 0) {
      const storedOTP = res.rows[0].otp;

      if (enteredOTP === storedOTP) {
        response.json({ message: 'OTP validation successful' });
      } else {
        response.status(400).json({ message: 'Invalid OTP entered' });
      }
    } else {
      response.status(404).json({ message: 'Email not found' });
    }

    client.release();
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});



app.post("/updatePassword", async (request, response) => {
  const client = await pool.connect();
  const password = request.body.password;
  const email = request.body.email;


  try {
    const res = await client.query(`UPDATE "user" SET "password" = $1 WHERE email = $2;`, [password, email]);
    response.json({ data: res.rows, message: 'Data inserted successfully' });
  } catch (error) {
    response.json({ error: error });
  } finally {
    console.log("Connection released");
    client.release();
  }
});




app.post('/login', async (request, response) => {
  const client = await pool.connect();
  const { email, password, userType } = request.body;

  if (!email || !password) {
    return response.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    if (userType === 'admin') {
      const res = await client.query(`SELECT * FROM admin WHERE email = $1 AND password = $2;`, [email, password]);

      if (res.rowCount > 0) {
        return response.json({ success: true, message: 'Login successful.', data: res.rows });
      } else {
        return response.status(401).json({ success: false, message: 'Invalid email or password.' });
      }
    } else {
      const res = await client.query(`SELECT * FROM "user" WHERE email = $1 AND password = $2;`, [email, password]);

      if (res.rowCount > 0) {
        return response.json({ success: true, message: 'Login successful.', data: res.rows });
      } else {
        return response.status(401).json({ success: false, message: 'Invalid email or password.' });
      }
    }
  } catch (error) {
    console.error('Error executing query:', error);
    return response.status(500).json({ success: false, message: 'Internal server error.' });
  }
});




app.post("/emailExist", async (req, res) => {
  const email = req.body.email;
  try {
    const result = await pool.query(`select * from "user" where email = $1`, [email]);
    res.json({ exists: result.rowCount > 0  ,message:'Email does not exist. Please sign up.'});
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({ error: 'An error occured.' });
  }
});




app.post("/updateOTP", async (request, response) => {
  const client = await pool.connect();
  const otp = request.body.otp;
  const email = request.body.email;


  try {
    const res = await client.query(`UPDATE "user" SET "otp" = $1 WHERE email = $2;`, [otp, email]);
    response.json({ data: res.rows, message: 'OTP updated successfully' });
  } catch (error) {
    response.json({ error: error });
  } finally {
    console.log("Connection released");
    client.release();
  }
});





app.post("/score", async (request, response) => {
  const client = await pool.connect();
  const subject_id = request.body.subject_id;

  try {
    const res = await client.query(`
    SELECT question, correct_answer
    FROM questions
    WHERE subject_id = $1`, [subject_id]);
    response.json({ data: res.rows, message: "Data found" });
  } catch (e) {
    response.json({
      error: e,
    });
  } finally {
    client.release();
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

