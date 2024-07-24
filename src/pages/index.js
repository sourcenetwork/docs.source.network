import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import styles from './index.module.css';
import ThemedImage from '@theme/ThemedImage';

function HomepageHeader() {
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className="hero__title">Source Network Stack</h1>
            <p className="hero__subtitle">Welcome to the source of our developer documentation.</p>
          </div>
          <div className={styles.heroImageContainer}>
            <ThemedImage
              sources={{
                light: '/img/hero_grid_black_1.png',
                dark: '/img/hero_grid_white_1.png',
              }}
              alt="Hero"
              className={styles.heroImage}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          <div className={clsx('col col--4')}>
            <Link to="/defradb">
              <div className={styles.card}>
                <h3>DefraDB</h3>
                <p>Deploy decentralized databases</p>
              </div>
            </Link>
          </div>
          <div className={clsx('col col--4')}>
            <Link to="/sourcehub">
              <div className={styles.card}>
                <h3>SourceHub</h3>
                <p>Build trust & interopability</p>
              </div>
            </Link>
          </div>
          <div className={clsx('col col--4')}>
            <Link to="/orbis">
              <div className={styles.card}>
                <h3>Orbis</h3>
                <p>Distributed secrets management</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout
      title="Home"
      description="Source Network Developer Documentation">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
