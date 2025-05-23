import React from 'react';
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

const FilterPanel = ({ filters, onFilterChange }) => {
  return (
    <div className="card">
      <div className="flex flex-col gap-md">
        <h3>Filters</h3>
        
        <div className="flex flex-col gap-sm">
          <label className="text-sm">Status</label>
          <select
            className="form-control"
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="flex flex-col gap-sm">
          <label className="text-sm">Priority</label>
          <select
            className="form-control"
            value={filters.priority}
            onChange={(e) => onFilterChange('priority', e.target.value)}
          >
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="flex flex-col gap-sm">
          <label className="text-sm">Category</label>
          <select
            className="form-control"
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
          >
            <option value="all">All Categories</option>
            {filters.categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;