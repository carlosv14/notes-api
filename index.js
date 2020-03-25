var express = require("express");
var app = express();
var jwt = require('jsonwebtoken');
var cors = require('cors');
const url = require('url');
const bodyParser = require('body-parser')

app.use(bodyParser.json());

app.use(cors());


app.listen(3000, () => {
    console.log("Server running on port 3000");
   });

let teachers = [{username:"cvarela", password:"test123@"}]
let students = [
    {
        username: "juan",
        name: "Juan Martinez",
        id: 1,
        password: "juan"
    },
    {
        username: "pedro",
        name: "Pedro Suarez",
        id: 2,
        password: "pedro"
    },
    {
        username: "carlos",
        name: "Carlos Gutierrez",
        id: 3,
        password: "carlos"
    },
    {
        username: "roberto",
        name: "Roberto Castejon",
        id: 4,
        password: "roberto"
    }
]
let notes = [
    {
        id: 1,
        studentId: 1,
        studentName: "Juan Martinez",
        note: "75",
        class: "Programación web 1"
    },
    {
        id:2,
        studentName: "Pedro Suarez",
        studentId: 2,
        note: "55",
        class: "Programación web 2"
    },
    {
        id:3,
        studentName: "Carlos Gutierrez",
        studentId: 3,
        note: "90",
        class: "Programación web 1"
    },
    {
        id:4,
        studentName: "Roberto Castejon",
        studentId: 4,
        note: "85",
        class: "Programación web 2"
    },
    {
        id:5,
        studentName: "Carlos Gutierrez",
        studentId: 3,
        note: "86",
        class: "Base de datos"
    },
    {
        id:6,
        studentName: "Roberto Castejon",
        studentId: 4,
        note: "75",
        class: "Base de datos"
    }
]

app.post("/login", (req, res, next) => {
    const { username, password } = req.body;
    let user = teachers.find(x =>x.username === username && x.password === password);
    if(user !== undefined){
        const token = jwt.sign({ id: "admin" }, "shhh", {
            expiresIn: 1440
        });
        res.json({
            authenticated: true,
            isAdmin: true,
            message: "¡Autenticación exitosa!",
            token: token
        });
        return;
    }
    user = students.find(x => x.username === username && x.password === password);
    if(user !== undefined){
        const token = jwt.sign({ id: user.id }, "shhh", {
            expiresIn: 1440
        });
        res.json({
            authenticated: true,
            isAdmin: false,
            message: "¡Autenticación exitosa!",
            token
        });
        return;
    }
    res.json({
        authenticated: false,
        isAdmin: null,
        message: "Usuario y/o contraseña incorrecto",
        token: null
    });
});

app.get("/notes", (req, res, next) => {
    var token = req.headers['x-access-token'];
    jwt.verify(token, "shhh", function (err, decoded) {
        if(err)
            return res.json(notes);

        console.log(decoded.id);
        if(decoded.id === "admin"){
            return res.json(notes);
        }
        let student = students.find(x => x.id === parseInt(decoded.id));
        let response = notes.filter(x => x.studentId === parseInt(student.id));
        if(response !== undefined)
            return res.json(response);
        return res.json(notes);
    });
});

app.get("/notes/:noteId", (req, res, next) => {
    let note = notes.find(x => x.id == req.params.noteId);
    if(note == undefined){
        return res.status(500).send("Note not found");
    }
    return res.json(note);
});

app.put("/notes/:noteId", (req, res, next) => {
    let note = notes.find(x => x.id == req.params.noteId);
    if(note == undefined){
        return res.status(500).send("Note not found");
    }
    note.note = req.body.note;
    console.log(note);
    console.log(notes);
    return res.json(note);
});

app.get("/help", (req, res, next) => {
    const queryObject = url.parse(req.url,true).query;
    if(queryObject.action === "login"){
        return res.json({
            type: 'POST',
            action: "login",
            params: "username : string, password : string",
            response: { 
                autenthicated : "boolean",
                isAdmin : "boolean", 
                message : "string",
                token : "string" 
            },
            description: " authenticated: indica si la autenticación fue exitosa, message: mensaje que refleja si la autenticación fue exitosa, isAdmin: indica si el usuario es administrador, token: el token de autenticación"
        })
    }
    else if(queryObject.action === "notes"){
        return res.json({
            type: 'GET',
            action: "notes",
            params: "",
            response: [
                { 
                    id: "number",
                    studentId: "number",
                    studentName: "string",
                    note: "number",
                    class: "string"
                }
            ],
            description: "Enviar el token en el header 'x-access-token'. Si no se envía token o el token es de un maestro retorna todas las notas, si el token es de un alumno retorna solo las notas de ese alumno."
        });
    }
    else if(queryObject.action === "notes/:noteId"){
        return res.json({
            type: 'PUT',
            action: "/notes/:noteId",
            params: "noteId : number, note : { id: number, studentId: number, studentName: string, note: number, class: string}",
            response: { 
                id: "number",
                studentId: "number",
                studentName: "string",
                note: "number",
                class: "string"
            },
            description: "Enviar el token en el header 'x-access-token'. El parámetro noteId es el id de la nota que se cambiara y el parametro note es el nuevo valor de la nota."
        });
    }

    return res.json({
        students : students,
        teachers : teachers,
        notes: notes
    });

})