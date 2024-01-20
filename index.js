const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bearerToken = require('express-bearer-token');

const app = express();
app.use(cors());
app.use(express.json());
app.use(bearerToken());

const CONNECTION_STRING = 'mongodb+srv://admin:admin@cluster0.ao32vt3.mongodb.net/?retryWrites=true&w=majority';
const DATABASE = 'notes';
const SECRET_KEY = 'your_secret_key';

let database;

app.listen(5038, () => {
  MongoClient.connect(CONNECTION_STRING, (err, client) => {
    if (err) {
      console.error('Błąd połączenia z bazą danych:', err);
      return;
    }
    database = client.db(DATABASE);
    console.log('Baza podłączona');
  });
});

const authenticate = (request, response, next) => {
  const token = request.token;
  if (!token) {
    return response.status(401).json('Brak autoryzacji');
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    request.user = decoded;
    next();
  } catch (error) {
    response.status(401).json('Nieprawidłowy token');
  }
};

app.post('/api/auth/login', async (request, response) => {
  const { username, password } = request.body;

  const user = await database.collection('users').findOne({ username });

  if (!user || !await bcrypt.compare(password, user.password)) {
    return response.status(401).json('Nieprawidłowe dane logowania');
  }

  const token = jwt.sign({ username: user.username, id: user.id }, SECRET_KEY);
  response.json({ token });
});

app.post('/api/auth/register', async (request, response) => {
  const { username, password } = request.body;

  try {
    const existingUser = await database.collection('users').findOne({ username });
    if (existingUser) {
      return response.status(400).json('Użytkownik o tej nazwie już istnieje');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, password: hashedPassword };
    await database.collection('users').insertOne(newUser);

    const token = jwt.sign({ username: newUser.username, id: newUser.id }, SECRET_KEY);
    response.json({ token });
  } catch (error) {
    console.error('Błąd rejestracji:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/notes/GetNotes', authenticate, (request, response) => {
    database.collection('notesapp').find({}).toArray((error, result) => {
      if (error) {
        console.error('Błąd podczas pobierania notatek:', error);
        response.status(500).send('Błąd podczas pobierania notatek');
        return;
      }
      console.log('Pobrane notatki:', result);
      response.send(result);
    });
  });
  

app.post('/api/notes/AddNotes', multer().none(), (request, response) => {
  database.collection('notesapp').countDocuments({}, (error, numOfDocs) => {
    database.collection('notesapp').insertOne(
      {
        id: (numOfDocs + 1).toString(),
        description: request.body.newNotes,
      },
      (insertError, insertResult) => {
        if (insertError) {
          console.error('Błąd podczas dodawania notatki:', insertError);
          response.status(500).send('Błąd podczas dodawania notatki');
          return;
        }
        response.json('dodane');
      }
    );
  });
});

app.delete('/api/notes/DeleteNote/:id', (request, response) => {
  const noteId = request.params.id;

  database.collection('notesapp').deleteOne({ id: noteId }, (error, result) => {
    if (error) {
      console.error('Błąd podczas usuwania notatki:', error);
      response.status(500).send('Błąd podczas usuwania notatki');
      return;
    }

    if (result.deletedCount === 0) {
      response.status(404).send('Notatka o podanym ID nie istnieje');
      return;
    }

    response.json('usunięte');
  });
});

app.put('/api/notes/UpdateNote/:id', multer().none(), (request, response) => {
  const noteId = request.params.id;
  const updatedDescription = request.body.updatedNotes;

  database.collection('notesapp').updateOne(
    { id: noteId },
    { $set: { description: updatedDescription } },
    (error, result) => {
      if (error) {
        console.error('Błąd podczas aktualizacji notatki:', error);
        response.status(500).send('Błąd podczas aktualizacji notatki');
        return;
      }

      if (result.matchedCount === 0) {
        response.status(404).send('Notatka o podanym ID nie istnieje');
        return;
      }

      response.json('zaktualizowane');
    }
  );
});
