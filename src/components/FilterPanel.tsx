import { Category, Project } from '../types';

type FilterPanelProps = {
  categories: Category[];
  projects: Project[];
  activeCategories: string[];
  activeProject: string | null;
  toggleCategoryFilter: (categoryId: string) => void;
  setProjectFilter: (projectId: string | null) => void;
  clearFilters: () => void;
};

export default function FilterPanel({
  categories,
  projects,
  activeCategories,
  activeProject,
  toggleCategoryFilter,
  setProjectFilter,
  clearFilters,
}: FilterPanelProps) {
  const hasActiveFilters = activeCategories.length > 0 || activeProject !== null;
  
  return (
    <div className="filter-panel">
      <h3 className="filter-header">Filter Tasks</h3>
      
      <div className="filter-section">
        <h4>By Category</h4>
        <div className="category-filters">
          {categories.map(category => (
            <div 
              key={category.id}
              className={`category-filter ${activeCategories.includes(category.id) ? 'active' : ''}`}
              onClick={() => toggleCategoryFilter(category.id)}
            >
              <span 
                className="color-dot" 
                style={{ backgroundColor: category.color }}
              />
              <span>{category.name}</span>
            </div>
          ))}
          {categories.length === 0 && <p className="no-filters">No categories available</p>}
        </div>
      </div>
      
      <div className="filter-section">
        <h4>By Project</h4>
        <div className="project-filters">
          <div 
            className={`project-filter ${activeProject === null ? 'active' : ''}`}
            onClick={() => setProjectFilter(null)}
          >
            All Projects
          </div>
          <div 
            className={`project-filter ${activeProject === 'none' ? 'active' : ''}`}
            onClick={() => setProjectFilter('none')}
          >
            No Project
          </div>
          {projects.map(project => (
            <div 
              key={project.id}
              className={`project-filter ${activeProject === project.id ? 'active' : ''}`}
              onClick={() => setProjectFilter(project.id)}
            >
              {project.name}
            </div>
          ))}
        </div>
      </div>
      
      {hasActiveFilters && (
        <button 
          className="clear-filters-btn"
          onClick={clearFilters}
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}