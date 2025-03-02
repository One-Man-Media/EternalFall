let projectData = JSON.parse(localStorage.getItem('eternalFallData')) || { phases: [], tasks: [] };

function saveData() {
    localStorage.setItem('eternalFallData', JSON.stringify(projectData));
}

function renderTable() {
    const tableBody = document.querySelector('#project-table tbody');
    tableBody.innerHTML = '';
    document.getElementById('delete-item-select').innerHTML = '';
    document.getElementById('new-task-phase').innerHTML = "";

    // Render phases
    projectData.phases.forEach((phase, index) => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = 'Phase';
        row.insertCell().textContent = phase.name;
        row.insertCell().textContent = phase.description;
        row.insertCell().textContent = calculatePhaseTotalTime(index);
        row.insertCell().textContent = '-';
        row.insertCell().textContent = '-';
        row.insertCell().textContent = calculatePhaseProgress(index);

        const option = document.createElement("option");
        option.text = phase.name;
        option.value = index;
        document.getElementById('new-task-phase').add(option);

        const deleteOption = document.createElement("option");
        deleteOption.text = "Phase: " + phase.name;
        deleteOption.value = "phase-" + index;
        document.getElementById("delete-item-select").add(deleteOption);
    });

    // Render tasks
    projectData.tasks.forEach((task, index) => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = 'Task';
        row.insertCell().textContent = task.name;
        row.insertCell().textContent = task.description;
        row.insertCell().textContent = task.difficulty;
        row.insertCell().textContent = task.duration;
        row.insertCell().textContent = projectData.phases[task.phaseIndex].name;
        row.insertCell().innerHTML = createStatusDropdown(task.phaseIndex, index, 'task');

        const deleteOption = document.createElement("option");
        deleteOption.text = "Task: " + task.name;
        deleteOption.value = "task-" + index;
        document.getElementById("delete-item-select").add(deleteOption);
    });

    updatePhaseCompletion();
}

function createStatusDropdown(phaseIndex, taskIndex, type) {
    let status = type === 'task' ? projectData.tasks[taskIndex].status || 'Not Started' : calculatePhaseProgress(phaseIndex);
    let dropdown = `
        <div class="status-dropdown">
            <span>${status}</span>
            <div class="status-dropdown-content">
                <a href="#" onclick="updateStatus('${phaseIndex}', '${taskIndex}', '${type}', 'Not Started')">Not Started</a>
                <a href="#" onclick="updateStatus('${phaseIndex}', '${taskIndex}', '${type}', 'In Progress')">In Progress</a>
                <a href="#" onclick="updateStatus('${phaseIndex}', '${taskIndex}', '${type}', 'Completed')">Completed</a>
            </div>
        </div>
    `;
    return dropdown;
}

function updateStatus(phaseIndex, taskIndex, type, newStatus) {
    if (type === 'task') {
        projectData.tasks[taskIndex].status = newStatus;
    }
    saveData();
    renderTable();
}

function calculatePhaseTotalTime(phaseIndex) {
    let totalTime = 0;
    projectData.tasks.forEach(task => {
        if (task.phaseIndex === phaseIndex) {
            totalTime += parseInt(task.duration) || 0;
        }
    });
    return totalTime;
}

function calculatePhaseProgress(phaseIndex) {
    let tasksInPhase = projectData.tasks.filter(task => task.phaseIndex === phaseIndex);
    if (tasksInPhase.length === 0) {
        return "Not Started";
    }

    let completedTasks = tasksInPhase.filter(task => task.status === 'Completed').length;
    let inProgressTasks = tasksInPhase.filter(task => task.status === 'In Progress').length;

    if (completedTasks === tasksInPhase.length) {
        return "Completed";
    } else if (inProgressTasks > 0 || completedTasks > 0) {
        let percentage = (completedTasks + inProgressTasks/2) / tasksInPhase.length * 100;
        return `In Progress (${percentage.toFixed(0)}%)`;
    } else {
        return "Not Started";
    }
}

function updatePhaseCompletion() {
    projectData.phases.forEach((phase, phaseIndex) => {
        phase.completion = calculatePhaseProgress(phaseIndex);
    });
    saveData();
    renderTable();
}

function showAddPhaseForm() {
    document.getElementById('add-phase-form').style.display = 'block';
    document.getElementById('add-task-form').style.display = 'none';
}

function showAddTaskForm() {
    document.getElementById('add-task-form').style.display = 'block';
    document.getElementById('add-phase-form').style.display = 'none';
}

function addPhase() {
    projectData.phases.push({
        name: document.getElementById('new-phase-name').value,
        description: document.getElementById('new-phase-description').value,
        status: 'Not Started'
    });
    document.getElementById('new-phase-name').value = '';
    document.getElementById('new-phase-description').value = '';
    document.getElementById('add-phase-form').style.display = 'none';
    saveData();
    renderTable();
}

function addTask() {
    projectData.tasks.push({
        name: document.getElementById('new-task-name').value,
        description: document.getElementById('new-task-description').value,
        difficulty: document.getElementById('new-task-difficulty').value,
        duration: document.getElementById('new-task-duration').value,
        phaseIndex: parseInt(document.getElementById('new-task-phase').value),
        status: 'Not Started'
    });
    document.getElementById('new-task-name').value = '';
    document.getElementById('new-task-description').value = '';
    document.getElementById('new-task-difficulty').value = '';
    document.getElementById('new-task-duration').value = '';
    document.getElementById('add-task-form').style.display = 'none';
    saveData();
    renderTable();
}

function deleteItem() {
    const selected = document.getElementById('delete-item-select').value;
    const parts = selected.split('-');
    const type = parts[0];
    const index = parseInt(parts[1]);

    if (type === 'phase') {
        projectData.phases.splice(index, 1);
        projectData.tasks.forEach(task => {
            if (task.phaseIndex > index) {
                task.phaseIndex--;
            }
        });
    } else if (type === 'task') {
        projectData.tasks.splice(index, 1);
    }

    saveData();
    renderTable();
}

renderTable();
