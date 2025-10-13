import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Avatar, Upload, Tooltip } from 'antd';
import { 
  BoldOutlined, 
  ItalicOutlined, 
  UnderlineOutlined, 
  StrikethroughOutlined,
  CheckSquareOutlined,
  MoreOutlined,
  PaperClipOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import TipTapEditor from '@/components/ui/Input/TipTapEditor';

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
    initials: string;
  };
  timestamp: string;
  content: string;
  attachments?: string[];
}

interface TechTaskCommentsProps {
  techTaskId?: number;
}

const TechTaskComments: React.FC<TechTaskCommentsProps> = ({ techTaskId }) => {
  const { t } = useTranslation();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [comments] = useState<Comment[]>([
    {
      id: '1',
      author: {
        name: 'Евгения Жальская',
        avatar: '',
        initials: 'ЕЖ'
      },
      timestamp: '16:41',
      content: 'Не могу проверить уровень химии',
      attachments: ['chemical-shelf.jpg']
    },
    {
      id: '2',
      author: {
        name: 'Иванов Иван',
        avatar: '',
        initials: 'ИИ'
      },
      timestamp: '16:43',
      content: 'А ты возьми и проверь'
    }
  ]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      console.log('Submitting comment:', newComment);
      setNewComment('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelComment = () => {
    setNewComment('');
  };

  const getAvatarColor = (initials: string) => {
    const colors = [
      'bg-lime-400',
      'bg-blue-400', 
      'bg-purple-400',
      'bg-pink-400',
      'bg-green-400',
      'bg-yellow-400',
      'bg-red-400',
      'bg-indigo-400'
    ];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-3 mb-6">
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
            <Tooltip title="Bold">
              <Button 
                type="text" 
                size="small" 
                icon={<BoldOutlined />}
                className="hover:bg-gray-100"
              />
            </Tooltip>
            <Tooltip title="Italic">
              <Button 
                type="text" 
                size="small" 
                icon={<ItalicOutlined />}
                className="hover:bg-gray-100"
              />
            </Tooltip>
            <Tooltip title="Underline">
              <Button 
                type="text" 
                size="small" 
                icon={<UnderlineOutlined />}
                className="hover:bg-gray-100"
              />
            </Tooltip>
            <Tooltip title="Strikethrough">
              <Button 
                type="text" 
                size="small" 
                icon={<StrikethroughOutlined />}
                className="hover:bg-gray-100"
              />
            </Tooltip>
            <Tooltip title="Checkbox">
              <Button 
                type="text" 
                size="small" 
                icon={<CheckSquareOutlined />}
                className="hover:bg-gray-100"
              />
            </Tooltip>
            <Tooltip title="More options">
              <Button 
                type="text" 
                size="small" 
                icon={<MoreOutlined />}
                className="hover:bg-gray-100"
              />
            </Tooltip>
          </div>

          <div className="mb-3">
            <TipTapEditor
              value={newComment}
              onChange={setNewComment}
              autoResize
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tooltip title="Attach file">
                <Upload
                  showUploadList={false}
                  beforeUpload={() => false}
                >
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<PaperClipOutlined />}
                    className="hover:bg-gray-100"
                  />
                </Upload>
              </Tooltip>
              <Tooltip title="View history">
                <Button 
                  type="text" 
                  size="small" 
                  icon={<ClockCircleOutlined />}
                  className="hover:bg-gray-100"
                />
              </Tooltip>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleCancelComment}
                className="border-gray-300 text-gray-600 hover:border-gray-400"
              >
                {t('common.cancel')}
              </Button>
              <Button 
                type="primary"
                onClick={handleSubmitComment}
                loading={isSubmitting}
                disabled={!newComment.trim()}
              >
                {t('common.send')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar 
                size={40}
                className={`${getAvatarColor(comment.author.initials)} text-white font-medium`}
              >
                {comment.author.initials}
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {comment.author.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {comment.timestamp}
                  </span>
                </div>
                
                <div className="text-gray-700 mb-2">
                  {comment.content}
                </div>
                
                {comment.attachments && comment.attachments.length > 0 && (
                  <div className="mt-2">
                    {comment.attachments.map((attachment, index) => (
                      <div key={index} className="inline-block">
                        <img 
                          src={`/api/placeholder/200/150`} 
                          alt="Attachment"
                          className="w-32 h-24 object-cover rounded border border-gray-200"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechTaskComments;
