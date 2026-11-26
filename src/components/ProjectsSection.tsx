import { selectedWork, universityWork } from "@/data/portfolio";

export function ProjectsSection() {
  return (
    <section
      id="projects"
      data-chapter="02"
      aria-labelledby="projects-title"
      className="pq-chapter pq-browse-section"
    >
      <header className="pq-browse-heading" data-motion="section">
        <span className="pq-kicker" aria-hidden="true">
          02
        </span>
        <h2 id="projects-title">Projects</h2>
      </header>
      <div className="pq-work-grid">
        {selectedWork.map((project) => (
          <article
            id={`project-${project.id}`}
            key={project.id}
            data-project-record={project.id}
            data-motion="record"
            aria-labelledby={`project-${project.id}-title`}
            className="pq-work-entry"
          >
            <div className="pq-work-preview">
              {/* These local covers are already sized and compressed for the static export. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.preview.src}
                alt={project.preview.alt}
                width={project.preview.width}
                height={project.preview.height}
                loading="lazy"
                decoding="async"
              />
            </div>
            <h3 id={`project-${project.id}-title`}>{project.title}</h3>
            <p>{project.caption}</p>
            <a
              className="pq-work-link"
              href={project.href}
              aria-label={`${project.action}: ${project.title}`}
            >
              {project.action} <span aria-hidden="true">↗</span>
            </a>
          </article>
        ))}
      </div>
      <div className="pq-university-work" aria-labelledby="university-work-title">
        <h3 id="university-work-title">University work</h3>
        <ul>
          {universityWork.map((project) => (
            <li key={project.id} id={`project-${project.id}`}>
              <a className="pq-work-link" href={project.href} id={`project-${project.id}-title`}>
                {project.title} <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
