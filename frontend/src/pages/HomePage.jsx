import {
    ArrowRight,
    Search,
    Code2,
    Palette,
    PenTool,
    Megaphone,
    Video,
    BarChart3,
    ShieldCheck,
    Users,
    BriefcaseBusiness,
    Sparkles,
    CheckCircle2,
    Globe,
  } from "lucide-react";
  
  import "./HomePage.css";
  
  const categories = [
    {
      icon: Code2,
      title: "Development & IT",
      description: "Websites, mobile apps, and software solutions.",
    },
    {
      icon: Palette,
      title: "Design & Creative",
      description: "UI/UX design, graphics, and visual branding.",
    },
    {
      icon: PenTool,
      title: "Writing & Translation",
      description: "Articles, content writing, and translations.",
    },
    {
      icon: Megaphone,
      title: "Digital Marketing",
      description: "Social media, SEO, and online growth.",
    },
    {
      icon: Video,
      title: "Video & Animation",
      description: "Video editing, motion graphics, and animation.",
    },
    {
      icon: BarChart3,
      title: "Business & Consulting",
      description: "Business support, research, and data analysis.",
    },
  ];
  
  function HomePage({ onRegisterClick, onLoginClick }) {
    const handleRegisterClick = (event) => {
      event.preventDefault();
      onRegisterClick?.();
    };
  
    const handleLoginClick = (event) => {
      event.preventDefault();
      onLoginClick?.();
    };
  
    return (
      <>
        {/* Hero section */}
        <section className="hero" id="home">
          <div className="container hero-container">
            <div className="hero-content">
              <div className="hero-badge">
                <Sparkles size={16} />
                <span>Made for Ethiopian talent</span>
              </div>
  
              <h1>
                Your skills.
                <br />
                Your future.
                <br />
                <span className="hero-highlight">
                  Your opportunity.
                </span>
              </h1>
  
              <p className="hero-description">
                EthioLance connects Ethiopian freelancers with clients
                who value their skills. Discover opportunities, work
                together, and grow your career in one place.
              </p>
  
              <div className="hero-actions">
                <a
                  href="#find-work"
                  className="button button-primary"
                >
                  Find work <ArrowRight size={18} />
                </a>
  
                <a
                  href="#hire-talent"
                  className="button button-secondary"
                >
                  Hire talent
                </a>
              </div>
  
              <div className="hero-trust">
                <ShieldCheck size={19} />
                <span>
                  A smarter way to work, connect, and grow.
                </span>
              </div>
            </div>
  
            <div className="hero-visual">
              <div className="hero-card hero-card-main">
                <div className="hero-card-top">
                  <span className="hero-card-label">
                    Your next opportunity
                  </span>
                  <BriefcaseBusiness size={22} />
                </div>
  
                <h3>Build something great.</h3>
  
                <p>
                  Connect your skills with projects that matter.
                </p>
  
                <div className="hero-card-tags">
                  <span>Web Development</span>
                  <span>UI/UX Design</span>
                  <span>Content</span>
                </div>
  
                <div className="hero-card-bottom">
                  <div className="hero-card-avatar">
                    <Users size={21} />
                  </div>
  
                  <div>
                    <strong>Skills meet opportunity</strong>
                    <p>Start your journey with EthioLance</p>
                  </div>
  
                  <CheckCircle2 size={22} />
                </div>
              </div>
  
              <div className="floating-card floating-card-top">
                <Sparkles size={18} />
                <span>Discover your potential</span>
              </div>
  
              <div className="floating-card floating-card-bottom">
                <Globe size={18} />
                <span>Connecting Ethiopian talent</span>
              </div>
            </div>
          </div>
        </section>
  
        {/* Categories section */}
        <section
          className="section categories-section"
          id="categories"
        >
          <div className="container">
            <div className="section-heading">
              <span className="section-eyebrow">
                Explore opportunities
              </span>
  
              <h2>Find work that matches your skills</h2>
  
              <p>
                Explore different fields and discover where your
                talents can take you.
              </p>
            </div>
  
            <div className="categories-grid">
              {categories.map((category) => {
                const Icon = category.icon;
  
                return (
                  <a
                    href="#find-work"
                    className="category-card"
                    key={category.title}
                  >
        <div className="category-icon !bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 !text-amber-950 shadow-lg shadow-amber-500/30">
  <Icon
    size={30}
    strokeWidth={2.5}
    className="drop-shadow-md"
  />
</div>
                    <h3>{category.title}</h3>
  
                    <p>{category.description}</p>
  
                    <span className="category-link">
                      Explore category
                      <ArrowRight size={17} />
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
  
        {/* Freelancer and client sections */}
        <section className="section roles-section" id="find-work">
          <div className="container roles-grid">
            <div className="role-card role-card-freelancer">
              <div className="role-icon">
                <Code2 size={27} />
              </div>
  
              <span className="section-eyebrow">
                For freelancers
              </span>
  
              <h2>Turn your skills into opportunities.</h2>
  
              <p>
                Build your professional profile, showcase your
                portfolio, discover projects, and connect with clients
                looking for your expertise.
              </p>
  
              <ul className="role-features">
                <li>
                  <CheckCircle2 size={18} />
                  Discover relevant job opportunities
                </li>
  
                <li>
                  <CheckCircle2 size={18} />
                  Submit proposals to clients
                </li>
  
                <li>
                  <CheckCircle2 size={18} />
                  Manage projects and milestones
                </li>
              </ul>
  
              <a
                href="/register"
                className="button button-primary"
                onClick={handleRegisterClick}
              >
                Start freelancing <ArrowRight size={18} />
              </a>
            </div>
  
            {/* Client section */}
            <div className="role-card role-card-client" id="hire-talent">
              <div className="role-icon">
                <BriefcaseBusiness size={27} />
              </div>
  
              <span className="section-eyebrow">
                For clients
              </span>
  
              <h2>Find the right talent for your project.</h2>
  
              <p>
                Bring your ideas to life by discovering skilled
                Ethiopian professionals who can help your business
                move forward.
              </p>
  
              <ul className="role-features">
                <li>
                  <CheckCircle2 size={18} />
                  Post jobs with clear requirements
                </li>
  
                <li>
                  <CheckCircle2 size={18} />
                  Review proposals and freelancer profiles
                </li>
  
                <li>
                  <CheckCircle2 size={18} />
                  Manage contracts and project milestones
                </li>
              </ul>
  
              <a
                href="/register"
                className="button button-secondary"
                onClick={handleRegisterClick}
              >
                Find talent <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </section>
  
        {/* How it works */}
        <section
          className="section how-section"
          id="how-it-works"
        >
          <div className="container">
            <div className="section-heading">
              <span className="section-eyebrow">
                Simple and straightforward
              </span>
  
              <h2>How EthioLance works</h2>
  
              <p>Get started with a few simple steps.</p>
            </div>
  
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">01</div>
                <div className="step-icon">
                  <Users size={25} />
                </div>
  
                <h3>Create your account</h3>
  
                <p>
                  Register as a freelancer or a client and set up
                  your account.
                </p>
              </div>
  
              <div className="step-card">
                <div className="step-number">02</div>
                <div className="step-icon">
                  <Search size={25} />
                </div>
  
                <h3>Explore opportunities</h3>
  
                <p>
                  Find projects that match your skills or discover
                  professionals for your needs.
                </p>
              </div>
  
              <div className="step-card">
                <div className="step-number">03</div>
                <div className="step-icon">
                  <BriefcaseBusiness size={25} />
                </div>
  
                <h3>Work together</h3>
  
                <p>
                  Manage proposals, contracts, milestones, and
                  payments in one place.
                </p>
              </div>
            </div>
          </div>
        </section>
  
        {/* Call to action */}
        <section className="cta-section">
          <div className="container cta-container">
            <div>
              <span className="section-eyebrow">
                Your next chapter starts here
              </span>
  
              <h2>
                Great things happen when skills meet opportunity.
              </h2>
  
              <p>
                Join a growing community connecting Ethiopian talent
                with meaningful work.
              </p>
            </div>
  
            <a
              href="/register"
              className="button button-primary"
              onClick={handleRegisterClick}
            >
              Join EthioLance <ArrowRight size={18} />
            </a>
          </div>
        </section>
  
        {/* Footer */}
        <footer className="footer">
          <div className="container footer-container">
            <a className="brand footer-brand" href="#home">
              <span className="brand-mark">e</span>
  
              <span>
                ethio<span className="brand-accent">lance</span>
              </span>
            </a>
  
            <p>
              Connecting Ethiopian talent with opportunity.
            </p>
  
            <div className="footer-links">
              <a href="#categories">Explore skills</a>
              <a href="#how-it-works">How it works</a>
  
              <a href="/login" onClick={handleLoginClick}>
                Log in
              </a>
  
              <a href="/register" onClick={handleRegisterClick}>
                Sign up
              </a>
            </div>
  
            <p className="footer-copyright">
              © {new Date().getFullYear()} EthioLance. All rights reserved.
            </p>
          </div>
        </footer>
      </>
    );
  }
  
  export default HomePage;