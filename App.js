import React, { Component } from 'react';
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
        {token ? (
          <>
            <h1>Rodzinny spis obowiązków</h1>
            <button onClick={() => this.logout()}>Logout</button>
            <input id="newNotes" />&nbsp;
            <button onClick={() => this.addClick()}>Add Notes</button>
            <button onClick={() => this.displayNotes()}>Display Notes</button>
            {notes.map((note, index) => (
              <p key={index}>
                {editNoteId === note.id ? (
                  <>
                    <input
                      type="text"
                      value={editedNoteDescription}
                      onChange={(e) =>
                        this.setState({ editedNoteDescription: e.target.value })
                      }
                    />
                    <button onClick={() => this.saveEdit(note.id, editedNoteDescription)}>Save</button>
                    <button onClick={() => this.cancelEditing()}>Cancel</button>
                  </>
                ) : (
                  <>
                    <b>* {note.description}</b>&nbsp;
                    <button onClick={() => this.startEditing(note.id, note.description)}>
                      Edit Notes
                    </button>
                    <button onClick={() => this.deleteClick(note.id)}>Delete Notes</button>
                  </>
                )}
                <br />
              </p>
            ))}
          </>
        ) : (
          <>
            <h1>Login</h1>
            <label htmlFor="usernameInput">Username:</label>
            <input type="text" id="usernameInput" /><br />
            <label htmlFor="passwordInput">Password:</label>
            <input type="password" id="passwordInput" /><br />
            <button onClick={() => this.login()}>Login</button>
            <button onClick={() => this.register()}>Register</button>
          </>
        )}
      </div>
    );
  }
}

export default App;
