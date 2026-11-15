export function AdminStatsShimmer() {
  return (
    <div className="stats-grid" data-testid="admin-stats-shimmer">
      {[1, 2, 3].map((i) => (
        <div className="stat-box shimmer-stat-box" key={i}>
          <div className="stat-icon admin-shimmer" style={{ width: '3.2rem', height: '3.2rem' }}></div>
          <div className="stat-info" style={{ flex: 1 }}>
            <div className="admin-shimmer admin-shimmer-text" style={{ width: '60%', height: '0.75rem', marginBottom: '0.5rem' }}></div>
            <div className="admin-shimmer admin-shimmer-text" style={{ width: '40%', height: '1.5rem', marginBottom: 0 }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminProjectsShimmer({ count = 6 }) {
  return (
    <div className="admin-grid" data-testid="admin-projects-shimmer">
      {Array.from({ length: count }).map((_, i) => (
        <div className="admin-project-card shimmer-project-card" key={i}>
          <div className="admin-project-thumb">
            <div className="admin-shimmer" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}></div>
          </div>
          <div className="admin-project-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <div className="admin-shimmer admin-shimmer-text" style={{ width: '35%', height: '0.75rem' }}></div>
              <div className="admin-shimmer admin-shimmer-text" style={{ width: '25%', height: '0.75rem' }}></div>
            </div>
            <div className="admin-shimmer admin-shimmer-text" style={{ width: '75%', height: '1.15rem', marginBottom: '0.75rem' }}></div>
            <div className="admin-shimmer admin-shimmer-text" style={{ width: '100%', height: '0.8rem' }}></div>
            <div className="admin-shimmer admin-shimmer-text" style={{ width: '85%', height: '0.8rem' }}></div>
            <div className="admin-shimmer admin-shimmer-text" style={{ width: '60%', height: '0.8rem', marginBottom: '1rem' }}></div>
            
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
              <div className="admin-shimmer admin-shimmer-pill" style={{ width: '50px', height: '1.2rem', borderRadius: '1rem' }}></div>
              <div className="admin-shimmer admin-shimmer-pill" style={{ width: '60px', height: '1.2rem', borderRadius: '1rem' }}></div>
              <div className="admin-shimmer admin-shimmer-pill" style={{ width: '45px', height: '1.2rem', borderRadius: '1rem' }}></div>
            </div>

            <div className="admin-card-actions">
              <div className="admin-card-reorder">
                <div className="admin-shimmer" style={{ width: '32px', height: '28px', borderRadius: '1rem' }}></div>
                <div className="admin-shimmer" style={{ width: '32px', height: '28px', borderRadius: '1rem' }}></div>
              </div>
              <div className="admin-card-buttons">
                <div className="admin-shimmer" style={{ width: '60px', height: '28px', borderRadius: '1rem' }}></div>
                <div className="admin-shimmer" style={{ width: '32px', height: '28px', borderRadius: '1rem' }}></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminSkillsShimmer() {
  return (
    <div className="form-row" data-testid="admin-skills-shimmer">
      {[1, 2].map((col) => (
        <div className="card" style={{ marginBottom: 0 }} key={col}>
          <div className="admin-shimmer admin-shimmer-text" style={{ width: '50%', height: '1.1rem', marginBottom: '1.25rem' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3, 4].map((row) => (
              <div className="skill-item-row" key={row}>
                <div className="skill-item-info">
                  <div className="admin-shimmer" style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem' }}></div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="admin-shimmer admin-shimmer-text" style={{ width: '60%', height: '0.9rem', marginBottom: '0.3rem' }}></div>
                    <div className="admin-shimmer admin-shimmer-text" style={{ width: '30%', height: '0.7rem', marginBottom: 0 }}></div>
                  </div>
                </div>
                <div className="skill-item-actions">
                  <div className="admin-shimmer" style={{ width: '85px', height: '1.8rem', borderRadius: '1rem' }}></div>
                  <div className="admin-shimmer" style={{ width: '2rem', height: '2rem', borderRadius: '50%' }}></div>
                  <div className="admin-shimmer" style={{ width: '2rem', height: '2rem', borderRadius: '50%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminFormShimmer({ fields = 4 }) {
  return (
    <div data-testid="admin-form-shimmer" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="form-row">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <div className="admin-shimmer admin-shimmer-text" style={{ width: '30%', height: '0.85rem' }}></div>
          <div className="admin-shimmer" style={{ width: '100%', height: '2.6rem', borderRadius: 'var(--radius-md)' }}></div>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <div className="admin-shimmer admin-shimmer-text" style={{ width: '30%', height: '0.85rem' }}></div>
          <div className="admin-shimmer" style={{ width: '100%', height: '2.6rem', borderRadius: 'var(--radius-md)' }}></div>
        </div>
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <div className="admin-shimmer admin-shimmer-text" style={{ width: '25%', height: '0.85rem' }}></div>
        <div className="admin-shimmer" style={{ width: '100%', height: '5rem', borderRadius: 'var(--radius-md)' }}></div>
      </div>
      {fields > 3 && (
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div className="admin-shimmer admin-shimmer-text" style={{ width: '40%', height: '0.85rem' }}></div>
            <div className="admin-shimmer" style={{ width: '100%', height: '2.6rem', borderRadius: 'var(--radius-md)' }}></div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div className="admin-shimmer admin-shimmer-text" style={{ width: '40%', height: '0.85rem' }}></div>
            <div className="admin-shimmer" style={{ width: '100%', height: '2.6rem', borderRadius: 'var(--radius-md)' }}></div>
          </div>
        </div>
      )}
      <div className="admin-shimmer" style={{ width: '160px', height: '2.6rem', borderRadius: 'var(--radius-pill)', marginTop: '0.5rem' }}></div>
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="admin-app shimmer-dashboard-skeleton" data-testid="admin-dashboard-skeleton">
      {/* Sidebar Skeleton */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="admin-shimmer" style={{ width: '1.8rem', height: '1.8rem', borderRadius: '0.4rem' }}></div>
          <div className="admin-shimmer admin-shimmer-text" style={{ width: '90px', height: '1.1rem', marginBottom: 0 }}></div>
        </div>

        <ul className="sidebar-menu">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <li key={i} style={{ padding: '0.4rem 0' }}>
              <div
                className="admin-shimmer"
                style={{
                  width: '100%',
                  height: '2.4rem',
                  borderRadius: 'var(--radius-md)'
                }}
              ></div>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <div style={{ flex: 1 }}>
            <div className="admin-shimmer admin-shimmer-text" style={{ width: '60px', height: '0.65rem' }}></div>
            <div className="admin-shimmer admin-shimmer-text" style={{ width: '120px', height: '0.85rem', marginBottom: 0 }}></div>
          </div>
          <div className="admin-shimmer" style={{ width: '2.2rem', height: '2.2rem', borderRadius: '50%' }}></div>
        </div>
      </aside>

      {/* Main Workspace Skeleton */}
      <div className="admin-main">
        {/* Topbar Skeleton */}
        <header className="admin-header">
          <div className="header-left">
            <div className="admin-shimmer admin-shimmer-text" style={{ width: '180px', height: '1.25rem', marginBottom: 0 }}></div>
          </div>
          <div className="header-right">
            <div className="admin-shimmer" style={{ width: '110px', height: '2rem', borderRadius: 'var(--radius-pill)' }}></div>
            <div className="admin-shimmer" style={{ width: '2.4rem', height: '2.4rem', borderRadius: '50%' }}></div>
          </div>
        </header>

        {/* Content Skeleton */}
        <main className="admin-content">
          {/* Status Banner */}
          <div className="shimmer-verifying-banner">
            <div className="shimmer-pulse-dot"></div>
            <span>Verifying Admin Session &amp; synchronizing Firestore...</span>
          </div>

          <AdminStatsShimmer />

          <div className="card">
            <div className="card-header">
              <div>
                <div className="admin-shimmer admin-shimmer-text" style={{ width: '180px', height: '1.2rem' }}></div>
                <div className="admin-shimmer admin-shimmer-text" style={{ width: '280px', height: '0.8rem', marginBottom: 0 }}></div>
              </div>
              <div className="admin-shimmer" style={{ width: '140px', height: '2.4rem', borderRadius: 'var(--radius-pill)' }}></div>
            </div>
            <AdminProjectsShimmer count={3} />
          </div>
        </main>
      </div>
    </div>
  );
}
