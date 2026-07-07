import React from 'react';

interface NewsBodyProps {
  html: string;
}

const newsBodyStyles = `
  .news-body {
    width: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
    font-weight: 700;
  }

  .news-body h1 { font-size: 24px; font-weight: 700; margin: 0 0 16px 0; color: #000; }
  .news-body p { font-size: 16px; font-weight: 700; margin: 0 0 12px 0; color: #333; }

  .news-body ul, .news-body ol { margin: 12px 0; }
  .news-body ol { list-style-type: decimal; padding-left: 28px; }
  .news-body ul { list-style-type: disc; padding-left: 28px; }
  .news-body li { margin: 4px 0; display: list-item; font-weight: 700; }

  .news-body [data-type="taskList"] {
    list-style: none;
    padding-left: 0;
    margin-left: 0;
  }

  .news-body [data-type="taskItem"] {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin: 8px 0;
  }

  .news-body [data-type="taskItem"] label {
    display: flex;
    align-items: center;
  }

  .news-body [data-type="taskItem"] input[type="checkbox"] {
    transform: scale(1.1);
    margin-top: 3px;
  }

  .news-body [data-type="taskItem"] div p {
    margin: 0;
  }
`;

const NewsBody: React.FC<NewsBodyProps> = ({ html }) => {
  return (
    <>
      <style>{newsBodyStyles}</style>
      <div
        className="news-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
};

export default NewsBody;
