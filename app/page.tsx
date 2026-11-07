import {
  affiliations,
  awards,
  coursework,
  education,
  music,
  presentations,
  professional,
  research,
  skills,
  teaching,
  type Role,
} from "@/lib/experience";

function Roles({ roles }: { roles: Role[] }) {
  return (
    <div className="card">
      {roles.map((role) => (
        <article className="role" key={`${role.title}-${role.detail ?? ""}-${role.dates}`}>
          <div className="role-head">
            <h3>{role.title}</h3>
            <p className="role-dates">{role.dates}</p>
          </div>
          {role.detail ? <p className="role-detail">{role.detail}</p> : null}
          {role.points ? (
            <ul>
              {role.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="wrapper">
      <p className="eyebrow">Portfolio</p>
      <h1 className="page-title">Susanna Ziesmer</h1>
      <p className="study-meta">Collegedale, Tennessee</p>
      <nav className="site-nav" aria-label="Page">
        <a href="#studies">Studies</a>
        <a href="#experience">Experience</a>
      </nav>

      <section>
        <h2 className="section-label">About</h2>
        <div className="card">
          <p>
            Susanna Ziesmer studies at Southern Adventist University in Collegedale, Tennessee,
            where she is completing a B.A. in Psychology and a B.S. in Music (expected May 2027).
            She spent Summer 2025 in a French language study abroad at Campus Adventiste du Salève
            in Collonges-sous-Salève, France.
          </p>
          <p>
            <a href="mailto:susannaziesmer@southern.edu">susannaziesmer@southern.edu</a>
          </p>
        </div>
      </section>

      <section id="studies">
        <h2 className="section-label">Studies</h2>
        <a className="study-card" href="/studies/musical-training/">
          <h3>The Influence of Musical Training on Preferences for Historical Musical Styles</h3>
          <p>
            A research study examining how musical background may relate to preferences for
            different historical eras of the classical music genre. It is an instructor-approved
            IRB protocol under Research Design & Statistics II at Southern Adventist University.
            Participants answer demographic questions, then listen to 18 short musical excerpts and
            rate familiarity and liking.
          </p>
          <span className="study-card-action">Open the study</span>
        </a>
        <a className="study-card" href="/studies/ai-decision-making/">
          <h3>Effect of Repeated AI Usage on Decision Making Speed</h3>
          <p>
            This research study will examine how using AI repeatedly may impact decision making
            speed and confidence. It is part of Cognitive Psychology (PSYC-227) in the School of
            Education and Psychology at Southern Adventist University.
          </p>
          <span className="study-card-action">Open the questionnaire</span>
        </a>
      </section>

      <section id="experience">
        <h2 className="section-label">Education</h2>
        <Roles roles={education} />

        <h2 className="section-label">Experience</h2>
        <h3 className="section-label">Research</h3>
        <Roles roles={research} />
        <h3 className="section-label">Teaching</h3>
        <Roles roles={teaching} />
        <h3 className="section-label">Professional</h3>
        <Roles roles={professional} />

        <h2 className="section-label">Presentations & guest lectures</h2>
        <div className="card">
          {presentations.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>

        <h2 className="section-label">Music & creative projects</h2>
        <Roles roles={music} />

        <h2 className="section-label">Awards & scholarships</h2>
        <Roles roles={awards} />

        <h2 className="section-label">Skills & proficiencies</h2>
        <div className="card">
          <ul className="plain-list">
            {skills.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <h2 className="section-label">Relevant coursework</h2>
        <div className="card">
          <ul className="plain-list">
            {coursework.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <h2 className="section-label">Professional affiliations</h2>
        <Roles roles={affiliations} />
      </section>
    </div>
  );
}
