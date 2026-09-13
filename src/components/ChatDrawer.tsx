import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  MessageSquare,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  LogIn,
  ChevronLeft,
  Clock,
  ShieldCheck,
  Circle
} from 'lucide-react';
import { ChatConversation, ChatMessage, Listing } from '../types';
import {
  subscribeUserConversations,
  subscribeMessages,
  startOrGetConversation,
  sendChatMessage
} from '../services/chat';
import { auth, signInWithGoogle } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { formatLKR } from './ListingsSection';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  targetListing?: Listing | null;
  onSelectListing?: (listingId: string) => void;
}

const QUICK_PROMPTS = [
  'Is this still available?',
  'What is your lowest price for quick cash?',
  'Can I inspect the item in person?',
  'Where in Sri Lanka are you located?',
];

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  targetListing,
  onSelectListing,
}) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Monitor Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // Listen to user conversations when authenticated
  useEffect(() => {
    if (!currentUser) {
      setConversations([]);
      return;
    }

    const unsub = subscribeUserConversations(
      currentUser.uid,
      (convList) => {
        setConversations(convList);
      },
      (err) => {
        console.error('Error listening to conversations:', err);
      }
    );

    return () => unsub();
  }, [currentUser]);

  // Handle target listing if opened from an ad modal
  useEffect(() => {
    if (!isOpen || !targetListing || !currentUser) return;

    let isMounted = true;
    startOrGetConversation(targetListing, {
      id: currentUser.uid,
      name: currentUser.displayName || currentUser.email || 'Buyer',
    })
      .then((id) => {
        if (isMounted) setActiveConvId(id);
      })
      .catch((err) => {
        console.error('Could not start conversation:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, targetListing, currentUser]);

  // Listen to messages for active conversation
  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }

    const unsub = subscribeMessages(
      activeConvId,
      (msgList) => {
        setMessages(msgList);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      },
      (err) => {
        console.error('Error fetching messages:', err);
      }
    );

    return () => unsub();
  }, [activeConvId]);

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeConvId || !currentUser || isSending) return;

    setIsSending(true);
    try {
      await sendChatMessage(
        activeConvId,
        {
          id: currentUser.uid,
          name: currentUser.displayName || currentUser.email || 'Member',
        },
        text
      );
      setInputText('');
    } catch (err) {
      console.error('Failed to send chat message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setAuthError(err?.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setIsSigningIn(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-gray-200"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-[#111217] text-white flex items-center justify-between border-b border-[#2D2F39]">
              <div className="flex items-center gap-3">
                {activeConvId && conversations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setActiveConvId(null)}
                    className="p-1 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <div className="w-9 h-9 rounded-xl bg-[#181920] border border-[#2D2F39] flex items-center justify-center text-[#FF5A36]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                      HUTA Live Chat
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded-full border border-emerald-800/60">
                      <Circle className="w-1.5 h-1.5 fill-current animate-pulse" />
                      Firebase
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Real-time buyer & seller messaging</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main Content Area */}
            {!currentUser ? (
              /* Auth Required Prompt */
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF5A36] mb-4">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-extrabold text-[#111217]">
                  Sign In to Start Live Chat
                </h4>
                <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-xs leading-relaxed">
                  Connect your Google account to chat securely with sellers, make offers, and get real-time instant alerts.
                </p>

                {authError && (
                  <div className="mt-3 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg max-w-xs">
                    {authError}
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  disabled={isSigningIn}
                  onClick={handleGoogleSignIn}
                  className="mt-6 flex items-center justify-center gap-3 w-full max-w-xs px-5 py-3 rounded-xl bg-[#111217] text-white font-bold text-sm shadow-md hover:bg-black transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
                </motion.button>
              </div>
            ) : !activeConvId ? (
              /* Conversations List View */
              <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                      Your Conversations ({conversations.length})
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      Signed in as {currentUser.displayName || currentUser.email}
                    </span>
                  </div>
                </div>

                {conversations.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="font-bold text-gray-700">No active chats yet</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs">
                      Click "Chat with Seller" on any ad listing to start an instant real-time conversation!
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {conversations.map((conv) => (
                      <button
                        type="button"
                        key={conv.id}
                        onClick={() => setActiveConvId(conv.id)}
                        className="w-full text-left p-4 hover:bg-orange-50/40 transition-colors flex items-start gap-3 group"
                      >
                        {conv.listingImage ? (
                          <img
                            src={conv.listingImage}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-400">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-bold text-sm text-[#111217] truncate group-hover:text-[#FF5A36] transition-colors">
                              {conv.listingTitle}
                            </h4>
                          </div>
                          {conv.listingPrice ? (
                            <p className="text-xs font-bold text-[#FF5A36]">
                              {formatLKR(conv.listingPrice)}
                            </p>
                          ) : null}
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {conv.lastMessage || 'Open chat'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Active Chat Conversation View */
              <div className="flex-1 flex flex-col min-h-0 bg-[#F8F9FA]">
                {/* Listing Pin Banner */}
                {activeConversation && (
                  <div className="p-3 bg-white border-b border-gray-200 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {activeConversation.listingImage && (
                        <img
                          src={activeConversation.listingImage}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 truncate">
                          {activeConversation.listingTitle}
                        </h4>
                        {activeConversation.listingPrice ? (
                          <span className="text-xs font-extrabold text-[#FF5A36]">
                            {formatLKR(activeConversation.listingPrice)}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {onSelectListing && (
                      <button
                        type="button"
                        onClick={() => onSelectListing(activeConversation.listingId)}
                        className="shrink-0 p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors text-xs flex items-center gap-1 font-semibold"
                        title="View ad details"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Ad Details</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Message Log */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-10 h-10 rounded-full bg-orange-100 text-[#FF5A36] flex items-center justify-center mx-auto mb-2">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-gray-600">
                        Start your conversation with the seller!
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Messages are delivered instantly via Firebase Firestore.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === currentUser?.uid;
                      const timeString = msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '';

                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          {!isMe && (
                            <span className="text-[10px] font-bold text-gray-500 mb-0.5 ml-1">
                              {msg.senderName}
                            </span>
                          )}
                          <div
                            className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                              isMe
                                ? 'bg-[#111217] text-white rounded-br-xs'
                                : 'bg-white text-gray-900 border border-gray-200/90 rounded-bl-xs'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                            <div
                              className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                                isMe ? 'text-gray-400' : 'text-gray-400'
                              }`}
                            >
                              <Clock className="w-2.5 h-2.5" />
                              <span>{timeString}</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts */}
                <div className="px-3 py-1.5 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      className="shrink-0 text-[11px] font-medium bg-gray-100 hover:bg-orange-50 hover:text-[#FF5A36] text-gray-700 px-2.5 py-1 rounded-full border border-gray-200/70 transition-colors whitespace-nowrap"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-3 bg-white border-t border-gray-200 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    maxLength={2000}
                    className="flex-1 bg-gray-100 border border-gray-200 focus:border-[#FF5A36] focus:bg-white text-gray-900 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 outline-hidden transition-all"
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!inputText.trim() || isSending}
                    className="w-10 h-10 rounded-xl bg-[#FF5A36] hover:bg-[#E04826] text-white flex items-center justify-center shrink-0 shadow-md transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
