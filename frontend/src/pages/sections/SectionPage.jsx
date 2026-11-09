function SectionPage({ title, description }) {
  return (
    <section className="freelancer-section-page">
      <div className="freelancer-panel">
        <div className="freelancer-panel-heading">
          <div className="freelancer-panel-title">
            <h2>{title}</h2>
          </div>
        </div>

        <p>{description}</p>
      </div>
    </section>
  );
}

export default SectionPage;