import React from 'react';

const ProjectCard = ({ project }) => {
  return (
    <div className="project-card">
      <div className="flex flex-col gap-md">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{project.name}</h3>
          <span className="text-sm text-light">{project.status}</span>
        </div>
        
        <p className="text-sm text-light mb-md">{project.description}</p>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-sm">
            <span className="text-sm text-light">{project.tasks?.length || 0} tasks</span>
            <span className="text-sm text-light">•</span>
            <span className="text-sm text-light">{project.dueDate}</span>
          </div>
          
          <button className="btn btn-primary">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard; 