import { 
  FiCheck, 
  FiArchive, 
  FiUserPlus, 
  FiUserMinus, 
  FiEye, 
  FiEyeOff, 
//   FiBlock, 
  FiUnlock,
  FiUser,
  FiUserCheck,
  FiEdit,
  FiTrash2,
  FiSend,
  FiPackage,
  FiPlay,
  FiMessageSquare
} from 'react-icons/fi';

import { MdBlock } from "react-icons/md";

/**
 * Conversation Actions component for profile panel
 * 
 * @param {Object} props - Component props
 * @param {Object} props.actions - Action handlers
 * @returns {JSX.Element} Conversation actions component
 */
const ConversationActions = ({ actions = {} }) => {
  const actionButtons = [
    {
      id: 'markRead',
      label: 'Mark as Read',
      icon: FiCheck,
      handler: actions.markRead,
      color: 'text-green-600',
      bgColor: 'bg-transparent',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      id: 'markUnread',
      label: 'Mark as Unread',
      icon: FiEyeOff,
      handler: actions.markUnread,
      color: 'text-[#05a6f4]',
      bgColor: 'bg-transparent',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: FiArchive,
      handler: actions.archive,
      color: 'text-[#ff8a0e]',
      bgColor: 'bg-transparent',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      id: 'unarchive',
      label: 'Unarchive',
      icon: FiArchive,
      handler: actions.unarchive,
      color: 'text-[#ff8a0e]',
      bgColor: 'bg-transparent',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      id: 'follow',
      label: 'Follow',
      icon: FiUserPlus,
      handler: actions.follow,
      color: 'text-purple-600',
      bgColor: 'bg-transparent',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      id: 'unfollow',
      label: 'Unfollow',
      icon: FiUserMinus,
      handler: actions.unfollow,
      color: 'text-purple-600',
      bgColor: 'bg-transparent',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      id: 'block',
      label: 'Block',
      icon: MdBlock,
      handler: actions.block,
      color: 'text-red-600',
      bgColor: 'bg-transparent',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      id: 'unblock',
      label: 'Unblock',
      icon: FiUnlock,
      handler: actions.unblock,
      color: 'text-red-600',
      bgColor: 'bg-transparent',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      id: 'assign',
      label: 'Assign',
      icon: FiUserCheck,
      handler: actions.assign,
      color: 'text-[#05a6f4]',
      bgColor: 'bg-transparent',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      id: 'unassign',
      label: 'Unassign',
      icon: FiUser,
      handler: actions.unassign,
      color: 'text-[#05a6f4]',
      bgColor: 'bg-transparent',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      id: 'liveToHuman',
      label: 'Live to Human',
      icon: FiUser,
      handler: actions.liveToHuman,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100'
    },
    {
      id: 'liveToBot',
      label: 'Live to Bot',
      icon: FiMessageSquare,
      handler: actions.liveToBot,
      color: 'text-[#05a6f4]',
      bgColor: 'bg-transparent',
      hoverColor: 'hover:bg-gray-50'
    }
  ];

  const advancedActions = [
    {
      id: 'addNote',
      label: 'Add Note',
      icon: FiEdit,
      handler: actions.addNote,
      color: 'text-gray-600',
      bgColor: 'bg-transparent',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      id: 'updateNote',
      label: 'Update Note',
      icon: FiEdit,
      handler: actions.updateNote,
      color: 'text-gray-600',
      bgColor: 'bg-transparent',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      id: 'deleteNote',
      label: 'Delete Note',
      icon: FiTrash2,
      handler: actions.deleteNote,
      color: 'text-red-600',
      bgColor: 'bg-transparent',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      id: 'requestAiSuggestion',
      label: 'AI Suggestion',
      icon: FiMessageSquare,
      handler: actions.requestAiSuggestion,
      color: 'text-purple-600',
      bgColor: 'bg-transparent',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      id: 'sendFlow',
      label: 'Send Flow',
      icon: FiPlay,
      handler: actions.sendFlow,
      color: 'text-[#05a6f4]',
      bgColor: 'bg-transparent',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      id: 'sendStep',
      label: 'Send Step',
      icon: FiSend,
      handler: actions.sendStep,
      color: 'text-[#05a6f4]',
      bgColor: 'bg-transparent',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      id: 'sendProducts',
      label: 'Send Products',
      icon: FiPackage,
      handler: actions.sendProducts,
      color: 'text-green-600',
      bgColor: 'bg-transparent',
      hoverColor: 'hover:bg-gray-50'
    }
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Basic Actions */}
        <div className="space-y-1">
          {actionButtons.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.handler}
                className={`w-full flex items-center gap-3 p-3 transition-colors ${action.bgColor} ${action.color} ${action.hoverColor}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            );
          })}
        </div>

        {/* Advanced Actions */}
        <div>
          <h4 className="font-semibold mb-3 text-black text-base">Advanced Actions</h4>
          <div className="space-y-1">
            {advancedActions.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={action.handler}
                  className={`w-full flex items-center gap-3 p-3 transition-colors ${action.bgColor} ${action.color} ${action.hoverColor}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationActions;
