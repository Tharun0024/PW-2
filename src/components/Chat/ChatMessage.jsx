/**
 * @file A single message in the chat window.
 */
import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';

/**
 * ChatMessage component displays a single message from either the user or the model.
 * @param {{
 *  message: string,
 *  sender: 'user' | 'model'
 * }} props - The props for the component.
 * @returns {React.ReactElement} - The ChatMessage component.
 */
const ChatMessage = ({ message, sender }) => {
  const isUser = sender === 'user';
  const messageClasses = twMerge(
    'p-3 rounded-lg max-w-lg mb-2',
    isUser ? 'bg-primary text-white self-end' : 'bg-gray-200 text-gray-800 self-start'
  );

  return (
    <div
      role="listitem"
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      aria-label={`Message from ${sender}`}
    >
      <div className={messageClasses}>
        <p>{message}</p>
      </div>
    </div>
  );
};

ChatMessage.propTypes = {
  message: PropTypes.string.isRequired,
  sender: PropTypes.oneOf(['user', 'model']).isRequired,
};

export default ChatMessage;
