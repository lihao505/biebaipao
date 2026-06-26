import { Bot, User } from 'lucide-react';
import type { CoachMessage as CoachMessageType } from '../lib/mockCoach';

interface CoachMessageProps {
  message: CoachMessageType;
}

export default function CoachMessage({ message }: CoachMessageProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end animate-msg-in">
        <div className="flex items-start gap-2 max-w-[80%]">
          <div className="bg-brand-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-md text-sm leading-relaxed">
            {message.content}
          </div>
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-brand-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start animate-msg-in">
      <div className="flex items-start gap-2 max-w-[88%]">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0">
          <Bot size={16} className="text-white" />
        </div>
        <div className="space-y-2 flex-1">
          <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-md text-sm text-gray-800 leading-relaxed shadow-sm">
            {message.stage && (
              <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-brand-600">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                {message.stage}
              </div>
            )}
            <p>{message.suggestion || message.content}</p>
            {message.notes && (
              <div className="mt-2.5 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-700 leading-relaxed">
                {message.notes}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CoachTypingIndicator() {
  return (
    <div className="flex justify-start animate-msg-in">
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0">
          <Bot size={16} className="text-white" />
        </div>
        <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-md shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">AI 正在分析</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
