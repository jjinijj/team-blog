import { DraftData } from '../utils/draftUtils';

interface DraftRecoveryBannerProps {
  draftData: DraftData | null;
  visible: boolean;
  onRestore: () => void;
  onDismiss: () => void;
}

const formatSavedAt = (savedAt: string): string => {
  const diff = Date.now() - new Date(savedAt).getTime();
  const minutes = Math.floor(diff / 1000 / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  return `${days}일 전`;
};

export const DraftRecoveryBanner = ({
  draftData,
  visible,
  onRestore,
  onDismiss,
}: DraftRecoveryBannerProps) => {
  return (
    <div
      className={`bg-blue-100 dark:bg-blue-950 border-b border-blue-300 dark:border-blue-800 px-6 py-3 flex items-center justify-between shrink-0 w-full transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">info</span>
        <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
          {draftData && (
            <>이어서 쓸 수 있는 내용이 있어요. <span className="font-semibold">{formatSavedAt(draftData.savedAt)}</span></>
          )}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onDismiss}
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors uppercase tracking-wider"
        >
          무시
        </button>
        <button
          onClick={onRestore}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors"
        >
          이어쓰기
        </button>
      </div>
    </div>
  );
};

export default DraftRecoveryBanner;