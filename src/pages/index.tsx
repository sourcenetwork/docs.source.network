import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import React, { FC } from 'react';
import IconThemeArrow from '../theme/IconArrow';
import styles from './index.module.scss';

const HomepageHeader: FC<{}> = () => {
  return (
    <header className={clsx(styles.heroBanner)}>
      <div className="spacing-horz">
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>Source Network Developer Hub</h1>
            <p className={styles.heroSubTitle}>Your guide to building with the Source Network stack. <br />Get started, explore the docs, and discover the power of distributed data management.</p>
          </div>
          <div className={styles.heroImageContainer}>
          </div>
        </div>
      </div>
    </header>
  );
}

const HomepageFeatures: FC<{}> = () => {
  const features = [
    {
      link: "/defradb",
      image: "./img/icon-defradb.svg",
      title: "DefraDB",
      subTitle: "Deploy decentralized databases",
    },
    {
      link: "/sourcehub",
      image: "./img/icon-sourcehub.svg",
      title: "SourceHub",
      subTitle: "Build trust & interopability",
    },
    {
      link: "/orbis",
      image: "./img/icon-orbis.svg",
      title: "Orbis",
      subTitle: "Distributed secrets management",
    }
  ]

  return (
    <section className={styles.features}>
      <div className="spacing-horz">
        <div className={clsx("row")}>
          {features.map((feature, i) => {
            return <div key={i} className={clsx(`col col--${12 / features.length}`)}>
              <Link className={styles.card} to={feature.link}>
                <img src={feature.image} />
                <div>
                  <h3>{feature.title} <IconThemeArrow className={styles.arrow} dir='right' /></h3>
                  <p>{feature.subTitle}</p>
                </div>
              </Link>
            </div>
          })}
        </div>
      </div>
    </section>
  );
}

const HomepageReferenceLinks: FC<{}> = () => {
  return (
    <section className={clsx('block-section')}>
      <div className="spacing-horz">
        <h2>Quick Reference</h2>
        <p>A collection of guides and references to help you navigate the Source Network.</p>

        <div className={clsx("row")}>
          <div className={clsx("col col-4", styles.linkList)}>
            <Link to="/defradb/references/query-specification/query-language-overview">DefraDB Query Language Overview <IconThemeArrow className={styles.arrow} dir='right' /></Link>
            <Link to="/defradb/references/cli/defradb">DefraDB CLI Reference <IconThemeArrow className={styles.arrow} dir='right' /></Link>
            <Link to="/defradb/guides/peer-to-peer">DefraDB Peer-to-Peer Guide <IconThemeArrow className={styles.arrow} dir='right' /></Link>
            <Link to="/defradb/guides/schema-migration">DefraDB Schema Migration Guide <IconThemeArrow className={styles.arrow} dir='right' /></Link>
          </div>
          <div className={clsx("col col-4", styles.linkList)}>
            <Link to="sourcehub/getting-started/readme">SourceHub Getting Started <IconThemeArrow className={styles.arrow} dir='right' /></Link>
            <Link to="sourcehub/api">SourceHub API <IconThemeArrow className={styles.arrow} dir='right' /></Link>
            <Link to="/orbis/getting-started/install">Orbis Installation <IconThemeArrow className={styles.arrow} dir='right' /></Link>
            <Link to="/orbis/getting-started/policy">Orbis Setup Authorization Policy <IconThemeArrow className={styles.arrow} dir='right' /></Link>
          </div>
          <div className={clsx("col col-4", styles.linkList)}>
          </div>
        </div>
      </div>
    </section>
  );
}

const HomepageCommunity: FC<{}> = () => {
  const links = [
    {
      link: "https://discord.source.network/",
      title: "Discord",
      linkText: "Join our server"
    },
    {
      link: "https://github.com/sourcenetwork/docs.source.network",
      title: "Github",
      linkText: "Contritube to Source"
    },
    {
      link: "https://x.com/sourcenetwrk",
      title: "Twitter",
      linkText: "Follow us on Twitter"
    },
    {
      link: "https://t.me/source_network",
      title: "Telegram",
      linkText: "Join the chat"
    }
  ]

  return (
    <div className={clsx("spacing-horz block-section", styles.community)}>
      <h2>Join Our Community</h2>
      <p>Engage with our developer community and the Source team to get help, exchange ideas & collaborate.</p>
      <div className={clsx('row', styles.communityLinks)}>
        {links.map((lnk, i) => {
          return <div key={i} className={clsx('col col--3')}>
            <Link className={styles.communityLink} to={lnk.link}>
              <div>
                <h3>{lnk.title}</h3>
                <p>{lnk.linkText} <IconThemeArrow className={styles.arrow} dir='right' /></p>
              </div>
            </Link>
          </div>
        })}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Layout
      title="Home"
      description="Source Network Developer Documentation">
      <Head>
        <html className="home-page" />
      </Head>

      <div className={styles.homeWrapper}>
        <HomepageHeader />
        <main>
          <HomepageFeatures />
          <HomepageReferenceLinks />
          <HomepageCommunity />
        </main>
      </div>
    </Layout>
  );
}
