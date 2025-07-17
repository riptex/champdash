const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(__dirname)); // Serve static files like dashboard.html

const dataFile = path.join(__dirname, 'projects.json');

// Helper to read projects
function readProjects() {
    if (!fs.existsSync(dataFile)) {
        fs.writeFileSync(dataFile, JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

// Helper to write projects
function writeProjects(projects) {
    fs.writeFileSync(dataFile, JSON.stringify(projects, null, 2));
}

// GET all projects
app.get('/projects', (req, res) => {
    res.json(readProjects());
});

// POST new project
app.post('/projects', (req, res) => {
    const projects = readProjects();
    const newId = projects.length ? Math.max(...projects.map(p => p.id)) + 1 : 1;
    const newProject = { id: newId, ...req.body };
    projects.push(newProject);
    writeProjects(projects);
    res.status(201).json(newProject);
});

// PUT update project
app.put('/projects/:id', (req, res) => {
    const projects = readProjects();
    const index = projects.findIndex(p => p.id === parseInt(req.params.id));
    if (index !== -1) {
        projects[index] = { ...projects[index], ...req.body };
        writeProjects(projects);
        res.json(projects[index]);
    } else {
        res.status(404).send('Project not found');
    }
});

// DELETE project
app.delete('/projects/:id', (req, res) => {
    let projects = readProjects();
    projects = projects.filter(p => p.id !== parseInt(req.params.id));
    writeProjects(projects);
    res.status(204).send();
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});