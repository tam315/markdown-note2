import React, { useEffect } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import { useHistory } from '@docusaurus/router';

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const history = useHistory();

  useEffect(() => {
    // トップページは基本的に見せない
    history.replace('/about');
  }, []);

  return <Layout description={siteConfig.tagline}></Layout>;
}
