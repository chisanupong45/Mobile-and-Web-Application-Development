const RB = ReactBootstrap;
const { Alert, Card, Button, Table } = ReactBootstrap;

const firebaseConfig = {
  apiKey: "AIzaSyBnuh9o2Ust9c6OtfAaKf8k3Dixdayv5XA",
  authDomain: "web2566-lab6.firebaseapp.com",
  projectId: "web2566-lab6",
  storageBucket: "web2566-lab6.appspot.com",
  messagingSenderId: "573823182738",
  appId: "1:573823182738:web:c2e1f74b677ed7f9e6034b",
  measurementId: "G-8HVSGGYDG0",
};
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
// db.collection("students")
//   .get()
//   .then((querySnapshot) => {
//     querySnapshot.forEach((doc) => {
//       console.log(`${doc.id} =>`, doc.data());
//     });
// });

function StudentTable({ data, app }) {
  return (
    <table className="table">
      <tr>
        <td>รหัส</td>
        <td>คำนำหน้า</td>
        <td>ชื่อ</td>
        <td>สกุล</td>
        <td>email</td>
      </tr>
      {data.map((s) => (
        <tr>
          <td>{s.id}</td>
          <td>{s.title}</td>
          <td>{s.fname}</td>
          <td>{s.lname}</td>
          <td>{s.email}</td>
          <td>
            <EditButton std={s} app={app} />
          </td>
          <td>
            <DeleteButton std={s} app={app} />
          </td>
        </tr>
      ))}
    </table>
  );
}

function TextInput({ label, app, value, style }) {
  return (
    <label className="form-label">
      {label}:
      <input
        className="form-control"
        style={style}
        value={app.state[value]}
        onChange={(ev) => {
          var s = {};
          s[value] = ev.target.value;
          app.setState(s);
        }}
      ></input>
    </label>
  );
}

function EditButton({ std, app }) {
  return <button onClick={() => app.edit(std)}>แก้ไข</button>;
}

function DeleteButton({ std, app }) {
  return <button onClick={() => app.delete(std)}>ลบ</button>;
}

class App extends React.Component {
  title = (
    <Alert variant="info">
      <b>Work6 :</b> Firebase
    </Alert>
  );
  footer = (
    <div>
      By 643020472-7 Chisanupong Pinthong <br />
      College of Computing, KhonKaen University
    </div>
  );
  state = {
    scene: 0,
    students: [],
    stdid: "",
    stdtitle: "",
    stdfname: "",
    stdlname: "",
    stdemail: "",
    stdphone: "",
    user: null,
    foundStudent: null,
  };

  readData() {
    db.collection("students")
      .get()
      .then((querySnapshot) => {
        var stdlist = [];
        querySnapshot.forEach((doc) => {
          stdlist.push({ id: doc.id, ...doc.data() });
        });
        console.log(stdlist);
        this.setState({ students: stdlist });
      });
  }

  autoRead() {
    db.collection("students").onSnapshot((querySnapshot) => {
      var stdlist = [];
      querySnapshot.forEach((doc) => {
        stdlist.push({ id: doc.id, ...doc.data() });
      });
      this.setState({ students: stdlist });
    });
  }

  insertData() {
    db.collection("students").doc(this.state.stdid).set({
      title: this.state.stdtitle,
      fname: this.state.stdfname,
      lname: this.state.stdlname,
      phone: this.state.stdphone,
      email: this.state.stdemail,
    });
  }

  edit(std) {
    this.setState({
      stdid: std.id,
      stdtitle: std.title,
      stdfname: std.fname,
      stdlname: std.lname,
      stdemail: std.email,
      stdphone: std.phone,
    });
  }

  delete(std) {
    if (confirm("ต้องการลบข้อมูล")) {
      db.collection("students").doc(std.id).delete();
    }
  }

  login() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) => {
        this.setState({ user: result.user });
        localStorage.setItem("user", JSON.stringify(result.user));
      })
      .catch((error) => {
        console.error(error);
      });
  }

  logout() {
    firebase
      .auth()
      .signOut()
      .then(() => {
        this.setState({ user: null });
        localStorage.removeItem("user");
        this.setState({ foundStudent: null });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  componentDidMount() {
    this.checkUser();
  }

  checkUser() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      this.setState({ user });
    }
  }
  
  searchByEmail(email) {
    const db = firebase.firestore();
    db.collection("students").where("email", "==", email)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const student = querySnapshot.docs[0].data();
          console.log(`Found student: ${doc.id}, ${student.title}, ${student.fname}, ${student.lname}, ${student.email}, ${student.phone}`);
          this.setState({ foundStudent: {id: doc.id, ...student} });
        } else {
          console.log('No student found with that email');
          this.setState({ foundStudent: null });
        }
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
  }
  
  componentDidUpdate(prevProps, prevState) {
    if (this.state.user && this.state.user !== prevState.user) {
      this.searchByEmail(this.state.user.email);
    }
  }

  render() {
    return (
      <Card>
        <Card.Header>{this.title}</Card.Header>
        <Card.Body>
          {this.state.user ? (
            <div>
              <p>Welcome, {this.state.user.displayName}</p>
              <p>Email: {this.state.user.email}</p>
              <Button variant="danger" onClick={() => this.logout()}>
                Logout
              </Button>
            </div>
          ) : (
            <Button variant="success" onClick={() => this.login()}>
              Login with Google
            </Button>
          )}
        </Card.Body>
        <div>
          {this.state.foundStudent ? (
            <div>
              <p>
                Found student: {this.state.foundStudent.id},{" "}
                {this.state.foundStudent.title}
                {this.state.foundStudent.fname}{" "}
                {this.state.foundStudent.lname},{" "}
                {this.state.foundStudent.email},{" "}
                {this.state.foundStudent.phone}
              </p>
            </div>
          ) : (
            <p>No student found with that email</p>
          )}
        </div>
        <Card.Body>
          <Button onClick={() => this.readData()}>Read Data</Button>
          <Button onClick={() => this.autoRead()}>Auto Read</Button>
          <div>
            <StudentTable data={this.state.students} app={this} />
          </div>
        </Card.Body>
        <Card.Footer>
          <b>เพิ่ม/แก้ไขข้อมูล นักศึกษา :</b>
          <br />
          <TextInput
            label="ID"
            app={this}
            value="stdid"
            style={{ width: 120 }}
          />
          <TextInput
            label="คำนำหน้า"
            app={this}
            value="stdtitle"
            style={{ width: 100 }}
          />
          <TextInput
            label="ชื่อ"
            app={this}
            value="stdfname"
            style={{ width: 120 }}
          />
          <TextInput
            label="สกุล"
            app={this}
            value="stdlname"
            style={{ width: 120 }}
          />
          <TextInput
            label="Email"
            app={this}
            value="stdemail"
            style={{ width: 150 }}
          />
          <TextInput
            label="Phone"
            app={this}
            value="stdphone"
            style={{ width: 120 }}
          />
          <Button onClick={() => this.insertData()}>Save</Button>
        </Card.Footer>
        <Card.Footer>{this.footer}</Card.Footer>
      </Card>
    );
  }
}

const container = document.getElementById("myapp");
const root = ReactDOM.createRoot(container);
root.render(<App />);
