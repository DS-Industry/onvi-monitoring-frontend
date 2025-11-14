import React, { useMemo } from 'react';
import ejs from 'ejs';
import phoneFrameImage from '@/assets/iphone.png';
import iphoneMainImage from '@/assets/iphone-main.png';

import iphonePromoDefaultImage from '@/assets/iphone-promo-default-image.png';
import iphonePromoImage from '@/assets/iphone-promo.png';

interface PhonePreviewProps {
    content: string;
    bannerImage?: string | null;
    type?: 'main' | 'news' | 'promocode';
    maxHeight?: string;
}

const newsTemplate = `
<div class="news-body">
  <%- content %>
</div>
`;

const PhonePreview: React.FC<PhonePreviewProps> = ({
    content,
    bannerImage,
    type = 'news',
}) => {
    const frameImage = type === 'main' ? iphoneMainImage : type === 'promocode' ? iphonePromoImage : phoneFrameImage;

    const phoneFrameStyle = useMemo(() => {
        return {
            position: 'relative' as const,
            width: '375px',
            maxWidth: '100%',
            height: '812px',
            backgroundImage: `url(${frameImage})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat' as const,
            backgroundPosition: 'center',
        };
    }, [frameImage]);

    const bannerStyleMain = useMemo(() => {
        return {
            position: 'absolute' as const,
            top: '27%',
            left: '30px',
            right: '30px',
            height: '180px',
            borderRadius: '12px',
            overflow: 'hidden' as const,
            zIndex: 2,
            marginLeft: "7px",
            marginRight: "7px",
        };
    }, []);

    const bannerStyleNews = useMemo(() => {
        return {
            width: '100%',
            height: '180px',
            borderRadius: '12px',
            overflow: 'hidden' as const,
            marginBottom: '16px',
        };
    }, []);

    const bottomSheetStyle = useMemo(() => {
        return {
            position: 'absolute' as const,
            bottom: 0,
            left: 0,
            right: 0,
            top: '18%',
            backgroundColor: '#fff',
            borderTopLeftRadius: '30px',
            borderTopRightRadius: '30px',
            padding: '20px 16px',
            overflowY: 'auto' as const,
            margin: '0 30px',
            maxHeight: '70%',
            zIndex: 1,
        };
    }, []);

    const renderedContent = useMemo(() => {
        try {
            return ejs.render(newsTemplate, {
                content,
            });
        } catch (error) {
            console.error('Error rendering EJS template:', error);
            return '<div>Error rendering content</div>';
        }
    }, [content]);

    const BannerImage = ({ style }: { style: React.CSSProperties }) => (
        <div style={style}>
            <img
                src={bannerImage ? bannerImage : iphonePromoDefaultImage}
                alt="Banner"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
                onError={() => {
                    console.error('Banner image failed to load:', bannerImage);
                }}
                onLoad={() => {
                    console.log('Banner image loaded successfully');
                }}
            />
        </div>
    );

    return (
        <div style={phoneFrameStyle}>
            {type === 'main' ? (
                <BannerImage style={bannerStyleMain} />
            ) : (
                <div style={bottomSheetStyle}>
                    <BannerImage style={bannerStyleNews} />
                    <style>{`
              .news-body {
                width: 100%;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .news-body h1 {
                font-size: 24px;
                font-weight: 700;
                margin: 0 0 16px 0;
                color: #000;
              }
              .news-body p {
                font-size: 16px;
                margin: 0 0 12px 0;
                color: #333;
              }
              .news-body strong {
                font-weight: 600;
              }
              .news-body em {
                font-style: italic;
              }
              .news-body u {
                text-decoration: underline;
              }
              .news-body ul, .news-body ol {
                margin: 12px 0;
                padding-left: 24px;
              }
              .news-body li {
                margin: 4px 0;
              }
            `}</style>
                    <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
                </div>
            )}
        </div>
    );
};

export default PhonePreview;

