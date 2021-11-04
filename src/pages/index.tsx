import { FiCalendar, FiUser } from 'react-icons/fi';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import Link from 'next/link';

import { useState } from 'react';
import Head from 'next/head';
import { getPrismicClient } from '../services/prismic';

import Header from '../components/Header';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { PreviewButton } from '../components/PreviewButton';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  page: number;
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  const formattedPost = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
    };
  });

  const [posts, setPosts] = useState<Post[]>(formattedPost);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [currentPage, setCurrentPage] = useState(1);

  async function handleNextPage(): Promise<void> {
    if (currentPage !== 1 && nextPage === null) {
      return;
    }

    const postsResults = await fetch(`${nextPage}`).then(response =>
      response.json()
    );

    setNextPage(postsResults.next_page);
    setCurrentPage(postsResults.page);

    const newPosts = postsResults.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM yyyy',
          {
            locale: ptBR,
          }
        ),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    setPosts([...posts, ...newPosts]);

    // console.log(nextPage);
  }

  return (
    <>
      <Head>
        <title>Spacetraveling | Home</title>
      </Head>
      <Header />
      <main className={commonStyles.container}>
        <div className={styles.posts}>
          {posts.map(result => (
            <Link href={`/post/${result.uid}`} key={result.uid}>
              <a className={styles.post}>
                <strong>{result.data.title}</strong>
                <p>{result.data.subtitle}</p>
                <ul>
                  <li>
                    <FiCalendar />
                    {result.first_publication_date}
                  </li>
                  <li>
                    <FiUser />
                    {result.data.author}
                  </li>
                </ul>
              </a>
            </Link>
          ))}

          {nextPage && (
            <button type="button" onClick={handleNextPage}>
              Carregar mais posts
            </button>
          )}
        </div>
        {preview && <PreviewButton />}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
    }
  );

  // console.log(JSON.stringify(postsResponse, null, 2));

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });
  // console.log(results);
  // console.log(JSON.stringify(results, null, 2));

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  // console.log(JSON.stringify(pages, null, 2));

  return {
    props: { postsPagination, preview },
  };
};
