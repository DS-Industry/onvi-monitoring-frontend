import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR, { mutate } from 'swr';
import { Button, Empty, Input, Popconfirm, Skeleton, Space } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  createClientNote,
  deleteClientNote,
  getClientNotes,
  type ClientNote,
  updateClientNote,
} from '@/services/api/marketing';
import { usePermissions } from '@/hooks/useAuthStore';
import hasPermission from '@/permissions/hasPermission';
import { useToast } from '@/components/context/useContext';
import { cardPageSwr } from './cardPageSwr';

type CardNotesTabProps = {
  clientId?: number;
};

function authorLabel(note: ClientNote): string {
  const name = note.author?.name?.trim() || '';
  const surname = note.author?.surname?.trim() || '';
  const full = `${name} ${surname}`.trim();
  return full || '—';
}

function formatNoteDate(value: string): string {
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('DD.MM.YYYY HH:mm') : '—';
}

const CardNotesTab: React.FC<CardNotesTabProps> = ({ clientId }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const userPermissions = usePermissions();
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [updating, setUpdating] = useState(false);

  const canUpdate = hasPermission(
    [
      { action: 'update', subject: 'LTYProgram' },
      { action: 'manage', subject: 'LTYProgram' },
    ],
    userPermissions
  );

  const { data: notes, isLoading } = useSWR(
    clientId ? ['get-client-notes', clientId] : null,
    ([, id]) => getClientNotes(id),
    cardPageSwr
  );

  const refreshNotes = () => {
    if (clientId) {
      mutate(['get-client-notes', clientId]);
    }
  };

  const handleCreate = async () => {
    if (!clientId) return;
    const content = draft.trim();
    if (!content) return;
    setSaving(true);
    try {
      await createClientNote(clientId, content);
      setDraft('');
      showToast(t('success.recordCreated'), 'success');
      refreshNotes();
    } catch {
      showToast(t('errors.createFailed') || t('common.somethingWentWrong'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (note: ClientNote) => {
    setEditingId(note.id);
    setEditDraft(note.content);
  };

  const handleUpdate = async (noteId: number) => {
    if (!clientId) return;
    const content = editDraft.trim();
    if (!content) return;
    setUpdating(true);
    try {
      await updateClientNote(clientId, noteId, content);
      setEditingId(null);
      setEditDraft('');
      showToast(t('success.recordUpdated'), 'success');
      refreshNotes();
    } catch {
      showToast(t('errors.updateFailed') || t('common.somethingWentWrong'), 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (noteId: number) => {
    if (!clientId) return;
    try {
      await deleteClientNote(clientId, noteId);
      if (editingId === noteId) {
        setEditingId(null);
        setEditDraft('');
      }
      showToast(t('success.recordDeleted'), 'success');
      refreshNotes();
    } catch {
      showToast(t('errors.deleteFailed'), 'error');
    }
  };

  if (!clientId) {
    return (
      <div className="py-10">
        <Empty description={t('marketing.noClientAttached')} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {canUpdate && (
        <div className="space-y-2">
          <Input.TextArea
            rows={3}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder={t('marketing.notePlaceholder')}
          />
          <div className="flex justify-end">
            <Button
              type="primary"
              loading={saving}
              disabled={!draft.trim()}
              onClick={handleCreate}
            >
              {t('marketing.addNote')}
            </Button>
          </div>
        </div>
      )}

      {isLoading && !notes ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : !notes?.length ? (
        <Empty description={t('marketing.noNotes')} />
      ) : (
        <div className="space-y-3">
          {notes.map(note => {
            const isEdited =
              note.updatedAt &&
              note.createdAt &&
              dayjs(note.updatedAt).valueOf() !== dayjs(note.createdAt).valueOf();
            const isEditing = editingId === note.id;

            return (
              <div
                key={note.id}
                className="rounded-xl border border-gray-100 p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-xs text-text02">
                    <span className="font-medium text-text01">
                      {authorLabel(note)}
                    </span>
                    {' · '}
                    {formatNoteDate(note.createdAt)}
                    {isEdited
                      ? ` · ${t('marketing.noteEdited')} ${formatNoteDate(note.updatedAt)}`
                      : null}
                  </div>
                  {canUpdate && !isEditing && (
                    <Space size={0}>
                      <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => startEdit(note)}
                      >
                        {t('actions.edit')}
                      </Button>
                      <Popconfirm
                        title={t('techTasks.confirmDelete')}
                        onConfirm={() => handleDelete(note.id)}
                      >
                        <Button
                          type="link"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                        >
                          {t('common.delete')}
                        </Button>
                      </Popconfirm>
                    </Space>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <Input.TextArea
                      rows={3}
                      value={editDraft}
                      onChange={e => setEditDraft(e.target.value)}
                    />
                    <Space className="flex justify-end w-full">
                      <Button
                        onClick={() => {
                          setEditingId(null);
                          setEditDraft('');
                        }}
                        disabled={updating}
                      >
                        {t('actions.cancel')}
                      </Button>
                      <Button
                        type="primary"
                        loading={updating}
                        disabled={!editDraft.trim()}
                        onClick={() => handleUpdate(note.id)}
                      >
                        {t('actions.save')}
                      </Button>
                    </Space>
                  </div>
                ) : (
                  <div className="text-sm text-text01 whitespace-pre-wrap">
                    {note.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CardNotesTab;
