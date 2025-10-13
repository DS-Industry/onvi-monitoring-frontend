import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Avatar, Upload, Tooltip, Spin } from 'antd';
import { 
  PaperClipOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import TipTapEditor from '@/components/ui/Input/TipTapEditor';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { 
  getTechTaskComments, 
  createTechTaskComment
} from '@/services/api/equipment';
import { getPresignedUploadUrl, uploadFileToS3 } from '@/services/api/s3';
import { useToast } from '@/hooks/useToast';
import dayjs from 'dayjs';

interface TechTaskCommentsProps {
  techTaskId?: number;
}

const TechTaskComments: React.FC<TechTaskCommentsProps> = ({ techTaskId }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  const { data: comments, isLoading, mutate } = useSWR(
    techTaskId ? ['tech-task-comments', techTaskId] : null,
    () => getTechTaskComments(techTaskId!),
    { revalidateOnFocus: false }
  );

  const { trigger: createComment } = useSWRMutation(
    ['create-tech-task-comment'],
    async (_, { arg }: { arg: { techTaskId: number; content: string; imageUrl?: string } }) => {
      return createTechTaskComment(arg.techTaskId, {
        content: arg.content,
        imageUrl: arg.imageUrl
      });
    }
  );

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !techTaskId) return;
    
    setIsSubmitting(true);
    try {
      await createComment({
        techTaskId,
        content: newComment,
        imageUrl
      });
      
      setNewComment('');
      setImageUrl(undefined);
      showToast(t('techTasks.createSuccess') || 'Comment created successfully', 'success');
      
      mutate();
    } catch (error) {
      console.error('Failed to submit comment:', error);
      showToast(t('techTasks.createError') || 'Failed to create comment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!techTaskId) return false;
    
    setUploadingImage(true);
    try {
      const timestamp = Date.now();
      const key = `tech-task/${techTaskId}/comments/${timestamp}-${file.name}`;
      
      const { url } = await getPresignedUploadUrl(key);
      
      await uploadFileToS3(file, url);
      
      const s3Url = `${import.meta.env.VITE_S3_CLOUD}/${key}`;
      setImageUrl(s3Url);
      
      showToast(t('techTasks.imageUploadSuccess') || 'Image uploaded successfully', 'success');
      return false; 
    } catch (error) {
      console.error('Failed to upload image:', error);
      showToast(t('techTasks.imageUploadError') || 'Failed to upload image', 'error');
      return false;
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setImageUrl(undefined);
  };

  const getAvatarColor = (name: string) => {
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
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatTimestamp = (date: Date) => {
    return dayjs(date).format('HH:mm');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-3 mb-6">
        
          <div className="mb-3">
            <TipTapEditor
              value={newComment}
              onChange={setNewComment}
              autoResize
            />
          </div>

          {imageUrl && (
            <div className="mb-3 relative inline-block">
              <img 
                src={imageUrl} 
                alt="Uploaded image"
                className="w-32 h-24 object-cover rounded border border-gray-200"
              />
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white hover:bg-red-600"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tooltip title="Attach file">
                <Upload
                  showUploadList={false}
                  beforeUpload={handleImageUpload}
                  accept="image/*"
                >
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<PaperClipOutlined />}
                    className="hover:bg-gray-100"
                    loading={uploadingImage}
                  />
                </Upload>
              </Tooltip>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                type="primary"
                onClick={handleSubmitComment}
                loading={isSubmitting}
                disabled={!newComment.trim()}
              >
                {t('techTasks.send')}
              </Button>
            </div>
          </div>
        </div>
      

      <div className="flex-1 overflow-y-auto">
        <Spin spinning={isLoading}>
          <div className="space-y-4">
            {comments && comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar 
                    size={40}
                    className={`${getAvatarColor(comment.author.firstName)} text-white font-medium`}
                  >
                    {getInitials(comment.author.firstName, comment.author.lastName)}
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {comment.author.firstName} {comment.author.lastName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatTimestamp(comment.createdAt)}
                      </span>
                    </div>
                    
                    <div className="text-gray-700 mb-2">
                      {comment.content}
                    </div>
                    
                    {comment.imageUrl && (
                      <div className="mt-2">
                        <img 
                          src={
                            comment.imageUrl.startsWith('http://') || comment.imageUrl.startsWith('https://')
                              ? comment.imageUrl
                              : `${import.meta.env.VITE_S3_CLOUD}/${comment.imageUrl}`
                          }
                          alt="Comment attachment"
                          className="w-32 h-24 object-cover rounded border border-gray-200"
                          onError={(e) => {
                            console.error('Image failed to load:', comment.imageUrl);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              !isLoading && (
                <div className="text-center text-gray-500 py-8">
                  {t('techTasks.noComments') || 'No comments yet'}
                </div>
              )
            )}
          </div>
        </Spin>
      </div>
    </div>
  );
};

export default TechTaskComments;
