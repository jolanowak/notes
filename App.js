import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Container, Button } from 'react-bootstrap';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notes: [],
      editNoteId: null,
      editedNoteDescription: '',
      token: null,
    };
    this.API_URL = 'http://localhost:5038/';
  }

  componentDidMount() {
    const token = localStorage.getItem('token');
    if (token) {
      this.setState({ token }, () => {
        this.refreshNotes();
      });
    }
  }

  async login() {
    const username = document.querySelector('#usernameInput').value;
    const password = document.querySelector('#passwordInput').value;

    const response = await fetch(this.API_URL + 'api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Zalogowano. Token:', data.token);
      this.setState({ token: data.token });
      localStorage.setItem('token', data.token);
      this.refreshNotes();
    } else {
      console.error('Błąd logowania');
    }
  }

  async register() {
    const username = document.querySelector('#usernameInput').value;
    const password = document.querySelector('#passwordInput').value;

    const response = await fetch(this.API_URL + 'api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Zarejestrowano. Token:', data.token);
      this.setState({ token: data.token });
      localStorage.setItem('token', data.token);
      this.refreshNotes();
    } else {
      console.error('Błąd rejestracji');
    }
  }

  logout() {
    this.setState({ token: null });
    localStorage.removeItem('token');
  }

  async refreshNotes() {
    const token = this.state.token;

    const response = await fetch(this.API_URL + 'api/notes/GetNotes', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Błąd pobierania notatek:', response.statusText);
      return;
    }

    const data = await response.json();
    this.setState({ notes: data });
  }

  async addClick() {
    var newNotes = document.getElementById('newNotes').value;
    const data = new FormData();
    data.append('newNotes', newNotes);
    const token = this.state.token;

    fetch(this.API_URL + 'api/notes/AddNotes', {
      method: 'POST',
      body: data,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        alert(result);
        this.refreshNotes();
      });
  }

  async deleteClick(id) {
    const token = this.state.token;

    fetch(this.API_URL + 'api/notes/DeleteNote/' + id, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        alert(result);
        this.refreshNotes();
      });
  }

  startEditing(id, description) {
    this.setState({ editNoteId: id, editedNoteDescription: description });
  }

  cancelEditing() {
    this.setState({ editNoteId: null, editedNoteDescription: '' });
  }

  async saveEdit(id, description) {
    const data = new FormData();
    data.append('updatedNotes', description);
    const token = this.state.token;

    fetch(this.API_URL + 'api/notes/UpdateNote/' + id, {
      method: 'PUT',
      body: data,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        alert(result);
        this.setState({ editNoteId: null, editedNoteDescription: '' });
        this.refreshNotes();
      });
  }

  async displayNotes() {
    this.refreshNotes();
  }

  render() {
    const { notes, editNoteId, editedNoteDescription, token } = this.state;

    return (
      <div className="App">
        <Navbar bg="light" variant="light">
          <Container>
            <Navbar.Brand href="#">Rodzinny spis obowiązków</Navbar.Brand>
            {token && (
              <Navbar.Collapse className="justify-content-end">
                <Navbar.Text>
                  <Button variant="outline-danger" onClick={() => this.logout()}>Logout</Button>
                </Navbar.Text>
              </Navbar.Collapse>
            )}
          </Container>
        </Navbar>

        <Container className="mt-3">
          {token && (
            <>
              

              <div className="editing-section">
                <input id="newNotes" className="form-control" />
                <Button variant="outline-success" onClick={() => this.addClick()}>Add Notes</Button>
                <Button variant="outline-primary" onClick={() => this.displayNotes()}>Display Notes</Button>
              </div>

              {notes.map((note, index) => (
                <div className="note" key={index}>
                  {editNoteId === note.id ? (
                    <>
                      <input
                        type="text"
                        value={editedNoteDescription}
                        onChange={(e) =>
                          this.setState({ editedNoteDescription: e.target.value })
                        }
                        className="form-control"
                      />
                      <div className="editing-section">
                        <Button variant="outline-primary" onClick={() => this.saveEdit(note.id, editedNoteDescription)}>Save</Button>
                        <Button variant="outline-secondary" onClick={() => this.cancelEditing()}>Cancel</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <b>* {note.description}</b>
                      <div className="editing-section">
                        <Button variant="outline-warning" onClick={() => this.startEditing(note.id, note.description)}>
                          Edit Notes
                        </Button>
                        <Button variant="outline-danger" onClick={() => this.deleteClick(note.id)}>Delete Notes</Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </>
          )}

          {!token && (
            <div className="login-container">
              <h1>Login</h1>
              <label htmlFor="usernameInput">Username:</label>
              <input type="text" id="usernameInput" className="form-control" />
              <br />
              <label htmlFor="passwordInput">Password:</label>
              <input type="password" id="passwordInput" className="form-control" />
              <br />
              <Button variant="outline-primary" onClick={() => this.login()}>Login</Button>
              <Button variant="outline-success" onClick={() => this.register()}>Register</Button>
            </div>
          )}
        </Container>
      </div>
    );
  }
}

export default App;
