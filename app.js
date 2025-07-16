const { createApp, ref } = Vue;

createApp({
  setup() {
    const statuses = ['backlog', 'todo', 'inprogress', 'codereview', 'done'];
    const statusLabels = {
      backlog: 'Backlog',
      todo: 'To Do (Sprint Backlog)',
      inprogress: 'In Progress',
      codereview: 'Code Review / Test',
      done: 'Done (Sprintziel erreicht)'
    };

    const roleColors = {
      'Product Owner': '#f39c12', // Orange
      Entwickler: '#3498db',      // Blau
      'Scrum Master': '#27ae60'   // Grün
    };

    const users = ref(JSON.parse(localStorage.getItem('users') || '[]'));
    const tasks = ref(JSON.parse(localStorage.getItem('tasks') || '[]'));

    const newUserName = ref('');
    const newUserRole = ref('');
    const newTaskText = ref('');
    const newTaskUser = ref('');
    const newTaskDeadline = ref('');

    let draggedTask = null;

    function saveUsers() {
      localStorage.setItem('users', JSON.stringify(users.value));
    }
    function saveTasks() {
      localStorage.setItem('tasks', JSON.stringify(tasks.value));
    }

    function roleColor(role) {
      return roleColors[role] || '#999';
    }

    function userRoleByName(name) {
      const user = users.value.find(u => u.name === name);
      return user ? user.role : '';
    }

    function addUser() {
      const name = newUserName.value.trim();
      const role = newUserRole.value;
      if (!name || !role) return alert('Name und Rolle müssen angegeben werden');
      if (users.value.some(u => u.name === name)) return alert('Nutzer existiert bereits');
      users.value.push({
        id: Date.now().toString(),
        name,
        role
      });
      newUserName.value = '';
      newUserRole.value = '';
      saveUsers();
    }

    function editUser(index) {
      const user = users.value[index];
      const newName = prompt('Nutzername bearbeiten:', user.name);
      if (!newName) return;
      const trimmedName = newName.trim();
      if (trimmedName === '' || (trimmedName !== user.name && users.value.some(u => u.name === trimmedName))) {
        alert('Ungültiger oder bereits vorhandener Name');
        return;
      }
      const newRole = prompt('Rolle bearbeiten (Product Owner, Entwickler, Scrum Master):', user.role);
      if (!newRole || !roleColors[newRole]) {
        alert('Ungültige Rolle');
        return;
      }
      tasks.value.forEach(task => {
        if (task.user === user.name) {
          task.user = trimmedName;
        }
      });
      users.value[index].name = trimmedName;
      users.value[index].role = newRole;
      saveUsers();
      saveTasks();
    }

    function deleteUser(index) {
      const username = users.value[index].name;
      if (confirm(`Nutzer "${username}" löschen? Aufgaben werden dann keinem Nutzer zugewiesen.`)) {
        users.value.splice(index, 1);
        tasks.value.forEach(task => {
          if (task.user === username) task.user = '';
        });
        saveUsers();
        saveTasks();
      }
    }

    function addTask() {
      if (!newTaskText.value.trim() || !newTaskUser.value || !newTaskDeadline.value) return;
      tasks.value.push({
        id: Date.now().toString(),
        text: newTaskText.value.trim(),
        status: 'backlog',  // Standard-Status backlog
        user: newTaskUser.value,
        deadline: newTaskDeadline.value
      });
      newTaskText.value = '';
      newTaskUser.value = '';
      newTaskDeadline.value = '';
      saveTasks();
    }

    function filteredTasks(status) {
      return tasks.value.filter(task => task.status === status);
    }

    function dragStart(task) {
      draggedTask = task;
    }

    function dragEnd() {
      draggedTask = null;
    }

    function dropTask(event, newStatus) {
      if (draggedTask) {
        draggedTask.status = newStatus;
        saveTasks();
      }
    }

    function editTask(task) {
      const newText = prompt('Aufgabe bearbeiten:', task.text);
      if (!newText || !newText.trim()) return;

      let newUser = prompt('Verantwortlicher Nutzer:', task.user);
      if (!newUser || !newUser.trim()) return;
      if (!users.value.some(u => u.name === newUser.trim())) {
        alert('Nutzer nicht gefunden. Bitte vorher Nutzer hinzufügen.');
        return;
      }

      const newDeadline = prompt('Deadline (YYYY-MM-DD):', task.deadline);
      if (!newDeadline || !newDeadline.trim()) return;

      task.text = newText.trim();
      task.user = newUser.trim();
      task.deadline = newDeadline.trim();
      saveTasks();
    }

    function deleteTask(task) {
      tasks.value = tasks.value.filter(t => t.id !== task.id);
      saveTasks();
    }

    function formatDate(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      if (isNaN(d)) return dateStr;
      return (
        String(d.getDate()).padStart(2, '0') +
        '.' +
        String(d.getMonth() + 1).padStart(2, '0') +
        '.' +
        d.getFullYear()
      );
    }

    return {
      statuses,
      statusLabels,
      users,
      tasks,
      newUserName,
      newUserRole,
      newTaskText,
      newTaskUser,
      newTaskDeadline,
      addUser,
      editUser,
      deleteUser,
      addTask,
      filteredTasks,
      dragStart,
      dragEnd,
      dropTask,
      editTask,
      deleteTask,
      roleColor,
      userRoleByName,
      formatDate
    };
  }
}).mount('#app');
