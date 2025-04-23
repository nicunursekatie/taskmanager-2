// src/App.tsx
import { loadPreloadedData } from './preloadedData.js';
import { initializeData } from './initialData.js';
import { useState, useEffect } from 'react';
import './app-styles.css';
import TaskList from './components/TaskList.js';
import ContextWizard from './components/ContextWizard';
import CategoryManager from './components/CategoryManager';
import ProjectManager from './components/ProjectManager';
import { Task, Category, Project } from './types';


type TabType = 'dashboard' | 'all-tasks' | 'projects' | 'categories';

function App() {
  // Navigation state
  initializeData();
  useEffect(() => {
    // Check if data exists
    const tasksData = localStorage.getItem('tasks');
    const projectsData = localStorage.getItem('projects');
    const hasData = tasksData && projectsData && 
                   JSON.parse(tasksData).length > 0 && 
                   JSON.parse(projectsData).length > 0;
    
    if (!hasData) {
      console.log("No existing data found, loading preloaded data");
      loadPreloadedData();
    } else {
      console.log("Existing data found in localStorage");
    }
  }, []);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  // State management for tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  
  // Save tasks to localStorage when they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  // State for parent task selection
  const [newParent, setNewParent] = useState<string>('');
  
  // State for showing modals
  const [showWizard, setShowWizard] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  
  // Example initial categories
  const [categories, setCategories] = useState<Category[]>(() => {
    const savedCategories = localStorage.getItem('categories');
    return savedCategories ? JSON.parse(savedCategories) : [
      { id: '1', name: 'Work', color: '#F59E0B' },
      { id: '2', name: 'Personal', color: '#10B981' },
      { id: '3', name: 'NICU', color: '#3B82F6' },
    ];
  });

  // Save categories to localStorage when they change
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);
  
  // Projects state
  const [projects, setProjects] = useState<Project[]>(() => {
    const savedProjects = localStorage.getItem('projects');
    return savedProjects ? JSON.parse(savedProjects) : [];
  });

  // Save projects to localStorage when they change
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);
  
  // Add new task
  const addTask = (
    title: string,
    dueDate: string | null,
    parentId?: string,
    categoryIds?: string[],
    projectId?: string | null
  ) => {
    const id = Date.now().toString();
    const newTask: Task = {
      id,
      title,
      dueDate,
      status: 'pending',
      parentId,
      categories: categoryIds || [],
      projectId: projectId || null,
    };
    setTasks(prev => [...prev, newTask]);
  };
  
  // Add new subtask
  const addSubtask = (parentId: string, title: string) => {
    setTasks(prev => {
      const parentTask = prev.find(t => t.id === parentId);
      if (!parentTask) return prev;
  
      const newSubtask: Task = {
        id: Date.now().toString(),
        title,
        status: 'pending',
        parentId,
        dueDate: null,
        projectId: parentTask.projectId,
        categories: parentTask.categories,
      };
  
      return [...prev, newSubtask];
    });
  };  

  // Toggle task completion status
  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? { ...task, status: task.status === 'pending' ? 'completed' : 'pending' }
          : task
      )
    );
  };
  
  // Delete a task
  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id && task.parentId !== id));
  };
  
  // Update a task
  const updateTask = (
    id: string,
    title: string,
    dueDate: string | null,
    categoryIds?: string[],
    projectId?: string | null
  ) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
              ...task,
              title,
              dueDate,
              categories: categoryIds || task.categories,
              projectId: projectId !== undefined ? projectId : task.projectId,
            }
          : task
      )
    );
  };
  
  // Add a new project
  const addProject = (project: Omit<Project, 'id'>) => {
    const id = Date.now().toString();
    const newProject: Project = { id, ...project };
    setProjects(prev => [...prev, newProject]);
  };

  // Update a project
  const updateProject = (id: string, project: Omit<Project, 'id'>) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, ...project }
          : p
      )
    );
  };

  // Delete a project
  const deleteProject = (id: string) => {
    // Update tasks that were associated with this project
    setTasks(prev =>
      prev.map(task =>
        task.projectId === id
          ? { ...task, projectId: null }
          : task
      )
    );
    
    // Remove the project
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  // Add a new category
  const addCategory = (category: Omit<Category, 'id'>) => {
    const id = Date.now().toString();
    const newCategory: Category = { id, ...category };
    setCategories(prev => [...prev, newCategory]);
  };

  // Update a category
  const updateCategory = (id: string, category: Omit<Category, 'id'>) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === id
          ? { ...cat, ...category }
          : cat
      )
    );
  };

  // Delete a category
  const deleteCategory = (id: string) => {
    // Remove the category from all tasks
    setTasks(prev =>
      prev.map(task => ({
        ...task,
        categories: task.categories ? task.categories.filter(catId => catId !== id) : []
      }))
    );
    
    // Remove the category itself
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };
  
  // Filter tasks by due date for different sections
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
  
  const overdueTasks = tasks.filter(
    task => task.dueDate && task.dueDate < today && task.status !== 'completed'
  );
  
  const todayTasks = tasks.filter(
    task => task.dueDate && task.dueDate >= today && task.dueDate < tomorrow && task.status !== 'completed'
  );
  
  
  const completedTasks = tasks.filter(
    task => task.status === 'completed'
  );
  
  // Parent task options for the capture bar
  const parentOptions = tasks.filter(task => !task.parentId).map(task => ({
    id: task.id,
    title: task.title,
  }));
  
  // General tasks for context wizard
  const generalTasks = [
    'Review your priorities',
    'Plan your week',
    'Clear your inbox',
    'Take a break'
  ];

  return (
    <div className="app-container full-width">
      {/* Top Navigation */}
      <header className="top-nav">
        <h1 className="app-title">Task Manager</h1>
        <nav className="main-nav">
          <button 
            className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`nav-button ${activeTab === 'all-tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('all-tasks')}
          >
            All Tasks
          </button>
          <button 
            className={`nav-button ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            Projects
          </button>
          <button 
            className={`nav-button ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
        </nav>
        <div className="top-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => setShowWizard(true)}
          >
            What now?
          </button>
          <button 
            className="btn btn-outline" 
            onClick={() => activeTab === 'projects' ? setShowProjectManager(true) : setShowCategoryManager(true)}
          >
            Manage {activeTab === 'projects' ? 'Projects' : 'Categories'}
          </button>
          <button 
            className="btn btn-sm btn-outline" 
            onClick={() => {
            if (confirm("Reset all data to initial sample data?")) {
              loadPreloadedData();
              window.location.reload();
            }
          }}
        >
          Reset Data
        </button>
        </div>
      </header>
      
      <main className="main-content full-width">
        {/* Capture Bar */}
        <div className="capture-container">
          <form className="capture-form" onSubmit={(e) => {
            e.preventDefault();
            const titleInput = e.currentTarget.querySelector('input[type="text"]') as HTMLInputElement;
            const dateInput = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement;
            const timeInput = e.currentTarget.querySelector('input[type="time"]') as HTMLInputElement;
            
            if (titleInput && titleInput.value.trim()) {
              const title = titleInput.value.trim();
              const dueDate = dateInput && dateInput.value 
                ? `${dateInput.value}T${timeInput?.value || '00:00:00'}` 
                : null;
              
                addTask(title, dueDate, newParent);
              titleInput.value = '';
              if (dateInput) dateInput.value = '';
              if (timeInput) timeInput.value = '';
            }
          }}>
            <input 
              type="text" 
              className="form-control capture-input" 
              placeholder="Quick capture a new task..."
            />
            <div className="date-time-inputs">
              <input 
                type="date" 
                className="form-control date-input"
              />
              <input 
                type="time" 
                className="form-control time-input"
              />
            </div>
            <select 
              className="form-control"
              value={newParent}
              onChange={(e) => setNewParent(e.target.value)}
            >
              <option value="">No Parent Task</option>
              {parentOptions.map(o => (
                <option key={o.id} value={o.id}>
                  {o.title}  
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary">Add</button>
          </form>
        </div>
        
        {/* Main Content Area */}
        <div className="content-area">
          {activeTab === 'dashboard' && (
            <div className="dashboard-view">
              {/* Projects Section */}
              <div className="section-card">
                <h2 className="section-title">Projects</h2>
                <div className="projects-grid dashboard-grid">
                  {projects.map(project => {
                    const projectTasks = tasks.filter(t => 
                      t.projectId === project.id && 
                      t.status !== 'completed'
                    );
                    
                    if (projectTasks.length === 0) return null;
                    
                    return (
                      <div key={project.id} className="project-card mini-card">
                        <div className="project-header">
                          <h3 className="project-title">{project.name}</h3>
                          <span className="task-count">{projectTasks.length}</span>
                        </div>
                        
                        <div className="project-task-list">
                          {projectTasks.slice(0, 3).map(task => (
                            <div key={task.id} className="mini-task-item">
                              <input 
                                type="checkbox" 
                                checked={false} 
                                onChange={() => toggleTask(task.id)}
                              />
                              <span className="mini-task-title">{task.title}</span>
                            </div>
                          ))}
                          {projectTasks.length > 3 && (
                            <div className="more-tasks">
                              +{projectTasks.length - 3} more tasks
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Unassigned Tasks Card */}
                  {tasks.filter(t => !t.projectId && t.status !== 'completed').length > 0 && (
                    <div className="project-card mini-card no-project-card">
                      <div className="project-header">
                        <h3 className="project-title">Unassigned Tasks</h3>
                        <span className="task-count">
                          {tasks.filter(t => !t.projectId && t.status !== 'completed').length}
                        </span>
                      </div>
                      
                      <div className="project-task-list">
                        {tasks
                          .filter(t => !t.projectId && t.status !== 'completed')
                          .slice(0, 3)
                          .map(task => (
                            <div key={task.id} className="mini-task-item">
                              <input 
                                type="checkbox" 
                                checked={false} 
                                onChange={() => toggleTask(task.id)}
                              />
                              <span className="mini-task-title">{task.title}</span>
                            </div>
                          ))}
                        {tasks.filter(t => !t.projectId && t.status !== 'completed').length > 3 && (
                          <div className="more-tasks">
                            +{tasks.filter(t => !t.projectId && t.status !== 'completed').length - 3} more tasks
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Recent Activity Section */}
              <div className="section-card">
                <h2 className="section-title">Recent Activity</h2>
                <div className="recent-tasks">
                  {tasks
                    .filter(t => t.status !== 'completed')
                    .sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0)) // Sort by most recent (assuming ID is timestamp-based)
                    .slice(0, 5)
                    .map(task => (
                      <div key={task.id} className="recent-task-item">
                        <input 
                          type="checkbox" 
                          checked={false} 
                          onChange={() => toggleTask(task.id)}
                        />
                        <span className="recent-task-title">{task.title}</span>
                        {task.projectId && (
                          <span className="task-project tag">
                            {projects.find(p => p.id === task.projectId)?.name}
                          </span>
                        )}
                      </div>
                    ))
                  }
                </div>
              </div>
              
              {/* Due Soon Section (for tasks with due dates) */}
              {todayTasks.length > 0 || overdueTasks.length > 0 ? (
                <div className="section-card">
                  <h2 className="section-title">Due Soon</h2>
                  {overdueTasks.length > 0 && (
                    <div className="overdue-section">
                      <h3 className="subsection-title">Overdue</h3>
                      <TaskList 
                        tasks={overdueTasks} 
                        toggleTask={toggleTask} 
                        deleteTask={deleteTask} 
                        updateTask={updateTask}
                        addSubtask={addSubtask}
                        categories={categories}
                        projects={projects}
                      />
                    </div>
                  )}
                  
                  {todayTasks.length > 0 && (
                    <div className="today-section">
                      <h3 className="subsection-title">Today</h3>
                      <TaskList 
                        tasks={todayTasks} 
                        toggleTask={toggleTask} 
                        deleteTask={deleteTask} 
                        updateTask={updateTask}
                        addSubtask={addSubtask}
                        categories={categories}
                        projects={projects}
                      />
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
          
          {activeTab === 'all-tasks' && (
            <div className="all-tasks-view">
              <div className="section-card">
                <h2 className="section-title">All Tasks</h2>
                {tasks.filter(task => task.status !== 'completed').length > 0 ? (
                  <TaskList 
                    tasks={tasks.filter(task => task.status !== 'completed')} 
                    toggleTask={toggleTask} 
                    deleteTask={deleteTask} 
                    updateTask={updateTask}
                    addSubtask={addSubtask}
                    categories={categories}
                    projects={projects}
                  />
                ) : (
                  <p className="empty-message">No tasks yet. Create one above.</p>
                )}
              </div>
              
              {completedTasks.length > 0 && (
                <div className="section-card">
                  <h2 className="section-title">Completed</h2>
                  <TaskList 
                    tasks={completedTasks} 
                    toggleTask={toggleTask} 
                    deleteTask={deleteTask} 
                    updateTask={updateTask}
                    addSubtask={addSubtask}
                    categories={categories}
                    projects={projects}
                  />
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'projects' && (
            <div className="projects-view">
              <div className="projects-grid">
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <div key={project.id} className="project-card">
                      <div className="project-header">
                        <h2 className="project-title">{project.name}</h2>
                        <div className="project-actions">
                          <button 
                            className="btn btn-sm btn-outline"
                            onClick={() => {
                              // Open project edit modal
                              setShowProjectManager(true);
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                      
                      {project.description && (
                        <p className="project-description">{project.description}</p>
                      )}
                      
                      <div className="project-task-section">
                        <h3 className="task-section-title">Tasks</h3>
                        {tasks.filter(t => t.projectId === project.id && t.status !== 'completed').length > 0 ? (
                          <TaskList 
                            tasks={tasks.filter(t => t.projectId === project.id && t.status !== 'completed')} 
                            toggleTask={toggleTask} 
                            deleteTask={deleteTask} 
                            updateTask={updateTask}
                            addSubtask={addSubtask}
                            categories={categories}
                            projects={projects}
                          />
                        ) : (
                          <p className="empty-message">No active tasks in this project</p>
                        )}
                      </div>
                      
                      {tasks.filter(t => t.projectId === project.id && t.status === 'completed').length > 0 && (
                        <div className="project-task-section">
                          <h3 className="task-section-title">Completed</h3>
                          <TaskList 
                            tasks={tasks.filter(t => t.projectId === project.id && t.status === 'completed')} 
                            toggleTask={toggleTask} 
                            deleteTask={deleteTask} 
                            updateTask={updateTask}
                            addSubtask={addSubtask}
                            categories={categories}
                            projects={projects}
                          />
                        </div>
                      )}
                      
                      <div className="project-quick-add">
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const input = e.currentTarget.querySelector('input') as HTMLInputElement;
                          if (input && input.value.trim()) {
                            addTask(input.value.trim(), null, undefined, [], project.id);
                            input.value = '';
                          }
                        }}>
                          <input 
                            type="text" 
                            className="form-control"
                            placeholder={`Add task to ${project.name}...`}
                          />
                          <button type="submit" className="btn btn-sm btn-primary">Add</button>
                        </form>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-projects">
                    <p>No projects yet. Create your first project to organize related tasks.</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowProjectManager(true)}
                    >
                      Create Project
                    </button>
                  </div>
                )}
                
                {/* No Project Tasks Section */}
                {tasks.filter(t => !t.projectId).length > 0 && (
                  <div className="project-card no-project-card">
                    <div className="project-header">
                      <h2 className="project-title">Unassigned Tasks</h2>
                    </div>
                    
                    <div className="project-task-section">
                      <h3 className="task-section-title">Tasks</h3>
                      {tasks.filter(t => !t.projectId && t.status !== 'completed').length > 0 ? (
                        <TaskList 
                          tasks={tasks.filter(t => !t.projectId && t.status !== 'completed')} 
                          toggleTask={toggleTask} 
                          deleteTask={deleteTask} 
                          updateTask={updateTask}
                          addSubtask={addSubtask}
                          categories={categories}
                          projects={projects}
                        />
                      ) : (
                        <p className="empty-message">No unassigned tasks</p>
                      )}
                    </div>
                    
                    {tasks.filter(t => !t.projectId && t.status === 'completed').length > 0 && (
                      <div className="project-task-section">
                        <h3 className="task-section-title">Completed</h3>
                        <TaskList 
                          tasks={tasks.filter(t => !t.projectId && t.status === 'completed')} 
                          toggleTask={toggleTask} 
                          deleteTask={deleteTask} 
                          updateTask={updateTask}
                          addSubtask={addSubtask}
                          categories={categories}
                          projects={projects}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'categories' && (
            <div className="categories-view">
              <div className="categories-grid">
                {categories.map(category => (
                  <div 
                    key={category.id} 
                    className="category-card"
                    style={{ borderLeft: `5px solid ${category.color}` }}
                  >
                    <div className="category-header">
                      <h2 className="category-title">
                        <span 
                          className="color-dot" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </h2>
                      <div className="category-actions">
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => setShowCategoryManager(true)}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                    
                    <div className="category-task-section">
                      <h3 className="task-section-title">Tasks</h3>
                      {tasks.filter(t => t.categories?.includes(category.id) && t.status !== 'completed').length > 0 ? (
                        <TaskList 
                          tasks={tasks.filter(t => t.categories?.includes(category.id) && t.status !== 'completed')} 
                          toggleTask={toggleTask} 
                          deleteTask={deleteTask} 
                          updateTask={updateTask}
                          addSubtask={addSubtask}
                          categories={categories}
                          projects={projects}
                        />
                      ) : (
                        <p className="empty-message">No active tasks in this category</p>
                      )}
                    </div>
                    
                    {tasks.filter(t => t.categories?.includes(category.id) && t.status === 'completed').length > 0 && (
                      <div className="category-task-section">
                        <h3 className="task-section-title">Completed</h3>
                        <TaskList 
                          tasks={tasks.filter(t => t.categories?.includes(category.id) && t.status === 'completed')} 
                          toggleTask={toggleTask} 
                          deleteTask={deleteTask} 
                          updateTask={updateTask}
                          addSubtask={addSubtask}
                          categories={categories}
                          projects={projects}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Context Wizard Modal */}
      {showWizard && (
        <ContextWizard
          tasks={tasks}
          onClose={() => setShowWizard(false)}
          generalTasks={generalTasks}
        />
      )}

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <CategoryManager
          categories={categories}
          addCategory={addCategory}
          updateCategory={updateCategory}
          deleteCategory={deleteCategory}
          onClose={() => setShowCategoryManager(false)}
        />
      )}

      {/* Project Manager Modal */}
      {showProjectManager && (
        <ProjectManager
          projects={projects}
          addProject={addProject}
          updateProject={updateProject}
          deleteProject={deleteProject}
          onClose={() => setShowProjectManager(false)}
        />
      )}
    </div>
  );
}

export default App;